import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(product_id: number, user_id: number, isElse?: boolean) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user_id } },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    const product = await this.productRepository.findOne({
      where: { id: product_id },
      select: [
        'id',
        'name',
        'image',
        'description',
        'quantity',
        'price',
        'price_after_discount',
      ],
    });

    if (!product) {
      throw new NotFoundException('Not Found Product');
    }

    if (product.quantity <= 0) {
      throw new NotFoundException('Not Found quantity on this product');
    }

    if (cart) {
      let productExists = false;

      const updatedCartItems =
        cart.cartitems?.map((item) => {
          if (item.productId === product_id) {
            productExists = true;
            return {
              ...item,
              quantity: item.quantity + 1,
              product: {
                id: product.id,
                name: product.name,
                image: product.image,
                description: product.description,
                price: product.price,
                price_after_discount: product.price_after_discount,
              },
            };
          }
          return item;
        }) || [];

      if (!productExists) {
        updatedCartItems.push({
          productId: product_id,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            image: product.image,
            description: product.description,
            price: product.price,
            price_after_discount: product.price_after_discount,
          },
        });
      }

      let totalPrice = 0;
      let totalPriceAfterDiscount = 0;

      for (const item of updatedCartItems) {
        const itemProduct =
          item.product ||
          (await this.productRepository.findOne({
            where: { id: item.productId },
          }));

        totalPrice += item.quantity * itemProduct.price;
        totalPriceAfterDiscount +=
          item.quantity *
          (itemProduct.price_after_discount || itemProduct.price);
      }

      cart.cartitems = updatedCartItems;
      cart.total_price = totalPrice;
      cart.total_price_after_discount = totalPriceAfterDiscount;

      await this.cartRepository.save(cart);

      if (isElse) {
        return cart;
      } else {
        return {
          status: 200,
          message: 'Created Cart and Insert Product',
          data: cart,
        };
      }
    } else {
      const newCart = this.cartRepository.create({
        cartitems: [],
        total_price: 0,
        user: { id: user_id },
      });
      await this.cartRepository.save(newCart);

      const inserProduct = await this.create(product_id, user_id, true);

      return {
        status: 200,
        message: 'Created Cart and Insert Product',
        data: inserProduct,
      };
    }
  }

  async applyCoupon(user_id: number, couponName: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user_id } },
      relations: ['user'],
    });

    const coupon = await this.couponRepository.findOne({
      where: { name: couponName },
    });

    if (!cart) {
      throw new NotFoundException('Not Found Cart');
    }

    if (!coupon) {
      throw new HttpException('Invalid coupon', 400);
    }

    const isExpired = new Date(coupon.expire_date) > new Date();
    if (!isExpired) {
      throw new HttpException('Coupon has expired', 400);
    }

    const ifCouponAlreadyUsed = cart.coupons?.some(
      (item) => item.name === couponName,
    );

    if (ifCouponAlreadyUsed) {
      throw new HttpException('Coupon already used', 400);
    }

    if (cart.total_price <= 0) {
      throw new HttpException('You have full discount', 400);
    }

    const updatedCoupons = [
      ...(cart.coupons || []),
      {
        name: coupon.name,
        couponId: coupon.id,
      },
    ];

    const newTotalpriceAfterDiscount =
      cart.total_price_after_discount - coupon.discount;

    await this.cartRepository.update(cart.id, {
      coupons: updatedCoupons,
      total_price_after_discount: newTotalpriceAfterDiscount,
    });

    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    return {
      status: 200,
      message: 'Coupon Applied',
      data: updatedCart,
    };
  }

  async findOne(user_id: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user_id } },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    if (!cart) {
      throw new NotFoundException(`You don't have a cart, please add products`);
    }

    if (cart.cartitems) {
      const productIds = cart.cartitems.map((item) => item.productId);
      const products = await this.productRepository.find({
        where: { id: In(productIds) },
        select: [
          'id',
          'name',
          'image',
          'description',
          'price',
          'price_after_discount',
        ],
      });

      cart.cartitems = cart.cartitems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          product: product
            ? {
                id: product.id,
                name: product.name,
                image: product.image,
                description: product.description,
                price: product.price,
                price_after_discount: product.price_after_discount,
              }
            : undefined,
        };
      });
    }

    if (cart.coupons?.length > 0) {
      const couponIds = cart.coupons.map((c) => c.couponId);
      const coupons = await this.couponRepository.findByIds(couponIds);

      const totalCouponDiscount = coupons.reduce(
        (sum, coupon) => sum + coupon.discount,
        0,
      );

      cart.total_price_after_discount = Math.max(
        0,
        (cart.total_price_after_discount || cart.total_price) -
          totalCouponDiscount,
      );
    }

    return {
      status: 200,
      message: 'Found Cart',
      data: cart,
    };
  }

  async remove(productId: number, user_id: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user_id } },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    if (!cart) {
      throw new NotFoundException('Not Found Cart');
    }

    const productIndex =
      cart.cartitems?.findIndex((item) => item.productId === productId) ?? -1;

    if (productIndex === -1) {
      throw new NotFoundException('Not Found any product in cart');
    }

    const updatedCartItems = [...(cart.cartitems || [])];
    const productItem = updatedCartItems[productIndex];

    if (productItem.quantity > 1) {
      updatedCartItems[productIndex] = {
        ...productItem,
        quantity: productItem.quantity - 1,
      };
    } else {
      updatedCartItems.splice(productIndex, 1);
    }

    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;
    let totalDiscountFromCoupons = 0;

    for (const item of updatedCartItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
        select: ['price', 'price_after_discount'],
      });

      if (product) {
        totalPrice += item.quantity * product.price;
        totalPriceAfterDiscount +=
          item.quantity * (product.price_after_discount || product.price);
      }
    }

    if (cart.coupons?.length > 0) {
      const couponIds = cart.coupons.map((c) => c.couponId);
      const coupons = await this.couponRepository.findByIds(couponIds);

      totalDiscountFromCoupons = coupons.reduce(
        (sum, coupon) => sum + coupon.discount,
        0,
      );
    }

    totalPriceAfterDiscount = Math.max(
      0,
      totalPriceAfterDiscount - totalDiscountFromCoupons,
    );

    await this.cartRepository.update(cart.id, {
      cartitems: updatedCartItems,
      total_price: totalPrice,
      total_price_after_discount: totalPriceAfterDiscount,
    });

    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    if (updatedCart?.cartitems) {
      const productIds = updatedCart.cartitems.map((item) => item.productId);
      const products = await this.productRepository.find({
        where: { id: In(productIds) },
        select: [
          'id',
          'name',
          'image',
          'description',
          'price',
          'price_after_discount',
        ],
      });

      updatedCart.cartitems = updatedCart.cartitems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          product: product
            ? {
                id: product.id,
                name: product.name,
                image: product.image,
                description: product.description,
                price: product.price,
                price_after_discount: product.price_after_discount,
              }
            : undefined,
        };
      });
    }

    return {
      status: 200,
      message:
        productItem.quantity > 1
          ? 'Product quantity decreased by 1'
          : 'Product removed from cart',
      data: updatedCart,
    };
  }

  async findOneForAdmin(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: { id: true },
      },
    });

    if (!cart) {
      throw new NotFoundException('Not Found Cart');
    }

    if (cart.cartitems) {
      const productIds = cart.cartitems.map((item) => item.productId);
      const products = await this.productRepository.find({
        where: { id: In(productIds) },
        select: [
          'id',
          'name',
          'image',
          'description',
          'price',
          'price_after_discount',
        ],
      });

      cart.cartitems = cart.cartitems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          product: product
            ? {
                id: product.id,
                name: product.name,
                image: product.image,
                description: product.description,
                price: product.price,
                price_after_discount: product.price_after_discount,
              }
            : undefined,
        };
      });
    }

    if (cart.coupons?.length > 0) {
      const couponIds = cart.coupons.map((c) => c.couponId);
      const coupons = await this.couponRepository.findByIds(couponIds);

      const totalCouponDiscount = coupons.reduce(
        (sum, coupon) => sum + coupon.discount,
        0,
      );

      cart.total_price_after_discount = Math.max(
        0,
        (cart.total_price_after_discount || cart.total_price) -
          totalCouponDiscount,
      );
    }

    return {
      status: 200,
      message: 'Found Cart',
      data: cart,
    };
  }
  async findAllForAdmin() {
    const carts = await this.cartRepository.find({
      relations: ['user'],
      select: {
        id: true,
        cartitems: true,
        total_price: true,
        total_price_after_discount: true,
        coupons: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    });

    if (!carts || carts.length === 0) {
      return {
        status: 200,
        message: 'No carts found',
        length: 0,
        data: [],
      };
    }

    const productIds = [];
    const couponIds = [];

    carts.forEach((cart) => {
      if (cart.cartitems) {
        cart.cartitems.forEach((item) => {
          if (item.productId && !productIds.includes(item.productId)) {
            productIds.push(item.productId);
          }
        });
      }

      if (cart.coupons) {
        cart.coupons.forEach((coupon) => {
          if (coupon.couponId && !couponIds.includes(coupon.couponId)) {
            couponIds.push(coupon.couponId);
          }
        });
      }
    });

    const products =
      productIds.length > 0
        ? await this.productRepository.find({
            where: { id: In(productIds) },
            select: [
              'id',
              'name',
              'description',
              'price',
              'price_after_discount',
            ],
          })
        : [];

    const coupons =
      couponIds.length > 0
        ? await this.couponRepository.find({
            where: { id: In(couponIds) },
            select: ['id', 'name', 'expire_date'],
          })
        : [];

    const updatedCarts = carts.map((cart) => {
      if (cart.cartitems) {
        cart.cartitems = cart.cartitems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            ...item,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  image:product.image,
                  price: product.price,
                  price_after_discount: product.price_after_discount,
                }
              : undefined,
          };
        });
      }

      if (cart.coupons) {
        cart.coupons = cart.coupons.map((coupon) => {
          const couponInfo = coupons.find((c) => c.id === coupon.couponId);
          return {
            ...coupon,
            expireDate: couponInfo?.expire_date,
          };
        });
      }

      return cart;
    });

    return {
      status: 200,
      message: 'Found All Carts',
      length: updatedCarts.length,
      data: updatedCarts,
    };
  }
}
