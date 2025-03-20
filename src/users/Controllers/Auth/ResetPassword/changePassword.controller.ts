import { Body, Controller, Put, Request, UseGuards } from '@nestjs/common';
import { ChangePasswordDto } from 'src/users/Dtos/Auth/ResetPassword/changePasswordDto.dto';
import { JwtGuard } from 'src/users/Guards/jwt_auth.guard';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { ChangePasswordService } from 'src/users/Services/Auth/ResetPassword/changePassword.service';

@Controller()
export class ChangePassword {
  constructor(private changePasswordService: ChangePasswordService) {}
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    const { role, id } = req.user;
    if (role === 'user') {
      return await this.changePasswordService.changePasswordUser(
        id,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
    } else if (role === 'admin') {
      return await this.changePasswordService.changePasswordAdmin(
        id,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
    }
  }
  @UseGuards(JwtGuard)
  @Put('add-password')
  async addPassword(@Body() body: { password: string }, @Request() req: any) {
    return await this.changePasswordService.addPassword(req.user.id, body.password);
  }
}
