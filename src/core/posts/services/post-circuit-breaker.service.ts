import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { PostService } from './post.service';
import { PostsType } from 'src/utils/types/posts-type';
import { RedisService } from 'src/utils/redis/redis.service';

@Injectable()
export class PostCircuitBreakerService {
  private postCircuitBreaker: CircuitBreaker;

  constructor(
    private readonly postService: PostService,
    private readonly redisService: RedisService,
  ) {
    this.postCircuitBreaker = new CircuitBreaker(
      async (id: number) => {
        return this.redisService.getOrSetCache(
          `post:${id}`,
          `post-stale:${id}`,
          60,
          6000,
          () => this.postService.getPost(id),
        );
      },
      {
        timeout: 2500,
        errorThresholdPercentage: 90,
        resetTimeout: 10000,
      },
    );

    this.postCircuitBreaker.fallback(async (id: number) => {
      const cachedData = await this.redisService
        .getClient()
        .get(`post-stale:${id}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      return {
        id: 0,
        title: 'Post Unavailable',
        authorId: 0,
        text: 'The post is currently unavailable. Please try again later.',
        author: '',
      };
    });
  }

  async getPostWithCircuitBreaker(id: number): Promise<PostsType> {
    /*const { rejects, failures, fallbacks, successes } =
      this.postCircuitBreaker.stats;

    console.log({ rejects, failures, fallbacks, successes });*/

    return this.postCircuitBreaker.fire(id);
  }
}
