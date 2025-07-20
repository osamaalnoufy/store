import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';
import { Brand } from './brand.entity';
import { Review } from './review.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @Column()
  image: string;
  @Column()
  description: string;
  @Column()
  quantity: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_after_discount: number;
  @Column({ default: 0 })
  sold: number;

  @Column({
    name: 'ratings_average',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  ratings_average: number;

  @Column({ name: 'ratings_quantity', default: 0 })
  ratings_quantity: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;
  @ManyToOne(() => SubCategory, (subcategory) => subcategory.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'sub_category_id' })
  subcategory: SubCategory | null;
  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
