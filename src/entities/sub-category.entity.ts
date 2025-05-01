import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('subcategory')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @ManyToOne(() => Category, (category) => category.subCategorys)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
