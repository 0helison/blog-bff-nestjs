import { Module } from '@nestjs/common';
import { PostService } from '../posts/services/post.service';
import { PostCircuitBreakerService } from '../posts/services/post-circuit-breaker.service';
import { PostsService } from '../posts/services/posts.service';
import { PostsCircuitBreakerService } from '../posts/services/posts-circuit-breaker.service';
import { CommentsService } from '../comments/comments.service';
import { CommentsCircuitBreakerService } from '../comments/comments-circuit-breaker.service';
import { UsersService } from '../users/users.service';
import { UsersCircuitBreakerService } from '../users/users-circuit-breaker.service';
import { UtilsModule } from 'src/utils/utils.module';
import { FetchBlogController } from './controllers/fetch-blog.controller';
import { FetchPosts } from './fetch-posts.service';
import { FetchPost } from './fetch-post.service';

@Module({
  imports: [UtilsModule],
  providers: [
    PostService,
    PostCircuitBreakerService,
    PostsService,
    PostsCircuitBreakerService,
    CommentsService,
    CommentsCircuitBreakerService,
    UsersService,
    UsersCircuitBreakerService,
    FetchPosts,
    FetchPost,
  ],
  controllers: [FetchBlogController],
})
export class FetchModule {}
