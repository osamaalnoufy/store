import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Brand } from 'src/entities/brand.entity';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { Category } from 'src/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand,Category])],
  controllers: [BrandController],
  providers: [BrandService,CloudinaryService],
})
export class BrandModule {}