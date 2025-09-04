// src/stats/dto/order-status.dto.ts
export class OrderStatusResponseDto {
  status: string;
  count: number;
  percentage: number;
  totalRevenue: number;
}

export class OrderStatusRequestDto {
  startDate?: Date;
  endDate?: Date;
}