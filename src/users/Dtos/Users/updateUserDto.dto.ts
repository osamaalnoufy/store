import { SignUp } from '../Auth/authDto.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
export class UpdateUserDto extends PartialType(
  OmitType(SignUp, ['password'] as const),
) {}
