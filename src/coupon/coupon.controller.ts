import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    const isExpired = new Date(createCouponDto.expireDate) > new Date();
    if (!isExpired) {
      throw new HttpException("Coupon can't be expired", 400);
    }
    return await this.couponService.createCoupon(createCouponDto);
  }

  @Get('find/all')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAllCoupon() {
    return await this.couponService.findAllCoupon();
  }

  @Get('find/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findOneCoupon(@Param('id') id: number) {
    return await this.couponService.findOneCoupon(id);
  }

  @Patch('update/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async updateCoupon(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return await this.couponService.updateCoupon(id, updateCouponDto);
  }

  @Delete('delete/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async removeCoupon(@Param('id') id: number) {
    return await this.couponService.removeCoupon(id);
  }

  @Get('find')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async findActiveCoupons() {
    return await this.couponService.findActiveCoupons();
  }
}
