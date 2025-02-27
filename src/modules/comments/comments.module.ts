import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UtilsModule } from 'src/utils/utils.module';
import { CommentsCircuitBreakerService } from './comments-circuit-breaker.service';

@Module({
  imports: [UtilsModule],
  providers: [CommentsService, CommentsCircuitBreakerService],
})
export class CommentsModule {}
