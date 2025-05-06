import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { Roles } from 'src/users/Guards/roles.decorator';
import { SubCategoryDto } from './dto/create-category.dto';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async createSubCategory(@Body() subCategoryDto: SubCategoryDto) {
    return await this.subCategoryService.createSubCategory(subCategoryDto);
  }
  @Get('find/all')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findAllSubCategory(@Body() body: { category_id: number }) {
    let categoryId = body.category_id;
    if (!categoryId) {
      throw new BadRequestException(
        'category_id is missing in the request body',
      );
    }
    return await this.subCategoryService.findAllSubCategory(body.category_id);
  }
  @Get('find/:id')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findOneSubCategory(@Param('id') id: number) {
    return await this.subCategoryService.findOneSubCategory(id);
  }
  @Delete('delete/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async deleteSubCategory(@Param('id') id: number) {
    return await this.subCategoryService.deleteSubCategory(id);
  }
  @Put('update/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async updateSubCategory(
    @Param('id') id: number,

    @Body() updateBrandDto: { name: string },
  ) {
    return await this.subCategoryService.updateSubCategory(
      id,
      updateBrandDto.name,
    );
  }
}
