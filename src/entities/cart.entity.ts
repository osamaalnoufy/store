import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  cartitems: Array<{
    productId: number;
    quantity: number;
    product?: {
      id: number;
      price: number;
      price_after_discount: number;
    };
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_price_after_discount: number;

  @Column('jsonb', { nullable: true })
  coupons: Array<{
    name: string;
    couponId: number;
  }>;

  @ManyToOne(() => Users, (user) => user.carts, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
