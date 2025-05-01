import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class SubCategoryDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name: string;
  @IsNumber()
  categoryID: number;
}
