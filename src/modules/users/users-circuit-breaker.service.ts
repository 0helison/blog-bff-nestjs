import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { UsersService } from './users.service';

@Injectable()
export class UsersCircuitBreakerService {
  private circuitBreaker: CircuitBreaker;

  constructor(private readonly usersService: UsersService) {
    this.circuitBreaker = new CircuitBreaker(
      (ids: number[]) => this.usersService.getUsers(ids),
      {
        timeout: 3000,
        errorThresholdPercentage: 50,
      },
    );

    this.circuitBreaker.fallback(() => []);
  }

  async getUsersWithCircuitBreaker(ids: number[]) {
    return this.circuitBreaker.fire(ids);
  }
}
