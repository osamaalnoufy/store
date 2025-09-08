import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LowStockService } from './low-stock.service';
import {
  LowStockProductDto,
  LowStockSummaryDto,
} from './dto/create-low-stock.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
@Controller('inventory')
export class InventoryController {
  constructor(private readonly lowStockService: LowStockService) {}

  @Get('low-stock')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
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
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async getLowStockSummary(): Promise<LowStockSummaryDto> {
    return this.lowStockService.getLowStockSummary();
  }
}
