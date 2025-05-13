import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { IORedisService } from 'libs/ioredis';
import { Common } from 'src/common';
import { UserRequest } from 'src/common/decorators/user-request';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { DTO } from './dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly ioredis: IORedisService,
  ) {}

  async create(dto: DTO.CreateDTO, userRequest: UserRequest) {
    const post = this.postsRepository.create({
      title: dto.title,
      description: dto.description,
      user: { id: userRequest.uId },
    });

    try {
      const createdPost = await this.postsRepository.save(post);
      await this.refreshCache(createdPost);

      return createdPost;
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async getAll(dto: DTO.WhereDTO, pagination: Common.Classes.Pagination) {
    const cacheKey = this.getPostsListCacheKey(dto, pagination);

    const cached = await this.ioredis.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const where: FindOptionsWhere<Post> = {};

    if (dto.userId) {
      where.user = { id: dto.userId };
    }

    if (dto.createdAt) {
      const date = dayjs(dto.createdAt);

      where.createdAt = Between(
        date.startOf('day').toDate(),
        date.endOf('day').toDate(),
      );
    }

    try {
      const [posts, count] = await this.postsRepository.findAndCount({
        where,
        skip: pagination.skip,
        take: pagination.take,
      });

      const res = { data: posts, count };

      await this.ioredis.setCache(cacheKey, res);

      return res;
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async getById(id: number) {
    const cacheKey = this.getPostCacheKey(id);

    const cached = await this.ioredis.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const post = await this.postsRepository.findOneBy({
        id,
      });

      if (!post) {
        throw new Common.Utils.Error(`Статья с id ${id} не найдена`, 404);
      }

      await this.ioredis.setCache(cacheKey, post);

      return post;
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async update(id: number, dto: DTO.UpdateDTO, userRequest: UserRequest) {
    try {
      const candidate = await this.postsRepository.findOne({
        where: { id, user: { id: userRequest.uId } },
      });

      if (!candidate) {
        throw new Common.Utils.Error(`Статья с id ${id} не найдена`, 404);
      }

      const data: Partial<Post> = {};

      if (dto.title && candidate.title !== dto.title) {
        data.title = dto.title;
      }

      if (dto.description && candidate.description !== dto.description) {
        data.description = dto.description;
      }

      await this.postsRepository.update({ id: candidate.id }, data);
      const updatedPost = await this.postsRepository.findOneBy({ id });
      await this.refreshCache(updatedPost);

      return updatedPost;
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async delete(id: number, userRequest: UserRequest) {
    try {
      const candidate = await this.postsRepository.findOne({
        where: { id, user: { id: userRequest.uId } },
      });

      if (!candidate) {
        throw new Common.Utils.Error(`Статья с id ${id} не найдена`, 404);
      }

      await Promise.all([
        this.postsRepository.delete({
          id: candidate.id,
        }),
        this.refreshCache(candidate),
      ]);

      return { message: `Статья удалена`, code: 200 };
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  private getPostCacheKey(id: number): string {
    return `post:${id}`;
  }

  private getPostsListCacheKey(
    filters: Record<string, any>,
    pagination: { skip: number; take: number },
  ): string {
    const filterString = Object.entries(filters)
      .map(([key, value]) => `${key}:${value}`)
      .sort()
      .join('|');

    return `posts:list:${filterString}:skip:${pagination.skip}:take:${pagination.take}`;
  }

  private async refreshCache(post: Post) {
    const cacheKey = this.getPostCacheKey(post.id);

    await Promise.all([
      this.ioredis.setCache(cacheKey, post),
      this.ioredis.clearCache('posts:list:*'),
    ]);
  }
}
