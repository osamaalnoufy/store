import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsNumber()
  @IsOptional()
  product?: number;
}
