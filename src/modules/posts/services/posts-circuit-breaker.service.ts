import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { PostsService } from './posts.service';

@Injectable()
export class PostsCircuitBreakerService {
  private postsCircuitBreaker: CircuitBreaker;

  constructor(private readonly postsService: PostsService) {
    this.postsCircuitBreaker = new CircuitBreaker(
      (limit: number) => this.postsService.getPosts(limit),
      {
        timeout: 5000,
        errorThresholdPercentage: 90,
      },
    );

    this.postsCircuitBreaker.fallback(() => []);
  }

  async getPostsWithCircuitBreaker(limit: number = 5) {
    return this.postsCircuitBreaker.fire(limit);
  }
}
