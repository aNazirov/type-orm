import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Common } from 'src/common';
import { UserRequest } from 'src/common/decorators/user-request';
import { Repository } from 'typeorm';
import { DTO } from './dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signinWithToken(userRequest: UserRequest) {
    try {
      const user = await this.usersRepository.findOneBy({
        id: userRequest.uId,
      });

      if (!user) {
        throw new Common.Utils.Error(`User  not found`, 404);
      }

      delete user.password;

      return user;
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async signin(params: DTO.SigninDTO) {
    const user = await this.usersRepository.findOneBy({
      email: params.email,
    });

    if (!user) {
      return new Common.Utils.Error('Неверный логин или код', 400);
    }

    const passwordIsValid = await bcrypt.compare(
      params.password,
      user.password,
    );

    if (!passwordIsValid) {
      return new Common.Utils.Error('Неверный логин или код', 400);
    }

    delete user.password;

    return { jwt: await this.generateJWT(user.id), user };
  }

  async signup(dto: DTO.SignupDTO) {
    try {
      const candidate = await this.usersRepository.findOneBy({
        email: dto.email,
      });

      if (candidate) {
        throw new Common.Utils.Error(
          `User with email ${dto.email} already exist`,
          409,
        );
      }

      const hashedPassword = await this.hashPassword(dto.password);

      const userToBeCreated = this.usersRepository.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });

      const user = await this.usersRepository.save(userToBeCreated);

      const jwt = await this.generateJWT(userToBeCreated.id);

      delete user.password;

      return {
        user,
        jwt,
      };
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async comparePasswords(hash: string, password: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);

    return bcrypt.compare(hash, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);

    return bcrypt.hash(password, salt);
  }

  generateJWT(uId: number) {
    return this.jwtService.signAsync({ uId });
  }
}
