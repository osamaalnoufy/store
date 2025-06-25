import { IsNumber, IsOptional } from 'class-validator';

export class CreateTaxDto {
  @IsNumber({}, { message: 'taxPrice must be a number' })
  @IsOptional()
  taxprice: number;

  @IsNumber({}, { message: 'shippingPrice must be a number' })
  @IsOptional()
  shippingprice: number;
}
