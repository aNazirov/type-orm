import { Global, Module } from '@nestjs/common';
import { IORedisService } from './ioredis.service';

@Global()
@Module({
  providers: [IORedisService],
  exports: [IORedisService],
})
export class IORedisModule {}
