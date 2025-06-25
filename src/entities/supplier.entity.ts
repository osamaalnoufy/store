import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, MinLength, MaxLength, IsUrl } from 'class-validator';

@Entity('suppliers')
export class Suppliers {
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
    type: 'varchar',
    nullable: true,
  })
  @IsUrl()
  website: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}
