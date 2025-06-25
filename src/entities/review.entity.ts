import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Product } from './product.entity';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  @IsString()
  @MinLength(3, {
    message: 'reviewText must be at least 3 characters',
  })
  @IsOptional()
  review_text: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  @IsInt()
  @Min(1, {
    message: 'rating must be at least 1 star',
  })
  @Max(5, {
    message: 'rating must be at most 5 stars',
  })
  @IsNotEmpty()
  rating: number;

  @ManyToOne(() => Users, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}
