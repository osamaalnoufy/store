import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('subcategory')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @ManyToOne(() => Category, (category) => category.subCategorys)
  @JoinColumn({ name: 'category_id' })
  category: Category;
  @OneToMany(() => Product, (product) => product.subcategory, { cascade: true })
  products: Product[];
}
