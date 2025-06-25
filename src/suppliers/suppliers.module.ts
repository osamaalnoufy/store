import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suppliers } from 'src/entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Suppliers])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
