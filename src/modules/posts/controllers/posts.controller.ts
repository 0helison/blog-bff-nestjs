import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FetchPostsAndCommentsWithAuthors } from '../services/fetch-posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly fetchPostsAndCommentsWithAuthors: FetchPostsAndCommentsWithAuthors,
  ) {}

  @Get()
  findAll(): Promise<any> {
    return this.fetchPostsAndCommentsWithAuthors.fetchPosts();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.fetchPostsAndCommentsWithAuthors.fetchPost(id);
  }
}
