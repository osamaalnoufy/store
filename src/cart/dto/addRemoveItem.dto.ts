import { IsNumber, IsNotEmpty } from 'class-validator';

export class AddRemoveItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}