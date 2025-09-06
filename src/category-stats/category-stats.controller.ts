// // src/category-stats/category-stats.controller.ts
// import { Controller, Get, Query } from '@nestjs/common';
// import { CategoryStatsService } from './category-stats.service';
// import { CategoryStatsResponseDto } from './dto/category-stats.dto';

// @Controller('category-stats')
// export class CategoryStatsController {
//   constructor(private readonly categoryStatsService: CategoryStatsService) {}

//   @Get()
//   async getCategoryStats(
//     @Query('startDate') startDate?: string,
//     @Query('endDate') endDate?: string,
//     @Query('method') method?: string,
//   ): Promise<CategoryStatsResponseDto[]> {
//     const parsedStartDate = startDate ? new Date(startDate) : undefined;
//     const parsedEndDate = endDate ? new Date(endDate) : undefined;

//     if (method === 'optimized') {
//       return this.categoryStatsService.getCategoryStatsOptimized(parsedStartDate, parsedEndDate);
//     } else if (method === 'alternative') {
//       return this.categoryStatsService.getCategoryStatsAlternative(parsedStartDate, parsedEndDate);
//     }
    
//     return this.categoryStatsService.getCategoryStats(parsedStartDate, parsedEndDate);
//   }
// }