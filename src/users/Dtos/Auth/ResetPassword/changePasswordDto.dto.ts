import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'this field must be a string' })
  @IsNotEmpty({ message: 'this field should not be empty' })
  oldPassword: string;
  @IsString({ message: 'this field must be a string' })
  @IsNotEmpty({ message: 'this field should not be empty' })
  @MaxLength(30)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
