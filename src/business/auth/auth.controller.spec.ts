import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRequest } from 'src/common/decorators/user-request';
import { Repository } from 'typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthController', () => {
  let jwtService: JwtService;
  let authController: AuthController;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtService = moduleRef.get(JwtService);
    authController = moduleRef.get(AuthController);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe('signinWithToken', () => {
    it('should return a user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
      } as User;

      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await authController.signinWithToken({
        uId: 1,
      } as UserRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('signin', () => {
    it('should return a user with jwt', async () => {
      const mockUser = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password:
          '$2a$10$dI1hDTpVBhf08pKxzSFHKud.o7Uxu4poj8C/IVZpzwuiwb96BZMTq',
      } as User;

      userRepository.findOneBy.mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock).mockReturnValue('mocked-token');

      const result = await authController.signin({
        email: 'test@example.com',
        password: 'awdawd',
      });

      const expectedResult = {
        user: { id: 1, name: 'Test', email: 'test@example.com' },
        jwt: 'mocked-token',
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('signup', () => {
    it('should return a user with jwt', async () => {
      const mockUser = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password:
          '$2a$10$dI1hDTpVBhf08pKxzSFHKud.o7Uxu4poj8C/IVZpzwuiwb96BZMTq',
      } as User;

      userRepository.save.mockResolvedValue(mockUser);
      userRepository.create.mockReturnValue(mockUser);
      (jwtService.signAsync as jest.Mock).mockReturnValue('mocked-token');

      const result = await authController.signup(
        Object.assign(mockUser, { id: undefined, password: 'awdawd' }),
      );

      const expectedResult = {
        user: Object.assign(mockUser, { password: undefined }),
        jwt: 'mocked-token',
      };

      expect(result).toEqual(expectedResult);
    });
  });
});
