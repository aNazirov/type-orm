import { IsEmail, IsString } from 'class-validator';

export class SignupDTO {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
