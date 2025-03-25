import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { UsersService } from './users.service';
import { UsersType } from 'src/utils/types/users-type';
import { RedisService } from 'src/utils/redis/redis.service';

@Injectable()
export class UsersCircuitBreakerService {
  private userscircuitBreaker: CircuitBreaker;

  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {
    this.userscircuitBreaker = new CircuitBreaker(
      async (id: number) => {
        return this.redisService.getOrSetCache(
          `user:${id}`,
          `user-stale:${id}`,
          60,
          6000,
          () => this.usersService.getUser(id),
        );
      },
      {
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      },
    );

    this.userscircuitBreaker.fallback(async (id: number) => {
      const cachedData = await this.redisService
        .getClient()
        .get(`user-stale:${id}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      return [];
    });
  }

  async getUsersWithCircuitBreaker(id: number): Promise<UsersType | []> {
    /*const { rejects, failures, fallbacks, successes } =
      this.userscircuitBreaker.stats;

    console.log({ rejects, failures, fallbacks, successes });*/

    return this.userscircuitBreaker.fire(id);
  }
}
