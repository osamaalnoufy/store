import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { Product } from 'src/entities/product.entity';
import { ProductReviewStatsDto } from './dto/product-review-stats.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getProductReviewStats(
    productId: number,
  ): Promise<ProductReviewStatsDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      select: ['rating'],
    });

    const stats = {
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0,
    };
    let totalRatingSum = 0;

    reviews.forEach((review) => {
      totalRatingSum += review.rating;
      switch (review.rating) {
        case 5:
          stats.fiveStarCount++;
          break;
        case 4:
          stats.fourStarCount++;
          break;
        case 3:
          stats.threeStarCount++;
          break;
        case 2:
          stats.twoStarCount++;
          break;
        case 1:
          stats.oneStarCount++;
          break;
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

    return {
      productId: product.id,
      productName: product.name,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(2)),
      ...stats,
    };
  }
}
