import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/module/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductModule } from './product/product.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { RequestProductModule } from './request-product/request-product.module';
import { CouponModule } from './coupon/coupon.module';
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'postgres',
        host: `${process.env.DB_HOST}`,
        port: +process.env.DB_PORT,
        username: `${process.env.DB_USERNAME}`,
        password: `${process.env.DB_PASSWORD}`,
        database: `${process.env.DB_NAME}`,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    UsersModule,
    CloudinaryModule,
    ProductModule,
    SubCategoryModule,
    CategoryModule,
    BrandModule,
    RequestProductModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
