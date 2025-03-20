import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('tokens')
export class Tokens {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 64, nullable: false })
  token: string;
  @Column({ type: 'timestamptz', nullable: false })
  expiry_date: Date;
  @ManyToOne(() => Users, (user) => user.tokens, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: Users;
  @Column()
  user_id: number;
}
