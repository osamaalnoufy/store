import { Injectable } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from 'src/entities/tax.entity';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}
  async createOrUpdate(createTexDto: CreateTaxDto) {
    const existingTax = await this.taxRepository.findOne({ where: {} });

    if (!existingTax) {
      const newTax = this.taxRepository.create(createTexDto);
      await this.taxRepository.save(newTax);

      return {
        status: 201,
        message: 'Tax created successfully',
        data: newTax,
      };
    }

    Object.assign(existingTax, createTexDto);
    await this.taxRepository.save(existingTax);

    return {
      status: 200,
      message: 'Tax updated successfully',
      data: existingTax,
    };
  }

  async find() {
    const tax = await this.taxRepository.findOne({ where: {} });

    if (!tax) {
      return {
        status: 404,
        message: 'Tax not found',
      };
    }

    return {
      status: 200,
      message: 'Tax found successfully',
      data: tax,
    };
  }

  async reSet() {
    const existingTax = await this.taxRepository.findOne({ where: {} });

    if (!existingTax) {
      return {
        status: 404,
        message: 'Tax record not found',
      };
    }

    existingTax.taxprice = 0;
    existingTax.shippingprice = 0;

    await this.taxRepository.save(existingTax);

    return {
      status: 200,
      message: 'Tax values reset to zero successfully',
      data: existingTax,
    };
  }
}
