// src/orders/order-stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  OrderStatsRequestDto,
  OrderStatsResponseDto,
} from './dto/order-stats.dto';

@Injectable()
export class OrderStatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getOrderStats({
    groupBy,
    startDate,
    endDate,
  }: OrderStatsRequestDto): Promise<OrderStatsResponseDto[]> {
    // تحديد الفترة الزمنية إذا لم يتم توفيرها
    let whereCondition = {};

    if (startDate && endDate) {
      whereCondition = {
        created_at: Between(startDate, endDate),
      };
    } else if (startDate) {
      whereCondition = {
        created_at: MoreThanOrEqual(startDate),
      };
    } else if (endDate) {
      whereCondition = {
        created_at: LessThanOrEqual(endDate),
      };
    }

    // جلب جميع الطلبات في الفترة المحددة
    const orders = await this.orderRepository.find({
      where: whereCondition,
      order: { created_at: 'ASC' },
    });

    // تجميع البيانات حسب الفترة المطلوبة
    const groupedData = this.groupOrdersByTime(orders, groupBy);

    return groupedData;
  }

  private groupOrdersByTime(
    orders: Order[],
    groupBy: string,
  ): OrderStatsResponseDto[] {
    const groupedData: { [key: string]: { count: number; revenue: number } } =
      {};

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      let periodKey: string;

      switch (groupBy) {
        case 'hour':
          periodKey = date.toISOString().slice(0, 13) + ':00:00'; // YYYY-MM-DDTHH:00:00
          break;
        case 'day':
          periodKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'month':
          periodKey = date.toISOString().slice(0, 7); // YYYY-MM
          break;
        case 'year':
          periodKey = date.toISOString().slice(0, 4); // YYYY
          break;
        case 'all':
        default:
          periodKey = 'all';
          break;
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { count: 0, revenue: 0 };
      }

      groupedData[periodKey].count += 1;
      groupedData[periodKey].revenue += Number(order.total_order_price);
    });

    // تحويل الكائن إلى مصفوفة
    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      ordersCount: data.count,
      totalRevenue: data.revenue,
    }));
  }

  // دالة مساعدة للحصول على إحصائيات إضافية
  async getDashboardStats() {
    const totalOrders = await this.orderRepository.count();
    const totalRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_order_price)', 'total')
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult.total) || 0;

    // الطلبات في آخر 30 يومًا
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await this.orderRepository.count({
      where: {
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // الإيرادات في آخر 30 يومًا
    const recentRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_order_price)', 'total')
      .where('order.created_at >= :date', { date: thirtyDaysAgo })
      .getRawOne();
    const recentRevenue = parseFloat(recentRevenueResult.total) || 0;

    return {
      totalOrders,
      totalRevenue,
      recentOrders,
      recentRevenue,
    };
  }
}
