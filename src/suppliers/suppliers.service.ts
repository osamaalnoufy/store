import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Suppliers } from 'src/entities/supplier.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers)
    private readonly suppliersRepository: Repository<Suppliers>,
  ) {}

  async create(createSuppliersDto: CreateSupplierDto) {
    try {
      const existingSupplier = await this.suppliersRepository.findOne({
        where: { name: createSuppliersDto.name },
      });

      if (existingSupplier) {
        throw new HttpException(
          'Supplier already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newSupplier = this.suppliersRepository.create(createSuppliersDto);
      await this.suppliersRepository.save(newSupplier);

      return {
        status: HttpStatus.CREATED,
        message: 'Supplier created successfully',
        data: newSupplier,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create supplier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const suppliers = await this.suppliersRepository.find();
      return {
        status: HttpStatus.OK,
        message: 'Suppliers found',
        length: suppliers.length,
        data: suppliers,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch suppliers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
      return {
        status: HttpStatus.OK,
        message: 'Supplier found',
        data: supplier,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch supplier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateSuppliersDto: UpdateSupplierDto) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
      if (
        updateSuppliersDto.name &&
        updateSuppliersDto.name !== supplier.name
      ) {
        const existingSupplier = await this.suppliersRepository.findOne({
          where: { name: updateSuppliersDto.name },
        });

        if (existingSupplier) {
          throw new HttpException(
            'Supplier with this name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      Object.assign(supplier, updateSuppliersDto);
      const updatedSupplier = await this.suppliersRepository.save(supplier);

      return {
        status: HttpStatus.OK,
        message: 'Supplier updated successfully',
        data: updatedSupplier,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to update supplier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      await this.suppliersRepository.remove(supplier);
      return {
        status: HttpStatus.OK,
        message: 'Supplier deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete supplier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
