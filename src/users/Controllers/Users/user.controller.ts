import { Controller } from '@nestjs/common';
import { AdminService } from 'src/users/Services/Admin/admin.service';
import { UserService } from 'src/users/Services/Users/userService.service';
@Controller('user')
export class UserController {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
  ) {}
}
