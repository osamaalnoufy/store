import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { Users } from 'src/entities/users.entity';
import {
  TopCustomerDto,
  TopCustomersResponseDto,
} from './dto/top-customers.dto';

@Injectable()
export class BestUserService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getTopCustomers(limit: number = 10): Promise<TopCustomersResponseDto> {
    const topCustomers = await this.orderRepository
      .createQueryBuilder('ord')
      .select('ord.user_id', 'userId')
      .addSelect('usr.name', 'name') // تم تغيير الاسم هنا
      .addSelect('SUM(ord.total_order_price)', 'totalSpent')
      .innerJoin(Users, 'usr', 'ord.user_id = usr.id') // تم تغيير الاسم هنا
      .groupBy('ord.user_id')
      .addGroupBy('usr.name') // تم تغيير الاسم هنا
      .orderBy('SUM(ord.total_order_price)', 'DESC')
      .limit(limit)
      .getRawMany<TopCustomerDto>();

    return {
      customers: topCustomers,
      timestamp: new Date().toISOString(),
    };
  }
}
