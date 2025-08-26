import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductFilterDto } from './dto/product-filter-Dto.dto';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @UploadedFile() image: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    const imageProduct = await this.cloudinaryService.uploadFile(image);
    return await this.productService.createProduct(
      createProductDto,
      imageProduct,
    );
  }

  @Get('find/all')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findAllProduct(@Query() filter: ProductFilterDto) {
    return await this.productService.findAllProduct(filter);
  }

  @Get('find/:id')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findOneProduct(@Param('id') id: number) {
    return await this.productService.findOneProduct(id);
  }

  @Patch('update/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    let imageProduct = image
      ? await this.cloudinaryService.uploadFile(image)
      : null;
    return await this.productService.updateProduct(
      id,
      updateProductDto,
      imageProduct,
    );
  }

  @Delete('delete/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async removeProduct(@Param('id') id: number) {
    return await this.productService.removeProduct(id);
  }

  @Get('top-selling')
  async getTopSelling() {
    return await this.productService.getTopSellingProducts();
  }

  @Get('newest')
  async getNewestProducts() {
    return await this.productService.getNewestProducts();
  }
}
