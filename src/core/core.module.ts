import { Module } from '@nestjs/common';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { FetchBlogModule } from './fetch-blog/fetch.module';

@Module({
  imports: [CommentsModule, PostsModule, UsersModule, FetchBlogModule],
  exports: [CommentsModule, PostsModule, UsersModule, FetchBlogModule],
})
export class CoreModule {}
