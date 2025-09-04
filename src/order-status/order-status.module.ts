// src/order-status/order-status.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatusController } from './order-status.controller';
import { OrderStatusService } from './order-status.service';
import { Order } from 'src/entities/order.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrderStatusController],
  providers: [OrderStatusService],
  exports: [OrderStatusService],
})
export class OrderStatusModule {}