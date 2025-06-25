import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { Product } from 'src/entities/product.entity';
import { Cart } from 'src/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart,Product,Coupon])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
