import { Module } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { FetchPostsAndCommentsWithAuthors } from './services/fetch-posts.service';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule],
  providers: [
    PostsService,
    CommentsService,
    UsersService,
    FetchPostsAndCommentsWithAuthors,
  ],
  controllers: [PostsController],
})
export class PostsModule {}
