import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { CommentsCircuitBreakerService } from './comments-circuit-breaker.service';
import { CommentsService } from './comments.service';

@Module({
  imports: [UtilsModule],
  providers: [CommentsCircuitBreakerService, CommentsService],
  exports: [CommentsCircuitBreakerService, CommentsService],
})
export class CommentsModule {}
