import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'reviewText Must be a string' })
  @MinLength(3, { message: 'The review_text Must be Min 3 characters' })
  @IsOptional()
  review_text: string;

  @IsNumber({}, { message: 'rating Must be a Number' })
  @Min(1, { message: 'The rating Must be Min 1 star' })
  @Max(5, { message: 'The rating Must be Min 5 star' })
  rating: number;

  @IsNumber({}, { message: 'product must be a valid ID' })
  product: number;
}
