import { Injectable } from '@nestjs/common';
import { UsersResponseType } from 'src/utils/types/users-renponse-type';
import { CommentsType } from 'src/utils/types/comments-type';
import { UsersCircuitBreakerService } from 'src/modules/users/users-circuit-breaker.service';
import { CommentsCircuitBreakerService } from 'src/modules/comments/comments-circuit-breaker.service';
import { PostResponse } from '../../utils/types/post-response';
import { PostsType } from '../../utils/types/posts-type';
import { PostCircuitBreakerService } from '../posts/services/post-circuit-breaker.service';

@Injectable()
export class FetchPost {
  constructor(
    private readonly postCircuitBreakerService: PostCircuitBreakerService,
    private readonly commentsCircuitBreakersService: CommentsCircuitBreakerService,
    private readonly usersCircuitBreakerService: UsersCircuitBreakerService,
  ) {}

  async fetchPost(id: number): Promise<PostResponse> {
    const [post, comments]: [PostsType, CommentsType[]] = await Promise.all([
      this.postCircuitBreakerService.getPostWithCircuitBreaker(id),
      this.commentsCircuitBreakersService.getCommentsWithCircuitBreaker(id),
    ]);

    const uniqueUsersIds: number[] = [
      ...new Set([post.authorId, ...comments.map((c) => c.userId)]),
    ];

    const users: UsersResponseType =
      await this.usersCircuitBreakerService.getUsersWithCircuitBreaker(
        uniqueUsersIds,
      );

    return {
      id: post.id,
      title: post.title,
      text: post.text,
      author: users[post.authorId],
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        user: users[comment.userId],
      })),
    };
  }
}
