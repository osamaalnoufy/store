// src/orders/order-stats.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OrderStatsService } from './order-stats.service';
import { OrderStatsResponseDto } from './dto/order-stats.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('order-stats')
export class OrderStatsController {
  constructor(private readonly orderStatsService: OrderStatsService) {}

  @Get()
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async getOrderStats(
    @Query('groupBy')
    groupBy: 'hour' | 'day' | 'month' | 'year' | 'all' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<OrderStatsResponseDto[]> {
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.orderStatsService.getOrderStats({
      groupBy,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.orderStatsService.getDashboardStats();
  }
  
}
