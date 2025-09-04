// src/inventory/dto/low-stock-products.dto.ts
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
  threshold?: number;
  categoryId?: number;
  brandId?: number;
}
