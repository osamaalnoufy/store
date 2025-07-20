import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Tokens } from './tokens.entity';
import { ResetToken } from './resetToken.entity';
import * as bcrypt from 'bcrypt';
import { RequestProduct } from './request-product.entity';
import { Cart } from './cart.entity';
import { Review } from './review.entity';
import { Order } from './order.entity';
@Entity('users')
export class Users {
  @PrimaryColumn('int')
  id: number;

  @Column('character varying', { nullable: false, length: 25 })
  @Index('idx_name', ['name'])
  name: string;

  @Column('character varying', { nullable: false })
  @Index('idx_unique_email', { unique: true })
  email: string;

  @Column('character varying', { nullable: true, length: 10 })
  @Index('idx_unique_phone', { unique: true })
  phone: string;

  @Column('character varying', { nullable: true, length: 60 })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password !== null) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column('int', { nullable: true })
  age: number;

  @Column('character varying', { nullable: true, length: 50 })
  address: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Tokens, (tokens) => tokens.user, {
    eager: false,
    cascade: true,
  })
  tokens: Tokens[];
  @OneToMany(() => ResetToken, (resetToken) => resetToken.user, {
    eager: false,
    cascade: true,
  })
  resetTokens: ResetToken[];

  @OneToMany(() => RequestProduct, (requestProduct) => requestProduct.user, {
    eager: false,
    cascade: true,
  })
  requestProducts: RequestProduct[];

  @OneToMany(() => Cart, (cart) => cart.user, {
    eager: false,
    cascade: true,
  })
  carts: Cart[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Order, (order) => order.user, {
    eager: false,
    cascade: true,
  })
  orders: Order[];
}
