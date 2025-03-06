import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { PostsService } from './posts.service';
import { PostsType } from 'src/utils/types/posts-type';
import { RedisService } from 'src/utils/redis/redis.service';

@Injectable()
export class PostsCircuitBreakerService {
  private postsCircuitBreaker: CircuitBreaker;

  constructor(
    private readonly postsService: PostsService,
    private readonly redisService: RedisService,
  ) {
    this.postsCircuitBreaker = new CircuitBreaker(
      async (limit: number) => {
        return this.redisService.getOrSetCache(
          `posts:${limit}`,
          `posts-stale:${limit}`,
          60,
          6000,
          () => this.postsService.getPosts(limit),
        );
      },
      {
        timeout: 2500,
        errorThresholdPercentage: 90,
        resetTimeout: 10000,
      },
    );

    this.postsCircuitBreaker.fallback(async (limit: number) => {
      const cachedData = await this.redisService
        .getClient()
        .get(`posts-stale:${limit}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      return [];
    });
  }

  async getPostsWithCircuitBreaker(limit: number = 5): Promise<PostsType[]> {
    /*const { rejects, failures, fallbacks, successes } =
      this.postsCircuitBreaker.stats;

    console.log({ rejects, failures, fallbacks, successes });*/

    return this.postsCircuitBreaker.fire(limit);
  }
}
