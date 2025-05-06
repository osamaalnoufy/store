import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from 'src/entities/coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}
  async createCoupon(createCouponDto: CreateCouponDto) {
    const coupon = await this.couponRepository.findOne({
      where: { name: createCouponDto.name },
    });
    if (coupon) {
      throw new HttpException('coupon already exist', 400);
    }
    try {
      const newCoupon = this.couponRepository.create({
        name: createCouponDto.name,
        discount: createCouponDto.discount,
        expire_date: createCouponDto.expireDate,
      });
      await this.couponRepository.save(newCoupon);
      return {
        status: 201,
        message: 'Coupon created successfully',
        data: {
          id: newCoupon.id,
          name: newCoupon.name,
          discount: newCoupon.discount,
          expire_date: newCoupon.expire_date,
          created_at: newCoupon.created_at,
          updated_at: newCoupon.updated_at,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to create coupon', 500);
    }
  }

  async findAllCoupon() {
    const coupons = await this.couponRepository.find();
    return {
      status: 200,
      message: 'Coupons found',
      length: coupons.length,
      data: coupons,
    };
  }

  async findOneCoupon(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('coupon not found');
    }
    return {
      status: 200,
      message: 'coupon found',
      date: coupon,
    };
  }

  async updateCoupon(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });
    if (!coupon) {
      throw new HttpException('coupon not found', 400);
    }
    const updatedCoupon = this.couponRepository.create({
      ...coupon,
      name: updateCouponDto.name ?? coupon.name,
      discount: updateCouponDto.discount ?? coupon.discount,
      expire_date: updateCouponDto.expireDate ?? coupon.expire_date,
    });
    const isExpired = new Date(updatedCoupon.expire_date) > new Date();
    if (!isExpired) {
      throw new HttpException("Coupon can't be expired", 400);
    }
    await this.couponRepository.save(updatedCoupon);
    return {
      status: 200,
      message: 'Product Updated successfully',
      data: {
        id: id,
        name: updatedCoupon.name,
        discount: updatedCoupon.discount,
        expire_date: updatedCoupon.expire_date,
        created_at: updatedCoupon.created_at,
        updated_at: updatedCoupon.updated_at,
      },
    };
  }

  async removeCoupon(id: number) {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });
    if (!coupon) {
      throw new HttpException('coupon not found', 400);
    }
    await this.couponRepository.delete(id);
    return {
      date: 200,
      message: 'coupon deleted successfully',
    };
  }
}
