// src/inventory/inventory.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LowStockProductDto } from './dto/create-low-stock.dto';
import { LowStockService } from './low-stock.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly lowStockService: LowStockService) {}

  @Get('low-stock')
  async getLowStockProducts(
    @Query('threshold') threshold?: number,
    @Query('categoryId') categoryId?: number,
    @Query('brandId') brandId?: number,
  ): Promise<LowStockProductDto[]> {
    return this.lowStockService.getLowStockProducts(
      threshold,
      categoryId,
      brandId,
    );
  }

  @Get('low-stock-summary')
  async getLowStockSummary() {
    return this.lowStockService.getLowStockSummary();
  }

  @Get('need-restock')
  async getProductsNeedRestock(): Promise<LowStockProductDto[]> {
    return this.lowStockService.getProductsNeedRestock();
  }

  @Get('top-selling-low-stock')
  async getTopSellingLowStockProducts(
    @Query('limit') limit?: number,
  ): Promise<LowStockProductDto[]> {
    return this.lowStockService.getTopSellingLowStockProducts(limit);
  }

  @Get('low-stock-by-category')
  async getLowStockByCategory() {
    return this.lowStockService.getLowStockByCategory();
  }
}
