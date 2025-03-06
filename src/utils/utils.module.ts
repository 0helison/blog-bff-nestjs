import { Module } from '@nestjs/common';
import { HttpModule } from 'src/utils/http/http.module';
import { RedisModule } from 'src/utils/redis/redis.module';

@Module({
  imports: [HttpModule, RedisModule],
  exports: [HttpModule, RedisModule],
})
export class UtilsModule {}
