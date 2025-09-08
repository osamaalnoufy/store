import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { LowStockService } from './low-stock.service';
import { InventoryController } from './low-stock.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [InventoryController],
  providers: [LowStockService],
  exports: [LowStockService],
})
export class InventoryModule {}
