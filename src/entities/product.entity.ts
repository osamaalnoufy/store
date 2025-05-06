import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';
import { Brand } from './brand.entity';

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
  @Column()
  price: number;
  @Column()
  price_after_discount: number;
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
}
