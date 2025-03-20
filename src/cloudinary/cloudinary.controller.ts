import {
  Controller,
  Put,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtGuard } from 'src/users/Guards/jwt_auth.guard';
import { UserService } from 'src/users/Services/Users/userService.service';

@Controller()
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
  ) {}
  @UseGuards(JwtGuard)
  @Put('user/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async useruploadPhoto(
    @Request() req,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    const secureUrl = await this.cloudinaryService.uploadFile(image);
    await this.userService.uploadPhoto(secureUrl, userId);
    return { message: 'The image has been changed successfully' };
  }
}
