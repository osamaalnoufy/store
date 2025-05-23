import { Module } from '@nestjs/common';
import { RequestProductService } from './request-product.service';
import { RequestProductController } from './request-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestProduct } from 'src/entities/request-product.entity';
import { Users } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestProduct, Users])],
  controllers: [RequestProductController],
  providers: [RequestProductService],
})
export class RequestProductModule {}
