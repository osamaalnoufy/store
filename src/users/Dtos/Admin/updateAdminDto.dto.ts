import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateAdminDto {
  @IsEmail()
  @IsNotEmpty({ message: 'this field should not be empty' })
  email: string;
}
