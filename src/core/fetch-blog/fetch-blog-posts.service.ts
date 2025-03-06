import { Injectable } from '@nestjs/common';
import { UsersCircuitBreakerService } from 'src/core/users/users-circuit-breaker.service';
import { PostsType } from '../../utils/types/posts-type';
import { PostsCircuitBreakerService } from '../posts/services/posts-circuit-breaker.service';
import { UsersType } from 'src/utils/types/users-type';
import { PostsResponseDto } from 'src/core/fetch-blog/dto/posts-response.dto';

@Injectable()
export class FetchBlogPosts {
  constructor(
    private readonly postsCircuitBreakerService: PostsCircuitBreakerService,
    private readonly usersCircuitBreakerService: UsersCircuitBreakerService,
  ) {}

  async fetchPosts(): Promise<PostsResponseDto[]> {
    const posts: PostsType[] =
      await this.postsCircuitBreakerService.getPostsWithCircuitBreaker();

    const usersByPostsPromise: Promise<PostsType>[] = posts.map(
      async (post) => {
        const postAuthor: UsersType =
          await this.usersCircuitBreakerService.getUsersWithCircuitBreaker(
            post.authorId,
          );

        return {
          ...post,
          authorId: undefined,
          author: postAuthor.name,
        };
      },
    );

    const postsData: PostsType[] = await Promise.all(usersByPostsPromise);

    return postsData.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.author,
    }));
  }
}
