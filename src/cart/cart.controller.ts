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
import { AddRemoveItemDto } from './dto/addRemoveItem.dto';

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
  @Post('add-multiple/:productId')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async addMultiple(
    @Param('productId') productId: number,
    @Body() body: AddRemoveItemDto,
    @Req() req,
  ) {
    const user_id: number = req.user.id;
    return await this.cartService.addMultiple(
      productId,
      user_id,
      body.quantity,
    );
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
  @Patch('remove-multiple/:productId')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async removeMultiple(
    @Param('productId') productId: number,
    @Body() body: AddRemoveItemDto,
    @Req() req,
  ) {
    const user_id: number = req.user.id;
    return await this.cartService.removeMultiple(
      productId,
      user_id,
      body.quantity,
    );
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
