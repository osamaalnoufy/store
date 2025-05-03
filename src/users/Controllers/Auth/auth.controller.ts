import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SignUp, VerifyTheEmailDto } from 'src/users/Dtos/Auth/authDto.dto';
import { GoogleGuard } from 'src/users/Guards/google_auth.guard';
import { LocalAuthGuardAdmin } from 'src/users/Guards/Local_auth_admin.guard';
import { LocalAuthGuard } from 'src/users/Guards/local_auth_user.guard';
import { AuthService } from 'src/users/Services/Auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuardAdmin)
  @Post('login/admin')
  async loginAdmin(@Request() req: any) {
    return this.authService.loginAdmin(req.admin);
  }
  @Post('sign-up')
  async signUp(@Body() signUp: SignUp) {
    return await this.authService.signUp(signUp);
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }
  @Post('verify-the-email')
  async verifyTheEmail(@Body() verifyTheEmailDto: VerifyTheEmailDto) {
    return await this.authService.verifyTheEmail(verifyTheEmailDto.token);
  }

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Request() req: any) {
    const userObj = req.user as any;
    const user = {
      id: userObj.profile.id,
      email: userObj.profile.emails[0].value,
      name: userObj.profile.displayName,
    };
    return await this.callbackSign(user);
  }
  @Post('callback/sign')
  async callbackSign(user: any) {
    return await this.authService.validateUserByGoogle(user);
  }
  @Post('refresh-token')
  async refreshToken(@Body() refresh_token: string) {
    return await this.authService.refreshToken(refresh_token);
  }
}
