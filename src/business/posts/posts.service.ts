import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
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
  ) {}

  async create(dto: DTO.CreateDTO, userRequest: UserRequest) {
    const post = this.postsRepository.create({
      title: dto.title,
      description: dto.description,
      user: { id: userRequest.uId },
    });

    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async getAll(dto: DTO.WhereDTO, pagination: Common.Classes.Pagination) {
    const cacheKey = this.getPostsListCacheKey(dto, pagination);

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

      return { data: posts, count };
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  async getById(id: number) {
    try {
      const candidate = await this.postsRepository.findBy({
        id,
      });

      if (!candidate) {
        throw new Common.Utils.Error(`Статья с id ${id} не найдена`, 404);
      }

      return candidate;
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

      const updatedPost = await this.postsRepository.update(
        { id: candidate.id },
        data,
      );

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

      await this.postsRepository.delete({
        id: candidate.id,
      });

      return { message: `Статья удалена`, code: 200 };
    } catch (error) {
      throw new Common.Utils.Error(error.message, error.code || 500);
    }
  }

  private getPostsListCacheKey(
    filters: Record<string, any>,
    pagination: Common.Classes.Pagination,
  ): string {
    const filterString = Object.entries(filters)
      .map(([key, value]) => `${key}:${value}`)
      .sort()
      .join('|');

    return `posts:list:${filterString}:skip:${pagination.skip}:take:${pagination.take}`;
  }
}
