import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: RedisClient;

  constructor() {
    this.redisClient = new Redis({
      host: 'redis',
      port: 6379,
    });
  }

  getClient(): RedisClient {
    return this.redisClient;
  }

  async getOrSetCache<T>(
    key: string,
    staleKey: string,
    ttl: number,
    staleTtl: number,
    fetchFunction: () => Promise<T>,
  ): Promise<T> {
    const cachedData = await this.redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const data = await fetchFunction();

    await this.redisClient
      .pipeline()
      .set(key, JSON.stringify(data), 'EX', ttl)
      .set(staleKey, JSON.stringify(data), 'EX', staleTtl)
      .exec();

    return data;
  }
}
