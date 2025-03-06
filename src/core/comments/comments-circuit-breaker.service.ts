import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { CommentsService } from './comments.service';
import { CommentsType } from 'src/utils/types/comments-type';
import { RedisService } from 'src/utils/redis/redis.service';

@Injectable()
export class CommentsCircuitBreakerService {
  private commentsCircuitBreaker: CircuitBreaker;

  constructor(
    private commentsService: CommentsService,
    private readonly redisService: RedisService,
  ) {
    this.commentsCircuitBreaker = new CircuitBreaker(
      async (postId: number, limit: number) => {
        return this.redisService.getOrSetCache(
          `comments:${postId}:${limit}`,
          `comments-stale:${postId}:${limit}`,
          60,
          6000,
          () => this.commentsService.getComments(postId, limit),
        );
      },
      {
        timeout: 2500,
        errorThresholdPercentage: 10,
        resetTimeout: 10000,
      },
    );

    this.commentsCircuitBreaker.fallback(
      async (postId: number, limit: number) => {
        const cachedData = await this.redisService
          .getClient()
          .get(`comments-stale:${postId}:${limit}`);

        if (cachedData) {
          return JSON.parse(cachedData);
        }

        return [];
      },
    );
  }

  async getCommentsWithCircuitBreaker(
    postId,
    limit = 5,
  ): Promise<CommentsType[]> {
    /*const { rejects, failures, fallbacks, successes } =
      this.commentsCircuitBreaker.stats;

    console.log({ rejects, failures, fallbacks, successes });*/

    return this.commentsCircuitBreaker.fire(postId, limit);
  }
}
