import { Injectable } from '@nestjs/common';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestProduct } from 'src/entities/request-product.entity';

@Injectable()
export class RequestProductService {
  constructor(
    @InjectRepository(RequestProduct)
    private requestProductRepository: Repository<RequestProduct>,
  ) {}
  async create(createRequestProductDto: CreateRequestProductDto) {
    return 'osama';
  }

  findAll() {
    return `This action returns all requestProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requestProduct`;
  }

  update(id: number, updateRequestProductDto: UpdateRequestProductDto) {
    return `This action updates a #${id} requestProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestProduct`;
  }
}
