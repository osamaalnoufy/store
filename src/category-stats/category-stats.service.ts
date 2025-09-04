// src/stats/category-stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { CategoryStatsResponseDto } from './dto/category-stats.dto';
import { Order } from 'src/entities/order.entity';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class CategoryStatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getCategoryStats(startDate?: Date, endDate?: Date): Promise<CategoryStatsResponseDto[]> {
    const whereCondition: any = {};
    
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    // جلب جميع الطلبات في الفترة المحددة
    const orders = await this.orderRepository.find({
      where: whereCondition,
      relations: ['user'],
    });

    // جلب جميع الفئات
    const categories = await this.categoryRepository.find({
      relations: ['products'],
    });

    // تجميع البيانات حسب الفئة
    const categoryStatsMap = new Map<number, CategoryStatsResponseDto>();

    // تهيئة الخريطة بجميع الفئات
    categories.forEach(category => {
      categoryStatsMap.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        ordersCount: 0,
        totalRevenue: 0,
        productsSold: 0
      });
    });

    // معالجة الطلبات وتجميع الإحصائيات
    orders.forEach(order => {
      order.cart_items.forEach(item => {
        // في تطبيق حقيقي، يجب أن يكون product مرتبطًا بـ category
        // هذا افتراضي أن كل منتج له category_id
        const productCategoryId = this.getProductCategoryId(item.productId);
        
        if (categoryStatsMap.has(productCategoryId)) {
          const stats = categoryStatsMap.get(productCategoryId);
          stats.ordersCount += 1;
          stats.totalRevenue += item.product ? 
            (item.product.price_after_discount || item.product.price) * item.quantity : 
            0;
          stats.productsSold += item.quantity;
          categoryStatsMap.set(productCategoryId, stats);
        }
      });
    });

    return Array.from(categoryStatsMap.values());
  }

  // دالة مساعدة - في التطبيق الحقيقي يجب استبدالها بعلاقة حقيقية
  private getProductCategoryId(productId: number): number {
    // هذا مثال، في التطبيق الحقيقي يجب جلب category_id من قاعدة البيانات
    return Math.floor(productId % 5) + 1; // افتراضي لأغراض الاختبار
  }
}