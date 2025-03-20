import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ResetPasswordDto } from 'src/users/Dtos/Auth/ResetPassword/resetPasswordDto.dto';
import { JwtGuard } from 'src/users/Guards/jwt_auth.guard';
import { ResetPasswordService } from 'src/users/Services/Auth/ResetPassword/resetPassword.service';

@Controller('reset-password')
export class ResetPassword {
  constructor(private resetPasswordService: ResetPasswordService) {}
  @Put()
  async resetPasswordDoctor(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.resetPasswordService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }
}
