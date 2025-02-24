import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';
import { FetchPostAndCommentsWithAuthors } from './fetch-post-and-comments-with-authors.service';

@Module({
  providers: [
    PostsService,
    CommentsService,
    UsersService,
    FetchPostAndCommentsWithAuthors,
  ],
  controllers: [PostsController],
})
export class PostsModule {}
