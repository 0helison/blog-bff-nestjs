import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
