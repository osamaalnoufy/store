import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class LowStockProductDto {
  productId: number;
  productName: string;
  currentStock: number;
  minimumThreshold: number;
  category: string;
  brand: string;
  needsRestock: boolean;
  restockUrgency: 'low' | 'medium' | 'high' | 'critical';
}

export class LowStockRequestDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  threshold?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  brandId?: number;
}

export class LowStockSummaryDto {
  outOfStock: number;
  critical: number;
  under5: number;
  under10: number;
  under20: number;
  totalLowStock: number;
  timestamp: string;
}
