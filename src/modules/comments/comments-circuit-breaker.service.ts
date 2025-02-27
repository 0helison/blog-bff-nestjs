import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { CommentsService } from './comments.service';

@Injectable()
export class CommentsCircuitBreakerService {
  private circuitBreaker: CircuitBreaker;

  constructor(private commentsService: CommentsService) {
    this.circuitBreaker = new CircuitBreaker(
      (postId: number, limit: number) =>
        this.commentsService.getComments(postId, limit),
      {
        timeout: 3000,
        errorThresholdPercentage: 50,
      },
    );

    this.circuitBreaker.fallback(() => {
      return [];
    });
  }

  async getCommentsWithCircuitBreaker(postId, limit = 5) {
    return this.circuitBreaker.fire(postId, limit);
  }
}
