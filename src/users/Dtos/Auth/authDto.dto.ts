import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsStrongPassword,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SignUp {
  @IsString({ message: 'this field must be a string' })
  @IsNotEmpty({ message: 'this field should not be empty' })
  @MaxLength(25)
  name: string;
  @IsEmail()
  @IsNotEmpty({ message: 'this field should not be empty' })
  email: string;
  @IsNumberString()
  @IsMobilePhone('ar-SY')
  @IsNotEmpty({ message: 'this field should not be empty' })
  phone: string;
  @IsNumber()
  @IsNotEmpty({ message: 'this field should not be empty' })
  @Max(100)
  @Min(10)
  age: number;
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
  password: string;
  @IsString({ message: 'this field must be a string' })
  @IsNotEmpty({ message: 'this field should not be empty' })
  @MaxLength(50)
  address: string;
}

export class VerifyTheEmailDto {
  @IsNotEmpty({ message: 'This field should not be empty' })
  @IsString()
  token: string;
}

