import { Module } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';

@Module({
  providers: [
    { provide: 'HttpPosts', useValue: new Http('http://localhost:3001') },
    { provide: 'HttpComments', useValue: new Http('http://localhost:3002') },
    { provide: 'HttpUsers', useValue: new Http('http://localhost:3003') },
  ],
  exports: ['HttpComments', 'HttpPosts', 'HttpUsers'],
})
export class UtilsModule {}
