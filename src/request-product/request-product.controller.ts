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
import { RequestProductService } from './request-product.service';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('request-product')
export class RequestProductController {
  constructor(private readonly requestProductService: RequestProductService) {}

  @Post()
  @Roles(['user'])
  @UseGuards(UsersGuard)
  create(@Body() createRequestProductDto: CreateRequestProductDto) {
    return this.requestProductService.create(createRequestProductDto);
  }

  @Get()
  findAll() {
    return this.requestProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestProductService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequestProductDto: UpdateRequestProductDto,
  ) {
    return this.requestProductService.update(+id, updateRequestProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestProductService.remove(+id);
  }
}
