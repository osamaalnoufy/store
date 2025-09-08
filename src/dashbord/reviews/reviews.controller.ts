
import { Controller, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ProductReviewStatsDto } from './dto/product-review-stats.dto';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':productId')
  async getProductReviewStats(
    @Param('productId') productId: number,
  ): Promise<ProductReviewStatsDto> {
    return this.reviewsService.getProductReviewStats(productId);
  }
}