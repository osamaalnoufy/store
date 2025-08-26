import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { Cart } from 'src/entities/cart.entity';
import { Tax } from 'src/entities/tax.entity';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart, Tax, Product])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
