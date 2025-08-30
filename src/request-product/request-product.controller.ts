import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RequestProductService } from './request-product.service';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('request-product')
export class RequestProductController {
  constructor(private readonly requestProductService: RequestProductService) {}

  @Post('create')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async create(
    @Request() req: any,
    @Body() createRequestProductDto: CreateRequestProductDto,
  ) {
    const { id } = req.user;
    return await this.requestProductService.create(id, createRequestProductDto);
  }

  @Get('find/all')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAll() {
    return await this.requestProductService.findAll();
  }

  @Get('find/:id')
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async findOne(@Param('id') id: number) {
    return await this.requestProductService.findOne(id);
  }
  @Get('my-requestsProduct')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async findMyRequests(@Request() req: any) {
    const { id } = req.user;
    return await this.requestProductService.findUserRequests(id);
  }

  @Patch('update/:id')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async update(
    @Request() req: any,
    @Param('id') id: number,
    @Body() updateRequestProductDto: UpdateRequestProductDto,
  ) {
    return await this.requestProductService.update(
      id,
      updateRequestProductDto,
      req.user.id,
    );
  }

  @Delete('delete/:id')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async remove(@Param('id') id: number) {
    return await this.requestProductService.remove(id);
  }
}
