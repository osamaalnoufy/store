import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('request-product')
export class RequestProduct {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @Column()
  details: string;

  @Column()
  qauntity: number;

  @Column()
  category: string;
}
