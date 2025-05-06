import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Brand } from './brand.entity';
import { SubCategory } from './sub-category.entity';
import { Product } from './product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdat: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedat: Date;

  @OneToMany(() => Brand, (brand) => brand.category, { cascade: true })
  brands: Brand[];
  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, {
    cascade: true,
  })
  subCategorys: SubCategory[];

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Product[];
}
