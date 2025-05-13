import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Config } from 'config';
import * as os from 'os';
import { AppModule } from './app.module';
import { Common } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new Common.Interceptors.Error());

  const configService = app.get<ConfigService<Config.App>>(ConfigService);

  app.useGlobalPipes(
    new Common.Pipes.ParseQueryPipe(),
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      enableDebugMessages: true,
    }),
  );

  const port = configService.get<number>('port');

  await app.listen(port, '0.0.0.0', () => {
    new Logger('NestApplication').log(
      `🚀 Core server ready on dev mode at: ${os.hostname()}:${port}`,
    );
  });
}
bootstrap();
