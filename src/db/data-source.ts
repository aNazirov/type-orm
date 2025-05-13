import 'dotenv/config';

import { appConfiguration } from 'config/config';
import { User } from 'src/business/auth/user.entity';
import { Post } from 'src/business/posts/post.entity';
import { DataSource } from 'typeorm';

const dbConfig = appConfiguration().database;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  entities: [User, Post],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false, // всегда false в проде
});
