// src/stats/order-status.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { OrderStatusResponseDto } from './dto/order-status.dto';
import { Order } from 'src/entities/order.entity';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getOrderStatusStats(startDate?: Date, endDate?: Date): Promise<OrderStatusResponseDto[]> {
    const whereCondition: any = {};
    
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const orders = await this.orderRepository.find({
      where: whereCondition,
    });

    const statusStats = {
      paid: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      pending: { count: 0, revenue: 0 }
    };

    orders.forEach(order => {
      if (order.is_delivered) {
        statusStats.delivered.count += 1;
        statusStats.delivered.revenue += Number(order.total_order_price);
      } else if (order.is_paid) {
        statusStats.paid.count += 1;
        statusStats.paid.revenue += Number(order.total_order_price);
      } else {
        statusStats.pending.count += 1;
        statusStats.pending.revenue += Number(order.total_order_price);
      }
    });

    const totalOrders = orders.length;
    
    return [
      {
        status: 'تم التوصيل',
        count: statusStats.delivered.count,
        percentage: totalOrders > 0 ? (statusStats.delivered.count / totalOrders) * 100 : 0,
        totalRevenue: statusStats.delivered.revenue
      },
      {
        status: 'تم الدفع',
        count: statusStats.paid.count,
        percentage: totalOrders > 0 ? (statusStats.paid.count / totalOrders) * 100 : 0,
        totalRevenue: statusStats.paid.revenue
      },
      {
        status: 'قيد الانتظار',
        count: statusStats.pending.count,
        percentage: totalOrders > 0 ? (statusStats.pending.count / totalOrders) * 100 : 0,
        totalRevenue: statusStats.pending.revenue
      }
    ];
  }
}