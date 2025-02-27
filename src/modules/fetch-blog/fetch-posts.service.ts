import { Injectable } from '@nestjs/common';
import { UsersResponseType } from 'src/utils/types/users-renponse-type';
import { UsersCircuitBreakerService } from 'src/modules/users/users-circuit-breaker.service';
import { PostsResponse } from '../../utils/types/posts-response';
import { PostsType } from '../../utils/types/posts-type';
import { PostsCircuitBreakerService } from '../posts/services/posts-circuit-breaker.service';

@Injectable()
export class FetchPosts {
  constructor(
    private readonly postsCircuitBreakerService: PostsCircuitBreakerService,
    private readonly usersCircuitBreakerService: UsersCircuitBreakerService,
  ) {}

  async fetchPosts(): Promise<PostsResponse[]> {
    const posts: PostsType[] =
      await this.postsCircuitBreakerService.getPostsWithCircuitBreaker();

    const uniqueAuthorsIds: number[] = [
      ...new Set(posts.map((post) => post.authorId)),
    ];

    const authors: UsersResponseType =
      await this.usersCircuitBreakerService.getUsersWithCircuitBreaker(
        uniqueAuthorsIds,
      );

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: authors[post.authorId],
    }));
  }
}
