import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { FetchBlogController } from './controllers/fetch-blog.controller';
import { FetchBlogPosts } from './fetch-blog-posts.service';
import { FetchBlogPost } from './fetch-blog-post.service';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UtilsModule, CommentsModule, PostsModule, UsersModule],
  providers: [FetchBlogPosts, FetchBlogPost],
  controllers: [FetchBlogController],
})
export class FetchBlogModule {}
