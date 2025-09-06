// // src/category-stats/category-stats.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Between, In } from 'typeorm';
// import { CategoryStatsResponseDto } from './dto/category-stats.dto';
// import { Order } from 'src/entities/order.entity';
// import { Category } from 'src/entities/category.entity';
// import { Product } from 'src/entities/product.entity';

// @Injectable()
// export class CategoryStatsService {
//   constructor(
//     @InjectRepository(Order)
//     private orderRepository: Repository<Order>,
//     @InjectRepository(Category)
//     private categoryRepository: Repository<Category>,
//     @InjectRepository(Product)
//     private productRepository: Repository<Product>,
//   ) {}

//   async getCategoryStats(startDate?: Date, endDate?: Date): Promise<CategoryStatsResponseDto[]> {
//     try {
//       // بناء شرط WHERE للتاريخ
//       const whereCondition: any = {};
//       if (startDate && endDate) {
//         whereCondition.created_at = Between(
//           new Date(startDate.setHours(0, 0, 0, 0)),
//           new Date(endDate.setHours(23, 59, 59, 999))
//         );
//       }

//       // الحل: استخدام Query Builder لجلب العلاقات بشكل صحيح
//       const orders = await this.orderRepository
//         .createQueryBuilder('order')
//         .leftJoinAndSelect('order.cart_items', 'cart_item')
//         .leftJoinAndSelect('cart_item.product', 'product')
//         .leftJoinAndSelect('product.category', 'category') // هذه هي العلاقة المطلوبة
//         .where(whereCondition)
//         .getMany();

//       // إذا لم تنجح الطريقة أعلاه، استخدم الطريقة البديلة
//       if (!orders || orders.length === 0) {
//         return this.getCategoryStatsAlternative(startDate, endDate);
//       }

//       // جلب جميع الفئات
//       const categories = await this.categoryRepository.find();
//       const categoryStatsMap = new Map<number, CategoryStatsResponseDto>();

//       // تهيئة الخريطة بجميع الفئات
//       categories.forEach(category => {
//         categoryStatsMap.set(category.id, {
//           categoryId: category.id,
//           categoryName: category.name,
//           ordersCount: 0,
//           totalRevenue: 0,
//           productsSold: 0
//         });
//       });

//       // معالجة كل طلب وجمع الإحصائيات
//       orders.forEach(order => {
//         const processedCategories = new Set<number>();
        
//         order.cart_items.forEach(item => {
//           // الآن product.category يجب أن يكون متوفراً
//           if (item.product && item.product.category) {
//             const categoryId = item.product.category.id;
            
//             if (categoryStatsMap.has(categoryId)) {
//               const stats = categoryStatsMap.get(categoryId);
              
//               // زيادة عدد المنتجات المباعة
//               stats.productsSold += item.quantity;
              
//               // حساب الإيراد
//               const productPrice = item.product.price_after_discount || item.product.price;
//               stats.totalRevenue += productPrice * item.quantity;
              
//               // زيادة عدد الطلبات (مرة واحدة لكل فئة في الطلب)
//               if (!processedCategories.has(categoryId)) {
//                 stats.ordersCount += 1;
//                 processedCategories.add(categoryId);
//               }
              
//               categoryStatsMap.set(categoryId, stats);
//             }
//           }
//         });
//       });

//       // تحويل الخريطة إلى مصفوفة وترتيبها
//       const result = Array.from(categoryStatsMap.values());
//       return result.sort((a, b) => b.totalRevenue - a.totalRevenue);

//     } catch (error) {
//       console.error('Error in getCategoryStats:', error);
//       // استخدام الطريقة البديلة كحل احتياطي
//       return this.getCategoryStatsAlternative(startDate, endDate);
//     }
//   }

//   // الطريقة البديلة الأكثر موثوقية
//   async getCategoryStatsAlternative(startDate?: Date, endDate?: Date): Promise<CategoryStatsResponseDto[]> {
//     try {
//       const whereCondition: any = {};
//       if (startDate && endDate) {
//         whereCondition.created_at = Between(
//           new Date(startDate.setHours(0, 0, 0, 0)),
//           new Date(endDate.setHours(23, 59, 59, 999))
//         );
//       }

//       // جلب الطلبات فقط مع cart_items (بدون relations)
//       const orders = await this.orderRepository.find({
//         where: whereCondition,
//         relations: ['cart_items'],
//       });

//       // استخراج جميع product IDs من جميع الطلبات
//       const productIds = orders.flatMap(order => 
//         order.cart_items.map(item => item.productId)
//       ).filter((id, index, array) => array.indexOf(id) === index);

//       if (productIds.length === 0) {
//         return [];
//       }

//       // جلب المنتجات مع علاقاتها بالفئات باستخدام Query Builder
//       const products = await this.productRepository
//         .createQueryBuilder('product')
//         .leftJoinAndSelect('product.category', 'category')
//         .where('product.id IN (:...productIds)', { productIds })
//         .getMany();

//       // إنشاء خريطة للمنتجات مع فئاتها
//       const productCategoryMap = new Map<number, { categoryId: number, categoryName: string, price: number, priceAfterDiscount: number }>();
//       products.forEach(product => {
//         if (product.category) {
//           productCategoryMap.set(product.id, {
//             categoryId: product.category.id,
//             categoryName: product.category.name,
//             price: product.price,
//             priceAfterDiscount: product.price_after_discount
//           });
//         }
//       });

//       // جلب جميع الفئات
//       const categories = await this.categoryRepository.find();
//       const categoryStatsMap = new Map<number, CategoryStatsResponseDto>();

//       // تهيئة الخريطة
//       categories.forEach(category => {
//         categoryStatsMap.set(category.id, {
//           categoryId: category.id,
//           categoryName: category.name,
//           ordersCount: 0,
//           totalRevenue: 0,
//           productsSold: 0
//         });
//       });

//       // معالجة الطلبات
//       orders.forEach(order => {
//         const processedCategories = new Set<number>();
        
//         order.cart_items.forEach(item => {
//           const productInfo = productCategoryMap.get(item.productId);
          
//           if (productInfo && categoryStatsMap.has(productInfo.categoryId)) {
//             const stats = categoryStatsMap.get(productInfo.categoryId);
            
//             stats.productsSold += item.quantity;
//             const productPrice = productInfo.priceAfterDiscount || productInfo.price;
//             stats.totalRevenue += productPrice * item.quantity;
            
//             if (!processedCategories.has(productInfo.categoryId)) {
//               stats.ordersCount += 1;
//               processedCategories.add(productInfo.categoryId);
//             }
            
//             categoryStatsMap.set(productInfo.categoryId, stats);
//           }
//         });
//       });

//       return Array.from(categoryStatsMap.values())
//         .sort((a, b) => b.totalRevenue - a.totalRevenue);

//     } catch (error) {
//       console.error('Error in getCategoryStatsAlternative:', error);
//       return [];
//     }
//   }

//   // الطريقة المحسنة باستخدام Query Builder فقط (الأفضل للأداء)
//   async getCategoryStatsOptimized(startDate?: Date, endDate?: Date): Promise<CategoryStatsResponseDto[]> {
//     try {
//       let query = this.orderRepository
//         .createQueryBuilder('order')
//         .innerJoin('order.cart_items', 'cart_item')
//         .innerJoin('cart_item.product', 'product')
//         .innerJoin('product.category', 'category')
//         .select([
//           'category.id as categoryId',
//           'category.name as categoryName',
//           'COUNT(DISTINCT order.id) as ordersCount',
//           'SUM(cart_item.quantity) as productsSold',
//           'SUM((COALESCE(product.price_after_discount, product.price) * cart_item.quantity)) as totalRevenue'
//         ])
//         .groupBy('category.id, category.name');

//       // إضافة فلتر التاريخ
//       if (startDate && endDate) {
//         const adjustedStartDate = new Date(startDate);
//         adjustedStartDate.setHours(0, 0, 0, 0);
//         const adjustedEndDate = new Date(endDate);
//         adjustedEndDate.setHours(23, 59, 59, 999);
        
//         query = query.where('order.created_at BETWEEN :startDate AND :endDate', {
//           startDate: adjustedStartDate,
//           endDate: adjustedEndDate
//         });
//       }

//       const rawResults = await query.getRawMany();

//       return rawResults.map(result => ({
//         categoryId: result.categoryid,
//         categoryName: result.categoryname,
//         ordersCount: parseInt(result.orderscount) || 0,
//         totalRevenue: parseFloat(result.totalrevenue) || 0,
//         productsSold: parseInt(result.productssold) || 0
//       })).sort((a, b) => b.totalRevenue - a.totalRevenue);

//     } catch (error) {
//       console.error('Error in getCategoryStatsOptimized:', error);
//       return this.getCategoryStatsAlternative(startDate, endDate);
//     }
//   }
// }