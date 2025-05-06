import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async createBrand(imageBrand: string, nameBrand: string, categoryId: number) {
    const brand = await this.brandRepository.findOne({
      where: { name: nameBrand },
    });
    if (brand) {
      throw new HttpException('brand already exist', 400);
    }
    const category_id = await this.categoryRepository.exists({
      where: { id: categoryId },
    });
    if (!category_id) {
      throw new HttpException('category not found', 400);
    }
    try {
      const newBrand = this.brandRepository.create({
        name: nameBrand,
        image: imageBrand,
        category: { id: categoryId },
      });
      await this.brandRepository.save(newBrand);
      return {
        status: 201,
        message: 'brand created successfully',
        date: {
          id: newBrand.id,
          name: newBrand.name,
          image: newBrand.image,
          category_id: newBrand.category.id,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to create brand', 500);
    }
  }
  async findAllBrand(categoryId: number) {
    const brand = await this.brandRepository.find({
      where: { category: { id: categoryId } },
      select: ['id', 'name', 'image'],
    });
    return {
      status: 200,
      message: 'brand found',
      length: brand.length,
      isEmpty: brand.length > 0 ? 'false' : 'true',
      category_id: categoryId,
      date: brand,
    };
  }
  async findOneBrand(id: number) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('brand not found');
    }
    return {
      status: 200,
      message: 'brand found',
      date: brand,
    };
  }
  async deleteBrand(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });
    if (!brand) {
      throw new HttpException('brand not found', 400);
    }
    await this.brandRepository.delete(id);
    return {
      date: 200,
      message: 'brand deleted successfully',
    };
  }
  async updateBrand(id: number, imageBrand: string, name: string) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });
    if (!brand) {
      throw new HttpException('brand not found', 400);
    }
    if (imageBrand && name) {
      brand.image = imageBrand;
      brand.name = name;
    } else if (imageBrand) {
      brand.image = imageBrand;
    } else if (name) {
      brand.name = name;
    }

    await this.brandRepository.save(brand);

    return {
      status: 200,
      message: 'brand updated successfully',
      date: brand,
    };
  }
}
