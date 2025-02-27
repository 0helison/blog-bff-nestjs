import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { UtilsModule } from 'src/utils/utils.module';
import { PostsCircuitBreakerService } from './services/posts-circuit-breaker.service';
import { PostCircuitBreakerService } from './services/post-circuit-breaker.service';
import { PostService } from './services/post.service';

@Module({
  imports: [UtilsModule],
  providers: [
    PostsService,
    PostsCircuitBreakerService,
    PostService,
    PostCircuitBreakerService,
  ],
})
export class PostsModule {}
