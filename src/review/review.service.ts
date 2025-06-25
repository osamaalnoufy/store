import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createReviewDto: CreateReviewDto, userId: number) {
    const newReview = this.reviewRepository.create({
      review_text: createReviewDto.review_text,
      rating: createReviewDto.rating,
      user: { id: userId },
      product: { id: createReviewDto.product },
    });

    await this.reviewRepository.save(newReview);

    const productReviews = await this.reviewRepository.find({
      where: { product: { id: createReviewDto.product } },
      select: ['rating'],
    });

    const ratings_quantity = productReviews.length;
    let ratings_average = 0;

    if (ratings_quantity > 0) {
      const totalRatings = productReviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      ratings_average = totalRatings / ratings_quantity;

      await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          ratings_average: ratings_average,
          ratings_quantity: ratings_quantity,
        })
        .where('id = :id', { id: createReviewDto.product })
        .execute();
    }

    return {
      status: 201,
      message: 'Review created successfully',
      data: newReview,
    };
  }

  async findAll(product_id: number) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: product_id } },
      relations: ['user', 'product'],
      select: {
        id: true,
        rating: true,
        review_text: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        product: {
          id: true,
          name: true,
        },
      },
    });

    return {
      status: 200,
      message: 'Reviews Found',
      length: reviews.length,
      data: reviews,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, user_id: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ['product', 'user'],
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (user_id !== review.user.id) {
        throw new UnauthorizedException('You can only update your own reviews');
      }

      if (updateReviewDto.review_text !== undefined) {
        review.review_text = updateReviewDto.review_text;
      }
      if (updateReviewDto.rating !== undefined) {
        review.rating = updateReviewDto.rating;
      }

      const updatedReview = await this.reviewRepository.save(review);

      const productReviews = await this.reviewRepository.find({
        where: { product: { id: review.product.id } },
        select: ['rating'],
      });

      const ratingsQuantity = productReviews.length;
      const ratingsAverage =
        ratingsQuantity > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
            ratingsQuantity
          : 0;

      await this.productRepository.update(review.product.id, {
        ratings_average: ratingsAverage,
        ratings_quantity: ratingsQuantity,
      });

      return {
        status: 200,
        message: 'Review updated successfully',
        data: {
          id: updatedReview.id,
          review_text: updatedReview.review_text,
          rating: updatedReview.rating,
          created_at: updatedReview.created_at,
          updated_at: updatedReview.updated_at,
          product: {
            id: updatedReview.product.id,
          },
          user: {
            id: updatedReview.user.id,
          },
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to update review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(
    id: number,
    user_id: number,
  ): Promise<{ status: number; message: string }> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ['product', 'user'],
      });

      if (!review) {
        throw new NotFoundException('Review not found with this ID');
      }

      if (!review.user) {
        throw new InternalServerErrorException('Review user data is corrupted');
      }

      if (user_id !== review.user.id) {
        throw new UnauthorizedException('You can only delete your own reviews');
      }

      await this.reviewRepository.delete(id);

      const productReviews = await this.reviewRepository.find({
        where: { product: { id: review.product.id } },
        select: ['rating'],
      });

      const ratingsQuantity = productReviews.length;
      const ratingsAverage =
        ratingsQuantity > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
            ratingsQuantity
          : 0;

      await this.productRepository.update(review.product.id, {
        ratings_average: ratingsAverage,
        ratings_quantity: ratingsQuantity,
      });

      return {
        status: 200,
        message: 'Review deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
