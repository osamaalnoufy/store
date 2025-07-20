import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import {
  IsDate,
  IsInt,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  @IsDate()
  expire_date: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
  })
  discount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateExpireDate() {
    if (this.expire_date < new Date()) {
      throw new Error('Expire date must be in the future');
    }
  }
}
