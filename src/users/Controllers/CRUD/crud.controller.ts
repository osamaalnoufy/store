import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Delete,
  Body,
  Request,
  Patch,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/users/Dtos/Users/updateUserDto.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';
import { AdminService } from 'src/users/Services/Admin/admin.service';
import { UserService } from 'src/users/Services/Users/userService.service';
@Controller('crud')
export class CrudController {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
  ) {}

  @Get('all/users')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findAllUsers(@Query() query) {
    return await this.adminService.findAllUsers(query);
  }
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async findOne(@Param('id') id: number) {
    return await this.adminService.findOne(id);
  }
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async remove(@Param('id') id: number) {
    return await this.adminService.remove(id);
  }
  @Get()
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async getMe(@Request() req) {
    const { role, id } = req.user;
    if (role === 'admin') {
      return await this.adminService.getMe(id);
    } else if (role === 'user') {
      return await this.userService.getMe(id);
    }
  }
  @Patch()
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  async updateMe(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @Body() body: { email: string },
  ) {
    const { role, id } = req.user;
    if (role === 'admin') {
      return await this.adminService.update(id, body.email);
    } else if (role === 'user') {
      return await this.userService.update(id, updateUserDto);
    }
  }

  @Delete()
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async deleteMe(@Request() req) {
    const { id } = req.user;
    return await this.userService.deleteMe(id);
  }
}
