import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'config';
import R, { Redis } from 'ioredis';

@Injectable()
export class IORedisService implements OnModuleInit {
  private logger = new Logger(IORedisService.name);
  client: Redis;

  constructor(private readonly config: ConfigService<Config.App>) {}

  async onModuleInit() {
    this.logger.log('Redis Connected');
    this.client = new R(this.config.get<Config.RedisConfig>('redis'));
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

  async getCache(key: string) {
    const data = await this.client.get(key);

    return JSON.parse(data);
  }

  async setCache(key: string, data: object) {
    await this.client.set(key, JSON.stringify(data), 'EX', 300);
  }

  async delCache(key: string) {
    await this.client.del(key);
  }

  async clearCache(key: string) {
    const keys = await this.client.keys(key);

    if (keys.length) {
      await this.client.del(keys);
    }
  }
}
