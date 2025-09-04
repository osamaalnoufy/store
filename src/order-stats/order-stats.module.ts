// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatsService } from './order-stats.service';
import { OrderStatsController } from './order-stats.controller';
import { Order } from 'src/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderStatsService],
  controllers: [OrderStatsController],
  exports: [OrderStatsService],
})
export class OrderStatsModule {}
