// src/inventory/low-stock.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { LowStockProductDto } from './dto/create-low-stock.dto';

@Injectable()
export class LowStockService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async getLowStockProducts(
    threshold?: number,
    categoryId?: number,
    brandId?: number,
  ): Promise<LowStockProductDto[]> {
    // القيمة الافتراضية للحد الأدنى
    const minThreshold = threshold || 10;

    // بناء شرط البحث
    const whereCondition: any = {
      quantity: LessThanOrEqual(minThreshold),
    };

    // إضافة فلتر الفئة إذا تم توفيره
    if (categoryId) {
      whereCondition.category = { id: categoryId };
    }

    // إضافة فلتر الماركة إذا تم توفيره
    if (brandId) {
      whereCondition.brand = { id: brandId };
    }

    // جلب المنتجات منخفضة المخزون
    const lowStockProducts = await this.productRepository.find({
      where: whereCondition,
      relations: ['category', 'brand'],
      order: { quantity: 'ASC' },
    });

    // تحويل البيانات إلى DTO
    return lowStockProducts.map((product) =>
      this.mapToLowStockDto(product, minThreshold),
    );
  }

  async getLowStockSummary() {
    const thresholds = [5, 10, 20];
    const summary: any = {};

    for (const threshold of thresholds) {
      const count = await this.productRepository.count({
        where: { quantity: LessThanOrEqual(threshold) },
      });
      summary[`under${threshold}`] = count;
    }

    // المنتجات التي نفدت تماماً
    const outOfStockCount = await this.productRepository.count({
      where: { quantity: 0 },
    });

    // المنتجات التي تحتاج إلى إعادة تخزين عاجلة (أقل من أو يساوي 3)
    const criticalCount = await this.productRepository.count({
      where: { quantity: LessThanOrEqual(3) },
    });

    return {
      ...summary,
      outOfStock: outOfStockCount,
      critical: criticalCount,
      totalLowStock: summary.under10,
      timestamp: new Date().toISOString(),
    };
  }

  async getProductsNeedRestock(): Promise<LowStockProductDto[]> {
    // نفترض أن الحد الأدنى للإعادة التخزين هو 5
    const RESTOCK_THRESHOLD = 5;

    const products = await this.productRepository.find({
      where: { quantity: LessThanOrEqual(RESTOCK_THRESHOLD) },
      relations: ['category', 'brand'],
      order: { quantity: 'ASC' },
    });

    return products.map((product) =>
      this.mapToLowStockDto(product, RESTOCK_THRESHOLD),
    );
  }

  private mapToLowStockDto(
    product: Product,
    threshold: number,
  ): LowStockProductDto {
    const urgency = this.calculateUrgency(product.quantity, threshold);

    return {
      productId: product.id,
      productName: product.name,
      currentStock: product.quantity,
      minimumThreshold: threshold,
      category: product.category?.name || 'غير مصنف',
      brand: product.brand?.name || 'غير معروف',
      needsRestock: product.quantity <= threshold,
      restockUrgency: urgency,
    };
  }

  private calculateUrgency(
    quantity: number,
    threshold: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (quantity === 0) {
      return 'critical';
    } else if (quantity <= 2) {
      return 'high';
    } else if (quantity <= 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // الحصول على المنتجات الأكثر مبيعاً التي تحتاج إلى إعادة تخزين
  async getTopSellingLowStockProducts(
    limit: number = 10,
  ): Promise<LowStockProductDto[]> {
    const RESTOCK_THRESHOLD = 10;

    const products = await this.productRepository.find({
      where: { quantity: LessThanOrEqual(RESTOCK_THRESHOLD) },
      relations: ['category', 'brand'],
      order: { sold: 'DESC', quantity: 'ASC' },
      take: limit,
    });

    return products.map((product) =>
      this.mapToLowStockDto(product, RESTOCK_THRESHOLD),
    );
  }

  // الحصول على المنتجات المنخفضة المخزون حسب الفئة
  async getLowStockByCategory() {
    const RESTOCK_THRESHOLD = 10;

    const categories = await this.categoryRepository.find({
      relations: ['products'],
    });

    const result = [];

    for (const category of categories) {
      const lowStockProducts = category.products.filter(
        (product) => product.quantity <= RESTOCK_THRESHOLD,
      );

      if (lowStockProducts.length > 0) {
        result.push({
          categoryId: category.id,
          categoryName: category.name,
          lowStockCount: lowStockProducts.length,
          totalProducts: category.products.length,
          products: lowStockProducts.map((product) => ({
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
          })),
        });
      }
    }

    return result;
  }
}
