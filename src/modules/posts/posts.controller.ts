import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FetchPostAndCommentsWithAuthors } from './fetch-post-and-comments-with-authors.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly fetchPostAndCommentsWithAuthors: FetchPostAndCommentsWithAuthors,
  ) {}

  @Get()
  findAll(): Promise<any> {
    return this.postService.getPosts();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.fetchPostAndCommentsWithAuthors.getFetchComplete(id);
  }
}
