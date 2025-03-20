import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { UpdateUserDto } from 'src/users/Dtos/Users/updateUserDto.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'phone', 'age', 'address', 'role'],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return {
      data: user,
    };
  }
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<Users>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (
      updateUserDto.email !== undefined &&
      updateUserDto.email !== user.email
    ) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserWithEmail) {
        throw new ConflictException('email already exists');
      }
      user.email = updateUserDto.email;
    }
    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.age !== undefined) {
      user.age = updateUserDto.age;
    }
    if (
      updateUserDto.phone !== undefined &&
      updateUserDto.phone !== user.phone
    ) {
      const existingUserWithPhone = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingUserWithPhone) {
        throw new ConflictException('phone number already exists');
      }
      user.phone = updateUserDto.phone;
    }
    if (updateUserDto.address !== undefined) {
      user.address = updateUserDto.address;
    }
    await this.userRepository.save(user);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'address', 'age', 'phone'],
    });
    return updatedUser;
  }
  async deleteMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    await this.userRepository.delete(userId);
    return { message: 'user deleted successfully' };
  }
  async uploadPhoto(imageUrl: string, userId: number) {
    const newImage = this.userRepository.create();
    newImage.image = imageUrl;
    newImage.id = userId;
    await this.userRepository.save(newImage, { reload: true });

    return { image_url: newImage.image };
  }
}
