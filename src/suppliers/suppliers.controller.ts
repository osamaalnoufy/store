import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async create(
    @Body()
    createSuppliersDto: CreateSupplierDto,
  ) {
    return await this.suppliersService.create(createSuppliersDto);
  }

  @Get()
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findAll() {
    return await this.suppliersService.findAll();
  }

  @Get(':id')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findOne(@Param('id') id: number) {
    return await this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async update(
    @Param('id') id: number,
    @Body() updateSuppliersDto: UpdateSupplierDto,
  ) {
    return await this.suppliersService.update(id, updateSuppliersDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async remove(@Param('id') id: number) {
    return await this.suppliersService.remove(id);
  }
}
