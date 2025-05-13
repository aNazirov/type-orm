import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  UserRequest,
  UserRequestData,
} from 'src/common/decorators/user-request';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthService } from './auth.service';
import { DTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: DTO.SignupDTO) {
    return this.authService.signup(data);
  }

  @Post('signin')
  signin(@Body() data: DTO.SigninDTO) {
    return this.authService.signin(data);
  }

  @Get('token')
  @UseGuards(AuthGuard)
  signinWithToken(@UserRequestData() currentUser: UserRequest) {
    return this.authService.signinWithToken(currentUser);
  }
}
