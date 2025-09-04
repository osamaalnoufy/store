// src/stats/top-products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { TopProductsResponseDto } from './dto/top-products.dto';
import { Order } from 'src/entities/order.entity';

@Injectable()
export class TopProductsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<TopProductsResponseDto[]> {
    const whereCondition: any = {};
    
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const orders = await this.orderRepository.find({
      where: whereCondition,
    });

    const productMap = new Map<number, TopProductsResponseDto>();

    orders.forEach(order => {
      order.cart_items.forEach(item => {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.product?.name || `Product ${item.productId}`,
            unitsSold: 0,
            totalRevenue: 0,
            category: item.product ? this.getProductCategory(item.product) : 'Unknown'
          });
        }

        const productStats = productMap.get(item.productId);
        productStats.unitsSold += item.quantity;
        productStats.totalRevenue += item.product ? 
          (item.product.price_after_discount || item.product.price) * item.quantity : 
          0;
        
        productMap.set(item.productId, productStats);
      });
    });

    const sortedProducts = Array.from(productMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);

    return sortedProducts;
  }

  private getProductCategory(product: any): string {
    // في التطبيق الحقيقي، يجب جلب category من المنتج
    return product.category || 'Unknown';
  }
}