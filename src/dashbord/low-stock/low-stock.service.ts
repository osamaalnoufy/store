import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository, LessThanOrEqual, Equal, Between } from 'typeorm';
import {
  LowStockProductDto,
  LowStockSummaryDto,
} from './dto/create-low-stock.dto';
@Injectable()
export class LowStockService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getLowStockProducts(
    threshold?: number,
    categoryId?: number,
    brandId?: number,
  ): Promise<LowStockProductDto[]> {
    const minThreshold = threshold || 10;
    const whereCondition: any = { quantity: LessThanOrEqual(minThreshold) };

    if (categoryId) {
      whereCondition.category = { id: categoryId };
    }

    if (brandId) {
      whereCondition.brand = { id: brandId };
    }

    const lowStockProducts = await this.productRepository.find({
      where: whereCondition,
      relations: ['category', 'brand'],
      order: { quantity: 'ASC' },
    });

    return lowStockProducts.map((product) =>
      this.mapToLowStockDto(product, minThreshold),
    );
  }

  async getLowStockSummary(): Promise<LowStockSummaryDto> {
    const outOfStockCount = await this.productRepository.count({
      where: { quantity: Equal(0) },
    });

    const under5Count = await this.productRepository.count({
      where: { quantity: Between(1, 4) },
    });

    const under10Count = await this.productRepository.count({
      where: { quantity: Between(5, 9) },
    });

    const under20Count = await this.productRepository.count({
      where: { quantity: Between(10, 19) },
    });

    const criticalCount = await this.productRepository.count({
      where: { quantity: LessThanOrEqual(3) },
    });

    const totalLowStock =
      outOfStockCount + under5Count + under10Count + under20Count;

    return {
      outOfStock: outOfStockCount,
      critical: criticalCount,
      under5: under5Count,
      under10: under10Count,
      under20: under20Count,
      totalLowStock: totalLowStock,
      timestamp: new Date().toISOString(),
    };
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
      category: product.category?.name || 'null ',
      brand: product.brand?.name || 'null ',
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
    } else if (quantity <= threshold * 0.25) {
      return 'high';
    } else if (quantity <= threshold * 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}
