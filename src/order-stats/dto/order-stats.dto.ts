// src/orders/dto/order-stats.dto.ts
export class OrderStatsResponseDto {
  period: string;
  ordersCount: number;
  totalRevenue: number;
}

export class OrderStatsRequestDto {
  groupBy: 'hour' | 'day' | 'month' | 'year' | 'all';
  startDate?: Date;
  endDate?: Date;
}