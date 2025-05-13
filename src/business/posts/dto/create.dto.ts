import { IsString } from 'class-validator';

export class CreateDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
