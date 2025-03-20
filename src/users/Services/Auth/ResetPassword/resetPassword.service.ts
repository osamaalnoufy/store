import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ResetToken } from 'src/entities/resetToken.entity';
@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(ResetToken)
    private resetToken: Repository<ResetToken>,
  ) {}
  async resetPassword(newPassword: string, resetToken: string) {
    const token = await this.resetToken.findOne({
      where: {
        token: resetToken,
        expiry_date: MoreThanOrEqual(new Date()),
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }
    const user = await this.userRepository.findOne({
      where: { id: token.user_id },
    });
    if (!user) {
      throw new InternalServerErrorException();
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }
}
