// src/stats/dto/category-stats.dto.ts
export class CategoryStatsResponseDto {
  categoryId: number;
  categoryName: string;
  ordersCount: number;
  totalRevenue: number;
  productsSold: number;
}

export class CategoryStatsRequestDto {
  startDate?: Date;
  endDate?: Date;
}