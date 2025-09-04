// src/order-status/order-status.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { OrderStatusService } from './order-status.service';
import { OrderStatusResponseDto } from './dto/order-status.dto';

@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Get()
  async getOrderStatusStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<OrderStatusResponseDto[]> {
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.orderStatusService.getOrderStatusStats(parsedStartDate, parsedEndDate);
  }
}