import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBrandDto } from './dto/createBrandDto.dto';

@Controller('brand')
export class BrandController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly brandService: BrandService,
  ) {}
  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createBrand(
    @UploadedFile() image: Express.Multer.File,
    @Body() createBrandDto: CreateBrandDto,
  ) {
    const imageBrand = await this.cloudinaryService.uploadFile(image);
    const category_id = Number(createBrandDto.category_id);
    if (isNaN(category_id)) {
      throw new HttpException('category Id must be a valid number', 400);
    }
    return await this.brandService.createBrand(
      imageBrand,
      createBrandDto.name,
      category_id,
    );
  }
  @Get('find/all')
  async findAllBrand(@Body() body: { category_id: number }) {
    return await this.brandService.findAllBrand(body.category_id);
  }
  @Get('find/:id')
  async findOneBrand(@Param('id') id: number) {
    return await this.brandService.findOneBrand(id);
  }
  @Delete('delete/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async deleteBrand(@Param('id') id: number) {
    return await this.brandService.deleteBrand(id);
  }
  @Patch('update/:id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateBrand(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateBrandDto: { name: string },
  ) {
    let imageBrand = image
      ? await this.cloudinaryService.uploadFile(image)
      : null;
    return await this.brandService.updateBrand(
      id,
      imageBrand,
      updateBrandDto.name,
    );
  }
}
