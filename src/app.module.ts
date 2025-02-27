import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsModule } from './modules/comments/comments.module';
import { PostsModule } from './modules/posts/posts.module';

import { UsersModule } from './modules/users/users.module';
import { UtilsModule } from './utils/utils.module';
import { FetchModule } from './modules/fetch-blog/fetch.module';

@Module({
  imports: [CommentsModule, PostsModule, UsersModule, UtilsModule, FetchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
