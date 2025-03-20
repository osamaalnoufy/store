import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Users } from 'src/entities/users.entity';
import { SignUp } from 'src/users/Dtos/Auth/authDto.dto';
import { Like, Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async findAllUsers(query) {
    const {
      limit = 1000_000_000,
      skip = 0,
      sort = 'asc',
      name,
      email,
      role,
    } = query;

    if (Number.isNaN(Number(+limit))) {
      throw new HttpException('Invalid limit value', 400);
    }

    if (Number.isNaN(Number(+skip))) {
      throw new HttpException('Invalid skip value', 400);
    }

    if (!['asc', 'desc'].includes(sort)) {
      throw new HttpException(
        'Invalid sort value it must be "asc" or "desc" ',
        400,
      );
    }
    const users = await this.userRepository.find({
      skip: +skip,
      take: +limit,
      where: [
        { name: Like(`%${name}%`) },
        { email: Like(`%${email}%`) },
        { role: Like(`%${role}%`) },
      ].filter((condition) => Object.values(condition)[0]),
      order: {
        id: sort === 'asc' ? 'ASC' : 'DESC',
      },
      select: ['id', 'name', 'email', 'role', 'age', 'address', 'phone'],
    });

    return  {
      status: 200,
      message: 'users retrieeved success fully',
      length: users.length,
      data: users,
    };
  }
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'age', 'address', 'phone'],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return {
      data: user,
    };
  }
  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'age', 'address', 'phone'],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    await this.userRepository.delete(id);
    return {
      message: 'delete user success',
    };
  }
  async getMe(adminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      select: ['id', 'email', 'role'],
    });
    if (!admin) {
      throw new NotFoundException('admin not found');
    }
    return {
      data: admin,
    };
  }
  async update(id: number, email: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('admin is not found');
    }
    admin.email = email;
    await this.adminRepository.save(admin);
    const updateAdmin = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'email'],
    });
    return updateAdmin;
  }
}
