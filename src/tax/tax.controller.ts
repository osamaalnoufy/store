import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { CreateTaxDto } from './dto/create-tax.dto';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('create')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  createOrUpdate(@Body() createTaxDto: CreateTaxDto) {
    return this.taxService.createOrUpdate(createTaxDto);
  }

  @Get()
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async find() {
    return await this.taxService.find();
  }

  @Delete('re-set')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async reSet() {
    return await this.taxService.reSet();
  }
}
