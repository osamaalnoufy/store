import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SubCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from 'src/entities/sub-category.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private subCategorRepository: Repository<SubCategory>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async createSubCategory(subCategoryDto: SubCategoryDto) {
    const subCategory = await this.subCategorRepository.findOne({
      where: { name: subCategoryDto.name },
    });
    if (subCategory) {
      throw new HttpException('sub category already exist', 400);
    }
    const category = await this.categoryRepository.findOne({
      where: { id: subCategoryDto.categoryID },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }
    try {
      const newSubCategory = this.subCategorRepository.create({
        name: subCategoryDto.name,
        category: { id: subCategoryDto.categoryID },
      });
      await this.subCategorRepository.save(newSubCategory);
      return {
        status: 201,
        message: 'sub category created successfully',
        date: {
          id: newSubCategory.id,
          name: newSubCategory.name,
          category_id: newSubCategory.category.id,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to create sup-category', 500);
    }
  }

  async findAllSubCategory(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }
    const subCategory = await this.subCategorRepository.find({
      where: { category: { id: categoryId } },
      select: ['id', 'name'],
    });
    return {
      status: 200,
      message: 'subCategory found',
      length: subCategory.length,
      isEmpty: subCategory.length > 0 ? 'false' : 'true',
      category_id: categoryId,
      date: subCategory,
    };
  }
  async findOneSubCategory(id: number) {
    const subCategory = await this.subCategorRepository.findOne({
      where: { id },
    });
    if (!subCategory) {
      throw new NotFoundException('subCategory not found');
    }
    return {
      status: 200,
      message: 'subCategory found',
      date: subCategory,
    };
  }
  async deleteSubCategory(id: number) {
    const subCategory = await this.subCategorRepository.findOne({
      where: { id },
    });
    if (!subCategory) {
      throw new HttpException('subCategory not found', 400);
    }
    await this.subCategorRepository.delete(id);
    return {
      date: 200,
      message: 'subCategory deleted successfully',
    };
  }
  async updateSubCategory(id: number, name: string) {
    const subCategory = await this.subCategorRepository.findOne({
      where: { id },
    });
    if (!subCategory) {
      throw new HttpException('subCategory not found', 400);
    }

    subCategory.name = name;

    await this.subCategorRepository.save(subCategory);

    return {
      status: 200,
      message: 'subCategory updated successfully',
      date: subCategory,
    };
  }
}
