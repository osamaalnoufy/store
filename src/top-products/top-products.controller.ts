// src/top-products/top-products.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TopProductsService } from './top-products.service';
import { TopProductsResponseDto } from './dto/top-products.dto';

@Controller('top-products')
export class TopProductsController {
  constructor(private readonly topProductsService: TopProductsService) {}

  @Get()
  async getTopProducts(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TopProductsResponseDto[]> {
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.topProductsService.getTopProducts(limit, parsedStartDate, parsedEndDate);
  }
}