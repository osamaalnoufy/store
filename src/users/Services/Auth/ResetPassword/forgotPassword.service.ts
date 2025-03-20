import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { ResetToken } from 'src/entities/resetToken.entity';
import { Users } from 'src/entities/users.entity';
import { MailService } from 'src/mailer/mailer.service';
import { Repository } from 'typeorm';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private mailService: MailService,
    @InjectRepository(ResetToken)
    private resetToken: Repository<ResetToken>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}
  async forgotPasswordUser(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const { nanoid } = require('fix-esm').require('nanoid');
      const expiry_date = new Date();
      expiry_date.setHours(expiry_date.getHours() + 1);
      const restToken = nanoid(64);
      const resetTokenObject = this.resetToken.create({
        token: restToken,
        user_id: user.id,
        expiry_date: expiry_date,
      });

      await this.resetToken.save(resetTokenObject);
      this.mailService.sendPasswordResetEmail(email, restToken);
    }
    return { message: 'If this user exists, they will receive an email.' };
  }
}
