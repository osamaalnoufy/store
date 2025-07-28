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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.orders, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ nullable: true })
  session_id: string;

  @Column('jsonb')
  cart_items: Array<{
    productId: number;
    quantity: number;
    color: string;
    product?: {
      id: number;
      name: string; 
      image: string; 
      description: string; 
      price: number;
      price_after_discount: number;
    };
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_order_price: number;

  @Column({
    type: 'enum',
    enum: ['cash', 'card'],
    default: 'card',
  })
  payment_method_type: string;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ nullable: true })
  paid_at: Date;

  @Column({ name: 'is_delivered', default: false })
  is_delivered: boolean;

  @Column({ name: 'delivered_at', nullable: true })
  delivered_at: Date;

  @Column({ nullable: true })
  shipping_address: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
