// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { InventoryController } from './low-stock.controller';
import { LowStockService } from './low-stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand])],
  controllers: [InventoryController],
  providers: [LowStockService],
  exports: [LowStockService],
})
export class LowStockModule {}
