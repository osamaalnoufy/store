import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

import { CategoryService } from './category.service';
@Controller('category')
export class CategoryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryService: CategoryService,
  ) {}
  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @UploadedFile() image: Express.Multer.File,
    @Body() createCategoryDto: { name: string },
  ) {
    const imageCategory = await this.cloudinaryService.uploadFile(image);
    return await this.categoryService.createCategory(
      imageCategory,
      createCategoryDto.name,
    );
  }
  @Patch('update/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateCategoryDto: { name: string },
  ) {
    let imageCategory = image
      ? await this.cloudinaryService.uploadFile(image)
      : null;
    return await this.categoryService.updateCategory(
      id,
      imageCategory,
      updateCategoryDto.name,
    );
  }
  @Delete('delete/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async deleteCategory(@Param('id') id: number) {
    return await this.categoryService.deleteCategory(id);
  }
  @Get('find/all')
  async findAllCategory() {
    return await this.categoryService.findAllCategory();
  }
  @Get('find/:id')
  async findOneCategory(@Param('id') id: number) {
    return await this.categoryService.findOneCategory(id);
  }
}
