// src/stats/dto/top-products.dto.ts
export class TopProductsResponseDto {
  productId: number;
  productName: string;
  unitsSold: number;
  totalRevenue: number;
  category: string;
}

export class TopProductsRequestDto {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}
