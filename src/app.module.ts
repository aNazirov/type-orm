import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from 'config';
import { Auth } from './business/auth';
import { User } from './business/auth/user.entity';
import { Posts } from './business/posts';
import { Post } from './business/posts/post.entity';
import { Common } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Config.appConfiguration],
    }),
    JwtModule.register({
      global: true,
      secret: Config.appConfiguration().jwtSecret,
      signOptions: { expiresIn: '1D' },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config.App>) => {
        const dbConfig = configService.get<Config.DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [User, Post],
          synchronize: true,
        };
      },
    }),
    Auth.Module,
    Posts.Module,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: Common.Interceptors.Context,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: Common.Interceptors.Logger,
    },
  ],
})
export class AppModule {}
