import { config } from 'dotenv';
config();

import { Module } from '@nestjs/common';
import { Http } from './http.service';

@Module({
  providers: [
    {
      provide: 'HttpPosts',
      useValue: new Http(process.env.HTTP_POSTS_URL),
    },
    {
      provide: 'HttpComments',
      useValue: new Http(process.env.HTTP_COMMENTS_URL),
    },
    {
      provide: 'HttpUsers',
      useValue: new Http(process.env.HTTP_USERS_URL),
    },
  ],
  exports: ['HttpPosts', 'HttpComments', 'HttpUsers'],
})
export class HttpModule {}
