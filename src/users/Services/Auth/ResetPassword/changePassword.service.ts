import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from 'src/entities/admin.entity';
@Injectable()
export class ChangePasswordService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}
  async changePasswordUser(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.password) {
      throw new UnauthorizedException('No password set for this user');
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }
  async changePasswordAdmin(
    adminId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) {
      throw new NotFoundException('admin not found');
    }
    if (!admin.password) {
      throw new UnauthorizedException('No password set for this admin');
    }
    const passwordMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = newHashedPassword;
    await this.adminRepository.save(admin);
    return { message: 'Password changed successfully' };
  }
  async addPassword(
    userId: number,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log('user found', user);
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }
}
