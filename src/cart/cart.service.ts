import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { In, Repository } from 'typeorm';
import { Tax } from 'src/entities/tax.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}
  async calculateCartTotals(cart) {
    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;

    for (const item of cart.cartitems) {
      const itemProduct =
        item.product ||
        (await this.productRepository.findOne({
          where: { id: item.productId },
        }));

      if (itemProduct) {
        totalPrice += item.quantity * itemProduct.price;
        totalPriceAfterDiscount +=
          item.quantity *
          (itemProduct.price_after_discount || itemProduct.price);
      }
    }

    if (cart.coupons && cart.coupons.length > 0) {
      const couponIds = cart.coupons.map((c) => c.couponId);
      const coupons = await this.couponRepository.findByIds(couponIds);
      const totalDiscountFromCoupons = coupons.reduce(
        (sum, coupon) => sum + coupon.discount,
        0,
      );
      totalPriceAfterDiscount = Math.max(
        0,
        totalPriceAfterDiscount - totalDiscountFromCoupons,
      );
    }

    return { totalPrice, totalPriceAfterDiscount };
  }
  private async createTaxAndShippingMessages() {
    const tax = await this.taxRepository.findOne({ where: {} });
    const taxPrice = tax?.taxprice ?? 0;
    const shippingPrice = tax?.shippingprice ?? 0;

    return [
      `Note: A tax of $${taxPrice} will be added to your total order price.`,
      `A shipping fee of $${shippingPrice} is applied only for card payments.`,
    ];
  }
  async create(product_id: number, user_id: number) {
    const quantity = 1;
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
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
    if (product.quantity < quantity) {
      throw new BadRequestException('Not enough quantity on this product');
    }
    let cart = await this.cartRepository.findOne({
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

    let message: string | string[];

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: user_id },
        cartitems: [],
        total_price: 0,
        total_price_after_discount: 0,
      });
      message = ['Cart created and product inserted.'];
    } else {
      message = ['Product added to cart.'];
    }

    let productExists = false;
    const updatedCartItems =
      cart.cartitems?.map((item) => {
        if (item.productId === product_id) {
          productExists = true;
          return {
            ...item,
            quantity: item.quantity + quantity,
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
        quantity: quantity,
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
    cart.cartitems = updatedCartItems;
    const { totalPrice, totalPriceAfterDiscount } =
      await this.calculateCartTotals(cart);
    cart.total_price = totalPrice;
    cart.total_price_after_discount = totalPriceAfterDiscount;
    const savedCart = await this.cartRepository.save(cart);

    const taxAndShippingMessages = await this.createTaxAndShippingMessages();

    return {
      status: 200,
      message: [...message, ...taxAndShippingMessages],
      data: savedCart,
    };
  }

  async addMultiple(product_id: number, user_id: number, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
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
    if (product.quantity < quantity) {
      throw new BadRequestException('Not enough quantity on this product');
    }
    let cart = await this.cartRepository.findOne({
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

    let message: string | string[];

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: user_id },
        cartitems: [],
        total_price: 0,
        total_price_after_discount: 0,
      });
      message = ['Cart created and product inserted.'];
    } else {
      message = ['Product added to cart.'];
    }

    let productExists = false;
    const updatedCartItems =
      cart.cartitems?.map((item) => {
        if (item.productId === product_id) {
          productExists = true;
          return {
            ...item,
            quantity: item.quantity + quantity,
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
        quantity: quantity,
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
    cart.cartitems = updatedCartItems;
    const { totalPrice, totalPriceAfterDiscount } =
      await this.calculateCartTotals(cart);
    cart.total_price = totalPrice;
    cart.total_price_after_discount = totalPriceAfterDiscount;
    const savedCart = await this.cartRepository.save(cart);
    const taxAndShippingMessages = await this.createTaxAndShippingMessages();

    return {
      status: 200,
      message: [...message, ...taxAndShippingMessages],
      data: savedCart,
    };
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
        discount: coupon.discount,
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
    const taxAndShippingMessages = await this.createTaxAndShippingMessages();
    return {
      status: 200,
      message: ['Found Cart', ...taxAndShippingMessages],
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

    const message =
      productItem.quantity > 1
        ? 'Product quantity decreased by 1'
        : 'Product removed from cart';

    if (productItem.quantity > 1) {
      updatedCartItems[productIndex] = {
        ...productItem,
        quantity: productItem.quantity - 1,
      };
    } else {
      updatedCartItems.splice(productIndex, 1);
    }

    cart.cartitems = updatedCartItems;
    const { totalPrice, totalPriceAfterDiscount } =
      await this.calculateCartTotals(cart);
    cart.total_price = totalPrice;
    cart.total_price_after_discount = totalPriceAfterDiscount;

    await this.cartRepository.save(cart);

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

    // جلب بيانات المنتجات مرة أخرى بعد الحذف
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

    const taxAndShippingMessages = await this.createTaxAndShippingMessages();

    return {
      status: 200,
      message: [message, ...taxAndShippingMessages],
      data: updatedCart,
    };
  }

  async removeMultiple(productId: number, user_id: number, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException(
        'Quantity to remove must be greater than 0',
      );
    }
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
      throw new NotFoundException('Product not found in cart');
    }
    const updatedCartItems = [...(cart.cartitems || [])];
    const productItem = updatedCartItems[productIndex];
    if (productItem.quantity < quantity) {
      throw new BadRequestException(
        `Cannot remove ${quantity} items, only ${productItem.quantity} are in the cart.`,
      );
    }
    let message = '';
    if (productItem.quantity > quantity) {
      updatedCartItems[productIndex] = {
        ...productItem,
        quantity: productItem.quantity - quantity,
      };
      message = 'Product quantity decreased successfully';
    } else {
      updatedCartItems.splice(productIndex, 1);
      message = 'Product removed from cart completely';
    }
    cart.cartitems = updatedCartItems;
    const { totalPrice, totalPriceAfterDiscount } =
      await this.calculateCartTotals(cart);
    cart.total_price = totalPrice;
    cart.total_price_after_discount = totalPriceAfterDiscount;
    await this.cartRepository.update(cart.id, {
      cartitems: updatedCartItems,
      total_price: totalPrice,
      total_price_after_discount: totalPriceAfterDiscount,
    });
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['user'],
    });

    const taxAndShippingMessages = await this.createTaxAndShippingMessages();

    return {
      status: 200,
      message: [message, ...taxAndShippingMessages],
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
                  image: product.image,
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
