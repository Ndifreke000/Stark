import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
