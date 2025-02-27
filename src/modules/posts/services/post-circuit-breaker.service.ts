import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { PostService } from './post.service';

@Injectable()
export class PostCircuitBreakerService {
  private postCircuitBreaker: CircuitBreaker;

  constructor(private readonly postService: PostService) {
    this.postCircuitBreaker = new CircuitBreaker(
      (id: number) => this.postService.getPost(id),
      {
        timeout: 5000,
        errorThresholdPercentage: 90,
      },
    );

    this.postCircuitBreaker.fallback(() => ({}));
  }

  async getPostWithCircuitBreaker(id: number) {
    return this.postCircuitBreaker.fire(id);
  }
}
