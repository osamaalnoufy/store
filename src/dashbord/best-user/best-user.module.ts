import { Module } from '@nestjs/common';
import { BestUserService } from './best-user.service';
import { BestUserController } from './best-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [BestUserController],
  providers: [BestUserService],
})
export class BestUserModule {}
