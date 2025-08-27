import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { AcceptOrderCashDto, CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { Cart } from 'src/entities/cart.entity';
import { Tax } from 'src/entities/tax.entity';
import { Product } from 'src/entities/product.entity';
import Stripe from 'stripe';
import { Users } from 'src/entities/users.entity';
import { Client, resources, Webhook } from 'coinbase-commerce-node';
const { Charge } = resources;
@Injectable()
export class OrderService {
  private stripe: Stripe;
  private coinbase: typeof Client;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    console.log('API Key:', process.env.COINBASE_API_KEY);
    this.stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
    Client.init(`${process.env.COINBASE_API_KEY}`);
    this.coinbase = Client;
  }

  async create(
    user_id: number,
    paymentMethodType: 'card' | 'cash' | 'crypto',
    createOrderDto: CreateOrderDto,
    dataAfterPayment: {
      success_url: string;
      cancel_url: string;
    },
  ) {
    try {
      const cart = await this.cartRepository.findOne({
        where: { user: { id: user_id } },
        relations: ['user'],
      });

      if (!cart) throw new NotFoundException('Cart not found');

      const tax = await this.taxRepository.findOne({ where: {} });

      const shippingAddress =
        cart.user?.address || createOrderDto.shippingAddress || null;
      if (!shippingAddress) {
        throw new NotFoundException('Shipping address not found');
      }

      const cartItems = Array.isArray(cart.cartitems) ? cart.cartitems : [];

      // 👇 نطبع أول عنصر من cartitems لفحص بياناته
      console.log('cartitems sample', cartItems[0]);

      // اجمع السعر الخام بأمان حتى لو product غير موجود
      let rawProductsTotalPrice = 0;
      for (const item of cartItems) {
        const base = Number(
          item?.product?.price_after_discount ?? item?.product?.price ?? 0,
        );
        rawProductsTotalPrice += base * Number(item?.quantity ?? 0);
      }

      const taxPrice = Number(tax?.taxprice ?? 0);
      let shippingPrice = 0;
      if (paymentMethodType === 'card') {
        shippingPrice = Number(tax?.shippingprice ?? 0);
      }

      const subtotalFromCart = Number(
        cart.total_price_after_discount ?? cart.total_price ?? 0,
      );

      const additionalDiscountToApply =
        rawProductsTotalPrice - subtotalFromCart;
      const totalOrderPrice = subtotalFromCart + taxPrice + shippingPrice;

      const enrichedCartItems = cartItems.map((item: any) => {
        const product = item.product || {}; // 👈 إذا ما في product نخليه {}
        return {
          productId: item.productId ?? product.id ?? null,
          quantity: item.quantity ?? 0,
          color: item.color ?? null,
          product: {
            id: product.id ?? null,
            name: product.name ?? null,
            description: product.description ?? null,
            image: product.image ?? null,
            price: Number(product.price ?? 0),
            price_after_discount: Number(product.price_after_discount ?? 0),
          },
        };
      });

      const orderData = {
        user: { id: user_id },
        cart_items: enrichedCartItems,
        tax_price: taxPrice,
        shipping_price: shippingPrice,
        total_order_price: totalOrderPrice,
        payment_method_type: paymentMethodType,
        shipping_address: shippingAddress,
        coupons: cart.coupons,
      };

      if (paymentMethodType === 'cash') {
        const order = this.orderRepository.create({
          ...orderData,
          is_paid: totalOrderPrice === 0,
          paid_at: totalOrderPrice === 0 ? new Date() : null,
          is_delivered: false,
        });

        const savedOrder = await this.orderRepository.save(order);
        const simplifiedOrder = {
          ...savedOrder,
          user: { id: user_id },
        };

        return {
          status: 200,
          message: 'Order created successfully',
          data: simplifiedOrder,
        };
      } else if (paymentMethodType === 'card') {
        const line_items: any[] = [];

        for (const item of cartItems) {
          const baseUnitPrice = Number(
            item?.product?.price_after_discount ?? item?.product?.price ?? 0,
          );

          let distributedDiscount = 0;
          if (rawProductsTotalPrice > 0) {
            distributedDiscount =
              ((baseUnitPrice * Number(item?.quantity ?? 0)) /
                rawProductsTotalPrice) *
              additionalDiscountToApply;
          }

          const finalUnitPrice = Math.max(
            0,
            baseUnitPrice -
              distributedDiscount / Math.max(1, Number(item?.quantity ?? 1)),
          );

          const name =
            item?.product?.name ?? `Product #${item?.productId ?? ''}`;
          const description = item?.product?.description ?? '';
          const images = item?.product?.image ? [item.product.image] : [];

          if (finalUnitPrice > 0 && Number(item?.quantity ?? 0) > 0) {
            line_items.push({
              price_data: {
                currency: 'usd',
                unit_amount: Math.round(finalUnitPrice * 100),
                product_data: { name, description, images },
              },
              quantity: Number(item?.quantity ?? 0),
            });
          }
        }

        if (taxPrice + shippingPrice > 0) {
          line_items.push({
            price_data: {
              currency: 'usd',
              unit_amount: Math.round((taxPrice + shippingPrice) * 100),
              product_data: {
                name: 'Taxes and Shipping Fees',
                description: 'Includes all taxes and shipping costs',
                images: [],
              },
            },
            quantity: 1,
          });
        }

        const session = await this.stripe.checkout.sessions.create({
          line_items,
          mode: 'payment',
          success_url: dataAfterPayment.success_url,
          cancel_url: dataAfterPayment.cancel_url,
          client_reference_id: String(user_id),
          customer_email: cart.user?.email ?? undefined,
          metadata: { address: String(shippingAddress) },
        });

        const order = this.orderRepository.create({
          ...orderData,
          session_id: session.id,
          is_paid: false,
          is_delivered: false,
        });

        const savedOrder = await this.orderRepository.save(order);
        const simplifiedOrder = {
          ...savedOrder,
          user: { id: user_id },
        };

        return {
          status: 200,
          message: 'Order created successfully',
          data: {
            url: session.url,
            success_url: `${session.success_url}?session_id=${session.id}`,
            cancel_url: session.cancel_url,
            expires_at: new Date((session.expires_at as number) * 1000),
            sessionId: session.id,
            totalPrice: Math.round(totalOrderPrice * 100),
            data: simplifiedOrder,
          },
        };
      } else if (paymentMethodType === 'crypto') {
        // الكود الصحيح
        if (!process.env.COINBASE_API_KEY) {
          console.error('❌ Coinbase API key is missing');
          throw new Error('Coinbase API key is missing');
        }
        const order = this.orderRepository.create({
          ...orderData,
          is_paid: false,
          is_delivered: false,
        });

        const savedOrder = await this.orderRepository.save(order);
        if (!savedOrder) {
          throw new Error('❌ Order was not saved, cannot create charge.');
        }

        console.log('✅ Order Saved:', savedOrder.id);

        try {
          // ⚠️ المكان الذي تم تعديله: استخدام المكتبة مباشرة بدلاً من axios
          const charge = await Charge.create({
            name: 'Order from My E-Commerce Store',
            description: `Order for user: ${cart.user?.email ?? user_id}`,
            local_price: { amount: String(totalOrderPrice), currency: 'USD' },
            pricing_type: 'fixed_price',
            metadata: {
              // حول user_id إلى نص لأن حقل metadata يقبل قيم نصية فقط
              user_id: user_id.toString(),
              shippingAddress: String(shippingAddress),
              order_id: savedOrder.id.toString(),
            },
            redirect_url: dataAfterPayment.success_url,
            cancel_url: dataAfterPayment.cancel_url,
          });

          console.log('✅ Coinbase Charge Created:', charge);

          await this.orderRepository.update(
            { id: savedOrder.id },
            { session_id: charge.id },
          );

          const simplifiedOrder = {
            ...savedOrder,
            user: { id: user_id },
          };

          return {
            status: 200,
            message: 'Order created successfully',
            data: {
              url: charge.hosted_url,
              success_url: `${dataAfterPayment.success_url}?charge_id=${charge.id}`,
              cancel_url: dataAfterPayment.cancel_url,
              sessionId: charge.id,
              totalPrice: totalOrderPrice,
              data: simplifiedOrder,
            },
          };
        } catch (apiError) {
          console.error('Coinbase API Error:', apiError);
          console.error('API Error Response:', apiError.response?.data);
          // يمكنك فحص apiError.message أو apiError.response.status
          throw new BadRequestException(
            `Coinbase API error: ${apiError.message || apiError.name}`,
          );
        }
      }
    } catch (error) {
      console.error('CreateOrder Error:', error);
      throw error;
    }
  }

  async updatePaidCash(orderId: number, updateOrderDto: AcceptOrderCashDto) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment_method_type !== 'cash') {
      throw new NotFoundException('This order not paid by cash');
    }

    if (order.is_paid) {
      throw new NotFoundException('Order already paid');
    }

    if (updateOrderDto.isPaid) {
      updateOrderDto.paidAt = new Date();
      const cart = await this.cartRepository.findOne({
        where: { user: { id: order.user.id } },
        relations: ['user'],
      });

      if (cart) {
        for (const item of cart.cartitems) {
          await this.productRepository.update(item.productId, {
            quantity: () => `quantity - ${item.quantity}`,
            sold: () => `sold + ${item.quantity}`,
          });
        }

        await this.cartRepository.delete({ user: { id: order.user.id } });

        if (updateOrderDto.isDeliverd) {
          updateOrderDto.deliverdAt = new Date();
        }

        await this.orderRepository.update(orderId, {
          is_paid: updateOrderDto.isPaid,
          paid_at: updateOrderDto.paidAt,
          is_delivered: updateOrderDto.isDeliverd,
          delivered_at: updateOrderDto.deliverdAt,
        });

        const updatedOrder = await this.orderRepository.findOne({
          where: { id: orderId },
        });

        return {
          status: 200,
          message: 'Order updated successfully',
          data: updatedOrder,
        };
      }
    }
  }
  async updatePaidCard(
    payload: Buffer,
    signature: string,
    endpointSecret: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const sessionId = event.data.object.id;

        const order = await this.orderRepository.findOne({
          where: { session_id: sessionId },
          relations: ['user'],
        });

        if (!order) return;

        await this.orderRepository.update(
          { session_id: order.session_id },
          {
            is_paid: true,
            is_delivered: true,
            paid_at: new Date(),
            delivered_at: new Date(),
          },
        );

        const cart = await this.cartRepository.findOne({
          where: { user: { id: order.user.id } },
          relations: ['user'],
        });

        if (cart) {
          for (const item of cart.cartitems) {
            await this.productRepository.update(item.productId, {
              quantity: () => `quantity - ${item.quantity}`,
              sold: () => `sold + ${item.quantity}`,
            });
          }
          await this.cartRepository.delete({ user: { id: order.user.id } });
        }
    }
  }
  async updatePaidCrypto(
    payload: Buffer,
    signature: string,
    endpointSecret: string,
  ) {
    let event: any;
    try {
      event = Webhook.verifyEventBody(
        payload.toString(),
        signature,
        endpointSecret,
      );
    } catch (error) {
      console.error(`Webhook signature verification failed.`, error.message);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      const chargeId = charge.id;
      const order = await this.orderRepository.findOne({
        where: { session_id: chargeId },
        relations: ['user'],
      });

      if (!order) return;

      await this.orderRepository.update(
        { session_id: order.session_id },
        {
          is_paid: true,
          is_delivered: true,
          paid_at: new Date(),
          delivered_at: new Date(),
        },
      );

      const cart = await this.cartRepository.findOne({
        where: { user: { id: order.user.id } },
        relations: ['user'],
      });

      if (cart) {
        for (const item of cart.cartitems) {
          await this.productRepository.update(item.productId, {
            quantity: () => `quantity - ${item.quantity}`,
            sold: () => `sold + ${item.quantity}`,
          });
        }
        await this.cartRepository.delete({ user: { id: order.user.id } });
      }
    }
  }

  async findAllOrdersOnUser(user_id: number) {
    const orders = await this.orderRepository.find({
      where: { user: { id: user_id } },
      relations: ['user'],
    });
    const transformedOrders = orders.map((order) => {
      const newOrder = { ...order };
      if (newOrder.user) {
        newOrder.user = { id: newOrder.user.id } as any;
      }
      return newOrder;
    });
    return {
      status: 200,
      message: 'Orders found',
      length: orders.length,
      data: transformedOrders,
    };
  }

  async findAllOrders() {
    const orders = await this.orderRepository.find({
      relations: ['user'],
      select: {
        id: true,
        session_id: true,
        cart_items: true,
        tax_price: true,
        shipping_price: true,
        total_order_price: true,
        payment_method_type: true,
        is_paid: true,
        paid_at: true,
        is_delivered: true,
        delivered_at: true,
        shipping_address: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          name: true,
          email: true,
          phone: true,
          age: true,
          address: true,
          role: true,
          image: true,
        },
      },
    });

    return {
      status: 200,
      message: 'Orders found',
      length: orders.length,
      data: orders,
    };
  }

  async reorder(userId: number, orderId: number): Promise<Cart> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingCart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingCart) {
      throw new ConflictException(
        'User already has an existing cart. Please clear it before reordering.',
      );
    }

    const cart = this.cartRepository.create({
      user: { id: userId },
      cartitems: [],
      total_price: 0,
      total_price_after_discount: 0,
      coupons: null,
    });

    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;

    cart.cartitems = order.cart_items.map((item) => {
      const itemPrice = parseFloat(item.product?.price?.toString() || '0');
      const itemDiscountedPrice =
        item.product?.price_after_discount !== null
          ? parseFloat(item.product.price_after_discount.toString())
          : itemPrice;

      totalPrice += itemPrice * item.quantity;
      totalPriceAfterDiscount += itemDiscountedPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name || null,
              image: item.product.image || null,
              description: item.product.description || null,
              price: itemPrice,
              price_after_discount:
                item.product.price_after_discount !== null
                  ? itemDiscountedPrice
                  : null,
            }
          : null,
      };
    });

    cart.total_price = totalPrice;
    cart.total_price_after_discount = totalPriceAfterDiscount;

    return await this.cartRepository.save(cart);
  }
}
