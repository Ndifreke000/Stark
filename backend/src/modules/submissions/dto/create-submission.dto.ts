import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  bounty_id: string;

  @IsUrl()
  @MinLength(10)
  link_to_work: string;
}