// src/category-stats/category-stats.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryStatsController } from './category-stats.controller';
import { CategoryStatsService } from './category-stats.service';
import { Category } from 'src/entities/category.entity';
import { Order } from 'src/entities/order.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Order, Category])],
  controllers: [CategoryStatsController],
  providers: [CategoryStatsService],
  exports: [CategoryStatsService],
})
export class CategoryStatsModule {}