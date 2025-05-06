import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { SubCategory } from 'src/entities/sub-category.entity';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private subCategorRepository: Repository<SubCategory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
    imageProduct: string,
  ) {
    const product = await this.productRepository.findOneBy({
      name: createProductDto.name,
    });
    if (product) {
      throw new HttpException('This Product already Exist', 400);
    }
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryID },
    });

    if (!category) {
      throw new HttpException('This Category not Exist', 400);
    }
    let subcategory = null;
    if (createProductDto.subCategoryID) {
      const subCategory = await this.subCategorRepository.findOne({
        where: { id: createProductDto.subCategoryID },
      });
      if (!subCategory) {
        throw new HttpException('This Sub Category not Exist', 400);
      }
    }
    let brand = null;
    if (createProductDto.brandID) {
      const brand = await this.brandRepository.findOne({
        where: { id: createProductDto.brandID },
      });
      if (!brand) {
        throw new HttpException('This brand  not Exist', 400);
      }
    }
    const priceAfterDiscount = createProductDto?.priceAfterDiscount || 0;
    if (createProductDto.price < priceAfterDiscount) {
      throw new HttpException(
        'Must be price After discount greater than price',
        400,
      );
    }
    try {
      const newProduct = this.productRepository.create({
        name: createProductDto.name,
        image: imageProduct,
        description: createProductDto.description,
        quantity: createProductDto.quantity,
        price: createProductDto.price,
        price_after_discount: createProductDto.priceAfterDiscount || null,
        category: { id: createProductDto.categoryID },
        subcategory: subcategory
          ? { id: createProductDto.subCategoryID }
          : null,
        brand: brand ? { id: createProductDto.brandID } : null,
      });
      await this.productRepository.save(newProduct);
      return {
        status: 201,
        message: 'product created successfully',
        data: {
          id: newProduct.id,
          name: newProduct.name,
          image: newProduct.image,
          quantity: newProduct.quantity,
          description: newProduct.description,
          price: newProduct.price,
          priceAfterDiscount: newProduct.price_after_discount,
          category_id: newProduct.category.id,
          subcategory_id: newProduct.subcategory?.id || null,
          brand_id: newProduct.brand?.id || null,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to create product', 500);
    }
  }

  // async findAllProduct(query: any) {
 
  // }

  async findOneProduct(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'subcategory', 'brand'],
    });
    if (!product) {
      throw new NotFoundException('Procut Not Found');
    }
    return {
      status: 200,
      message: 'product found',
      data: {
        id: product.id,
        name: product.name,
        image: product.image,
        quantity: product.quantity,
        description: product.description,
        price: product.price,
        priceAfterDiscount: product.price_after_discount,
        category_id: product.category?.id,
        subcategory_id: product.subcategory?.id || null,
        brand_id: product.brand?.id || null,
      },
    };
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    imageProduct: string,
  ) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'subcategory', 'brand'],
    });

    if (!product) {
      throw new HttpException('This product not Exist', 400);
    }
    if (updateProductDto.categoryID) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryID },
      });
      if (!category) {
        throw new HttpException('This Category not Exist', 400);
      }
    }
    if (updateProductDto.subCategoryID) {
      const subCategory = await this.subCategorRepository.findOne({
        where: { id: updateProductDto.subCategoryID },
      });
      if (!subCategory) {
        throw new HttpException('This subCategory not Exist', 400);
      }
    }
    if (updateProductDto.brandID) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateProductDto.brandID },
      });
      if (!brand) {
        throw new HttpException('This subCategory not Exist', 400);
      }
    }
    const price = updateProductDto?.price || product.price;
    const priceAfterDiscount =
      updateProductDto?.priceAfterDiscount || product.price_after_discount;
    if (price < priceAfterDiscount) {
      throw new HttpException(
        'Must be price After discount greater than price',
        400,
      );
    }
    const updatedProduct = {
      ...product,
      name: updateProductDto.name ?? product.name,
      description: updateProductDto.description ?? product.description,
      quantity: updateProductDto.quantity ?? product.quantity,
      price: updateProductDto.price ?? product.price,
      price_after_discount:
        updateProductDto.priceAfterDiscount ?? product.price_after_discount,
      category: updateProductDto.categoryID
        ? { id: updateProductDto.categoryID }
        : product.category,
      subcategory: updateProductDto.subCategoryID
        ? { id: updateProductDto.subCategoryID }
        : product.subcategory,
      brand: updateProductDto.brandID
        ? { id: updateProductDto.brandID }
        : product.brand,
      image: imageProduct || product.image,
    };
    await this.productRepository.save(updatedProduct);
    return {
      status: 200,
      message: 'Product Updated successfully',
      data: {
        id: id,
        name: updatedProduct.name,
        image: updatedProduct.image,
        quantity: updatedProduct.quantity,
        description: updatedProduct.description,
        price: updatedProduct.price,
        priceAfterDiscount: updatedProduct.price_after_discount,
        category_id: updatedProduct.category?.id,
        subcategory_id: updatedProduct.subcategory?.id || null,
        brand_id: updatedProduct.brand?.id || null,
      },
    };
  }

  async removeProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Procut Not Found');
    }
    await this.productRepository.delete(id);
    return {
      date: 200,
      message: 'product deleted successfully',
    };
  }
}
