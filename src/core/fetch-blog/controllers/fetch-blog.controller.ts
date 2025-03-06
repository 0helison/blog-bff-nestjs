import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FetchBlogPosts } from '../fetch-blog-posts.service';
import { FetchBlogPost } from '../fetch-blog-post.service';
import { PostResponseDto } from '../dto/post-response.dto';
import { PostsResponseDto } from '../dto/posts-response.dto';

@Controller('posts')
export class FetchBlogController {
  constructor(
    private readonly fetchBlogPosts: FetchBlogPosts,
    private readonly fetchBlogPost: FetchBlogPost,
  ) {}

  @Get()
  findAll(): Promise<PostsResponseDto[]> {
    return this.fetchBlogPosts.fetchPosts();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto> {
    return this.fetchBlogPost.fetchPost(id);
  }
}
