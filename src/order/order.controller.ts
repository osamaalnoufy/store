import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  NotFoundException,
  RawBodyRequest,
  Headers,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AcceptOrderCashDto, CreateOrderDto } from './dto/create-order.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { Request, Response } from 'express';
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(':paymentMethodType')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async create(
    @Param('paymentMethodType') paymentMethodType: 'card' | 'cash',
    @Body()
    createOrderDto: CreateOrderDto,
    @Req() req,
    @Query() query,
  ) {
    try {
      if (!['card', 'cash'].includes(paymentMethodType)) {
        throw new NotFoundException('No payment method found');
      }

      const {
        success_url = 'https://nestjs.com/',
        cancel_url = 'https://www.deepseek.com/en',
      } = query;

      const dataAfterPayment = {
        success_url,
        cancel_url,
      };

      const user_id = req.user.id;

      return await this.orderService.create(
        user_id,
        paymentMethodType,
        createOrderDto,
        dataAfterPayment,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch(':orderId')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  updatePaidCash(
    @Param('orderId') orderId: number,
    @Body()
    updateOrderDto: AcceptOrderCashDto,
  ) {
    return this.orderService.updatePaidCash(orderId, updateOrderDto);
  }

  @Post()
  async updatePaidCard(
    @Headers('stripe-signature') sig,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const endpointSecret = `${process.env.ENDPOINTSECRET}`;

    const payload = request.rawBody;

    return await this.orderService.updatePaidCard(payload, sig, endpointSecret);
  }

  @Get()
  @Roles(['user'])
  @UseGuards(UsersGuard)
  findAllOrdersOnUser(@Req() req) {
    const user_id = req.user.id;
    return this.orderService.findAllOrdersOnUser(user_id);
  }

  @Get('all')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAllOrders() {
    return await this.orderService.findAllOrders();
  }

  @Get('user/:userId')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAllOrdersByUserId(@Param('userId') userId: number) {
    return await this.orderService.findAllOrdersOnUser(userId);
  }

  @Post('reorder/:orderId')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async reorder(@Req() req, @Param('orderId') orderId: number) {
    const user_id = req.user.id;
    return await this.orderService.reorder(user_id, orderId);
  }
}
