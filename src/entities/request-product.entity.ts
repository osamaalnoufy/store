import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { IsInt, IsString, MinLength, Min } from 'class-validator';
import { Users } from './users.entity';

@Entity('request_products')
export class RequestProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @IsString()
  name: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  @IsString()
  @MinLength(5, { message: 'Details must be at least 5 characters' })
  details: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1 product' })
  quantity: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @IsString()
  category: string;

  @ManyToOne(() => Users, (user) => user.requestProducts)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
