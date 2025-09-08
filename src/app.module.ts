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
import { CartModule } from './cart/cart.module';
import { TaxModule } from './tax/tax.module';
import { ReviewModule } from './review/review.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrderModule } from './order/order.module';
import { AiProxyController } from './ai-proxy/ai-proxy.controller';
import { TopProductsModule } from './dashbord/top-products/top-products.module';
import { OrderStatsModule } from './dashbord/order-stats/order-stats.module';
import { InventoryModule } from './dashbord/low-stock/low-stock.module';
import { ReviewsModule } from './dashbord/reviews/reviews.module';


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
    CartModule,
    TaxModule,
    ReviewModule,
    SuppliersModule,
    OrderModule,
    OrderStatsModule,
    TopProductsModule,
    InventoryModule,
    ReviewsModule,
  ],
  controllers: [AppController, AiProxyController],
  providers: [AppService],
})
export class AppModule {}
