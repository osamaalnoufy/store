import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { UserService } from 'src/users/Services/Users/userService.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [CloudinaryService, CloudinaryProvider, UserService],
  exports: [],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
