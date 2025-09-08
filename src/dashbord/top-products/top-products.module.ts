// src/top-products/top-products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopProductsController } from './top-products.controller';
import { TopProductsService } from './top-products.service';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Order,Product])],
  controllers: [TopProductsController],
  providers: [TopProductsService],
  exports: [TopProductsService],
})
export class TopProductsModule {}