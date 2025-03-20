import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, nullable: false })
  token: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiry_date: Date;

  @ManyToOne(() => Users, (user) => user.resetTokens, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column()
  user_id: number;
}
