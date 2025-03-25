import { Injectable } from '@nestjs/common';
import { CommentsType } from 'src/utils/types/comments-type';
import { UsersCircuitBreakerService } from 'src/core/users/users-circuit-breaker.service';
import { CommentsCircuitBreakerService } from 'src/core/comments/comments-circuit-breaker.service';
import { PostsType } from '../../utils/types/posts-type';
import { PostCircuitBreakerService } from '../posts/services/post-circuit-breaker.service';
import { UsersType } from 'src/utils/types/users-type';
import { PostResponseDto } from 'src/core/fetch-blog/dto/post-response.dto';

@Injectable()
export class FetchBlogPost {
  constructor(
    private readonly postCircuitBreakerService: PostCircuitBreakerService,
    private readonly commentsCircuitBreakersService: CommentsCircuitBreakerService,
    private readonly usersCircuitBreakerService: UsersCircuitBreakerService,
  ) {}

  async fetchPost(id: number): Promise<PostResponseDto> {
    const [post, comments]: [PostsType, CommentsType[]] = await Promise.all([
      this.postCircuitBreakerService.getPostWithCircuitBreaker(id),
      this.commentsCircuitBreakersService.getCommentsWithCircuitBreaker(id),
    ]);

    const author: UsersType | [] =
      await this.usersCircuitBreakerService.getUsersWithCircuitBreaker(
        post.authorId,
      );

    const usersByCommentsPromise: Promise<CommentsType>[] = comments.map(
      async (comment) => {
        const commentAuthor: UsersType | [] =
          await this.usersCircuitBreakerService.getUsersWithCircuitBreaker(
            comment.userId,
          );

        return {
          ...comment,
          user: Array.isArray(commentAuthor) ? '' : commentAuthor.name,
          userId: undefined,
        };
      },
    );

    const commentsData: CommentsType[] = await Promise.all(
      usersByCommentsPromise,
    );

    return {
      id: post.id,
      title: post.title,
      text: post.text,
      author: Array.isArray(author) ? '' : author.name,
      comments: commentsData.map((comment) => ({
        id: comment.id,
        text: comment.text,
        user: comment.user,
      })),
    };
  }
}
