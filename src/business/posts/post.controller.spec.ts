import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IORedisService } from 'libs/ioredis';
import { UserRequest } from 'src/common/decorators/user-request';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let postsController: PostsController;
  let postRepository: jest.Mocked<Repository<Post>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: IORedisService,
          useValue: {
            getCache: jest.fn(),
            setCache: jest.fn(),
            clearCache: jest.fn(),
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

    postsController = moduleRef.get(PostsController);
    postRepository = moduleRef.get(getRepositoryToken(Post));
  });

  describe('create', () => {
    it('should return a created post', async () => {
      const mockPost = {
        id: 1,
        title: 'Test',
        description: 'Test',
        user: { id: 1 },
      } as Post;

      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);

      const result = await postsController.create(
        Object.assign(mockPost, { id: undefined, user: undefined }),
        {
          uId: 1,
        } as UserRequest,
      );

      expect(result).toEqual(mockPost);
    });
  });

  describe('getById', () => {
    it('should return a post', async () => {
      const mockPost = {
        id: 1,
        title: 'Test',
        description: 'Test',
        user: { id: 1 },
      } as Post;

      postRepository.findOneBy.mockResolvedValue(mockPost);

      const result = await postsController.getById(1);

      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should return an updated post', async () => {
      const mockPost = {
        id: 1,
        title: 'Test',
        description: 'Test',
        user: { id: 1 },
      } as Post;

      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.findOneBy.mockResolvedValue(
        Object.assign(mockPost, { title: 'Test 1' }),
      );

      const result = await postsController.update(1, { title: 'Test 1' }, {
        uId: 1,
      } as UserRequest);

      expect(result).toEqual(mockPost);
    });
  });

  describe('delete', () => {
    it('should return a success status', async () => {
      const mockPost = {
        id: 1,
        title: 'Test',
        description: 'Test',
        user: { id: 1 },
      } as Post;

      postRepository.findOne.mockResolvedValue(mockPost);

      const result = await postsController.delete(1, {
        uId: 1,
      } as UserRequest);

      expect(result).toEqual({ message: `Статья удалена`, code: 200 });
    });
  });
});
