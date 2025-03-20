import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto } from 'src/users/Dtos/Auth/ResetPassword/forgotPasswordDto.dto';
import { ForgotPasswordService } from 'src/users/Services/Auth/ResetPassword/forgotPassword.service';
@Controller('forgot-password')
export class ForgotPassword {
  constructor(private forgotPasswordService: ForgotPasswordService) {}
  @Post('user')
  async forgotPasswordUser(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.forgotPasswordService.forgotPasswordUser(forgotPasswordDto.email);
  }
}
