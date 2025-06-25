import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Name Must be a String' })
  @MinLength(2, { message: 'Name must be at least 3 characters' })
  name: string;

  @IsString({ message: 'Description Must be a String' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'quantity Must be a Number' })
  @Min(1, { message: 'quantity must be at least 1 characters' })
  quantity: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Price Must be a Number' })
  @Min(1, { message: 'price must be at least 1 L.S' })
  @Max(100000000, { message: 'price must be at max 100000000 L.S' })
  price: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'priceAfterDiscount Must be a Number' })
  @Min(1, { message: 'priceAfterDiscount must be at least 1 L.S' })
  @Max(100000000, { message: 'priceAfterDiscount must be at max 20000 L.S' })
  priceAfterDiscount: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  categoryID: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  subCategoryID?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  brandID?: number;
}
