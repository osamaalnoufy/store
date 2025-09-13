import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ProductFilterAdminDto {
  @IsNumber()
  @IsOptional() 
  @Transform(({ value }) => parseInt(value, 10))
  category?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  subcategory?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  brand?: number;
}