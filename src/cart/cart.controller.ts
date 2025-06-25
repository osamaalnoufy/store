import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':productId')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async create(@Param('productId') productId: number, @Req() req) {
    const user_id: number = req.user.id;
    return await this.cartService.create(productId, user_id);
  }

  @Post('coupon/:couponName')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async applyCoupon(@Param('couponName') couponName: string, @Req() req) {
    const user_id: number = req.user.id;
    return await this.cartService.applyCoupon(user_id, couponName);
  }

  @Get()
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async findOneForUser(@Req() req) {
    const user_id: number = req.user.id;
    return await this.cartService.findOne(user_id);
  }

  @Delete(':productId')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async remove(@Param('productId') productId: number, @Req() req) {
    const user_id: number = req.user.id;
    return await this.cartService.remove(productId, user_id);
  }

  @Get('admin/:userId')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findOneForAdmin(@Param('userId') userId: number) {
    return await this.cartService.findOneForAdmin(userId);
  }

  @Get('admin')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAllForAdmin() {
    return await this.cartService.findAllForAdmin();
  }
}
