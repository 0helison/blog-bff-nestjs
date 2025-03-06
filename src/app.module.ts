import { Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [UtilsModule, CoreModule],
})
export class AppModule {}
