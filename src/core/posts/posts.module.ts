import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { PostCircuitBreakerService } from './services/post-circuit-breaker.service';
import { PostService } from './services/post.service';
import { PostsCircuitBreakerService } from './services/posts-circuit-breaker.service';
import { PostsService } from './services/posts.service';

@Module({
  imports: [UtilsModule],
  providers: [
    PostCircuitBreakerService,
    PostService,
    PostsCircuitBreakerService,
    PostsService,
  ],
  exports: [
    PostCircuitBreakerService,
    PostService,
    PostsCircuitBreakerService,
    PostsService,
  ],
})
export class PostsModule {}
