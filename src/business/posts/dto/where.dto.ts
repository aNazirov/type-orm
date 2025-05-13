import { IsDateString, IsOptional, IsString } from 'class-validator';

export class WhereDTO {
  @IsOptional()
  @IsString()
  userId?: number;

  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
