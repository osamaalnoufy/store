import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  @Patch('update/:id')
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
