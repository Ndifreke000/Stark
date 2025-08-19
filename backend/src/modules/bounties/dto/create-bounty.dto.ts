import { IsString, IsNumber, MinLength, Min, IsOptional, IsEnum } from 'class-validator';
import { BountyStatus } from '@prisma/client';

export class CreateBountyDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsNumber()
  @Min(0)
  reward_amount: number;

  @IsOptional()
  @IsEnum(BountyStatus)
  status?: BountyStatus;
}