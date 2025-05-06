import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async createCategory(imageCategory: string, nameCategory: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: nameCategory },
    });
    if (category) {
      throw new HttpException('Category already exist', 400);
    }
    try {
      const newCategory = this.categoryRepository.create({
        name: nameCategory,
        image: imageCategory,
      });
      await this.categoryRepository.save(newCategory);
      return {
        status: 201,
        message: 'Category created successfully',
        date: newCategory,
      };
    } catch (error) {
      throw new HttpException('Failed to create category', 500);
    }
  }
  async updateCategory(id: number, imageCategory: string, name: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new HttpException('Category not found', 400);
    }
    if (imageCategory && name) {
      category.image = imageCategory;
      category.name = name;
    } else if (imageCategory) {
      category.image = imageCategory;
    } else if (name) {
      category.name = name;
    }

    await this.categoryRepository.save(category);

    return {
      status: 200,
      message: 'Category updated successfully',
      date: category,
    };
  }
  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new HttpException('Category not found', 400);
    }
    await this.categoryRepository.delete(id);
    return {
      date: 200,
      message: 'Category deleted successfully',
    };
  }
  async findAllCategory() {
    const category = await this.categoryRepository.find();
    return {
      status: 200,
      message: 'category found',
      length: category.length,
      isEmpty: category.length > 0 ? 'false' : 'true',
      date: category,
    };
  }
  async findOneCategory(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('category not found');
    }
    return {
      status: 200,
      message: 'category found',
      date: category,
    };
  }
}
