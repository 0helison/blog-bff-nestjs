import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FetchPosts } from '../fetch-posts.service';
import { FetchPost } from '../fetch-post.service';

@Controller('posts')
export class FetchBlogController {
  constructor(
    private readonly fetchPosts: FetchPosts,
    private readonly fetchPost: FetchPost,
  ) {}

  @Get()
  findAll(): Promise<any> {
    return this.fetchPosts.fetchPosts();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.fetchPost.fetchPost(id);
  }
}
