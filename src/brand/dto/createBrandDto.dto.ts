import { IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString({ message: 'brand must be a string' })
  name: string;
  @IsString()
  category_id: string;
}
