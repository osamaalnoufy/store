export class TopCustomerDto {
  userId: number;
  username: string;
  totalSpent: number;
}

export class TopCustomersResponseDto {
  customers: TopCustomerDto[];
  timestamp: string;
}
