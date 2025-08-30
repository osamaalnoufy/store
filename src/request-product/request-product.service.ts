import { HttpException, Injectable } from '@nestjs/common';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestProduct } from 'src/entities/request-product.entity';
import { Users } from 'src/entities/users.entity';

@Injectable()
export class RequestProductService {
  constructor(
    @InjectRepository(RequestProduct)
    private requestProductRepository: Repository<RequestProduct>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  async create(
    userID: number,
    createRequestProductDto: CreateRequestProductDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userID } });
    if (!user) {
      throw new HttpException('user not found', 400);
    }
    const reqProduct = await this.requestProductRepository.findOne({
      where: { name: createRequestProductDto.name },
    });
    if (reqProduct) {
      throw new HttpException('This RequestProduct already Exist', 400);
    }
    try {
      const newReqProduct = this.requestProductRepository.create({
        name: createRequestProductDto.name,
        details: createRequestProductDto.details,
        quantity: createRequestProductDto.quantity,
        category: createRequestProductDto.category,
        user: user,
      });
      await this.requestProductRepository.save(newReqProduct);
      return {
        status: 201,
        message: 'Requestproduct created successfully',
        data: {
          id: newReqProduct.id,
          name: newReqProduct.name,
          details: newReqProduct.details,
          quantity: newReqProduct.quantity,
          category: newReqProduct.category,
          user_id: newReqProduct.user.id,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to create RequestProduct', 500);
    }
  }

  async findAll() {
    const reqProduct = await this.requestProductRepository.find({
      relations: ['user'],
    });
    const modifiedData = reqProduct.map((reqProduct) => ({
      id: reqProduct.id,
      name: reqProduct.name,
      details: reqProduct.details,
      quantity: reqProduct.quantity,
      category: reqProduct.category,
      user: reqProduct.user.id,
    }));
    return {
      status: 200,
      message: 'Coupons found',
      length: reqProduct.length,
      data: modifiedData,
    };
  }

  async findOne(id: number) {
    const reqProduct = await this.requestProductRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reqProduct) {
      throw new HttpException('requestProduct not found', 400);
    }
    return {
      status: 200,
      message: 'RequestProduct found',
      data: {
        id: reqProduct.id,
        name: reqProduct.name,
        details: reqProduct.details,
        quantity: reqProduct.quantity,
        category: reqProduct.category,
        user_id: reqProduct.user.id,
      },
    };
  }

  async findUserRequests(user_id: number) {
    const userRequests = await this.requestProductRepository.find({
      where: { user: { id: user_id } },
      relations: ['user'],
    });

    if (!userRequests || userRequests.length === 0) {
      throw new HttpException('No requests found for this user', 404);
    }

    return {
      status: 200,
      message: 'User requests found',
      data: userRequests.map((reqProduct) => ({
        id: reqProduct.id,
        name: reqProduct.name,
        details: reqProduct.details,
        quantity: reqProduct.quantity,
        category: reqProduct.category,
        user_id: reqProduct.user.id,
      })),
    };
  }

  async update(
    id: number,
    updateRequestProductDto: UpdateRequestProductDto,
    userID: number,
  ) {
    const reqProduct = await this.requestProductRepository.findOne({
      where: { id },
    });
    if (!reqProduct) {
      throw new HttpException('requestProduct not found', 400);
    }
    const user = await this.userRepository.findOne({ where: { id: userID } });
    if (!user) {
      throw new HttpException('user not found', 400);
    }
    const updatedRequestProduct = {
      ...reqProduct,
      name: updateRequestProductDto.name ?? reqProduct.name,
      details: updateRequestProductDto.details ?? reqProduct.details,
      quantity: updateRequestProductDto.quantity ?? reqProduct.quantity,
      category: updateRequestProductDto.category ?? reqProduct.category,
    };
    await this.requestProductRepository.save(updatedRequestProduct);
    return {
      status: 200,
      message: 'RequesstProduct Updated successfully',
      data: {
        id: id,
        name: updatedRequestProduct.name,
        details: updatedRequestProduct.details,
        quantity: updatedRequestProduct.quantity,
        category: updatedRequestProduct.category,
        user_id: userID,
      },
    };
  }

  async remove(id: number) {
    const reqProduct = await this.requestProductRepository.findOne({
      where: { id },
    });
    if (!reqProduct) {
      throw new HttpException('requestProduct not found', 400);
    }
    await this.requestProductRepository.delete(id);
    return {
      date: 200,
      message: 'requestProduct deleted successfully',
    };
  }
}
