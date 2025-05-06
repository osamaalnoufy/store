import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { SubCategory } from 'src/entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Category, SubCategory, Product])],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService],
})
export class ProductModule {}
