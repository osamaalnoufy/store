import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  role: string;
}
