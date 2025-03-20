import { Controller } from '@nestjs/common';
import { AdminService } from 'src/users/Services/Admin/admin.service';
import { UserService } from 'src/users/Services/Users/userService.service';
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
  ) {}
}
