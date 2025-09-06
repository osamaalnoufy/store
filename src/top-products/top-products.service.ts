// src/top-products/top-products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { TopProductsResponseDto } from './dto/top-products.dto';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class TopProductsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getTopProducts(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TopProductsResponseDto[]> {
    const whereCondition = {};
    if (startDate && endDate) {
      Object.assign(whereCondition, { created_at: Between(startDate, endDate) });
    }

    const orders = await this.orderRepository.find({
      where: whereCondition,
    });

    const productMap = new Map<number, { unitsSold: number; totalRevenue: number }>();
    const productIds = new Set<number>();

    orders.forEach((order) => {
      if (order.cart_items && Array.isArray(order.cart_items)) {
        order.cart_items.forEach((item) => {
          productIds.add(item.productId);
          const currentStats = productMap.get(item.productId) || { unitsSold: 0, totalRevenue: 0 };
          currentStats.unitsSold += item.quantity;
          productMap.set(item.productId, currentStats);
        });
      }
    });

    if (productIds.size === 0) {
      return [];
    }

    const products = await this.productRepository
      .find({
        where: { id: In(Array.from(productIds)) }, // تم التعديل هنا: استخدام In
        relations: ['category'],
      });

    const productsWithStats: TopProductsResponseDto[] = [];

    products.forEach((product) => {
      const stats = productMap.get(product.id);
      if (stats) {
        productsWithStats.push({
          productId: product.id,
          productName: product.name,
          unitsSold: stats.unitsSold,
          totalRevenue: (product.price_after_discount || product.price) * stats.unitsSold,
          category: (product.category as Category)?.name || 'Unknown',
        });
      }
    });

    const sortedProducts = productsWithStats.sort((a, b) => b.unitsSold - a.unitsSold);

    return sortedProducts.slice(0, limit);
  }
}