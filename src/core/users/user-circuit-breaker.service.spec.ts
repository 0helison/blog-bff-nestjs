import { Test, TestingModule } from '@nestjs/testing';
import { UsersCircuitBreakerService } from './users-circuit-breaker.service';
import { UsersService } from './users.service';
import { RedisService } from 'src/utils/redis/redis.service';
import { UsersType } from 'src/utils/types/users-type';

describe('UsersCircuitBreakerService Unit Tests', () => {
  let usersCircuitBreakerService: UsersCircuitBreakerService;
  let usersService: UsersService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersCircuitBreakerService,
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getOrSetCache: jest.fn(),
            getClient: jest.fn().mockReturnValue({
              get: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    usersCircuitBreakerService = module.get<UsersCircuitBreakerService>(
      UsersCircuitBreakerService,
    );
    usersService = module.get<UsersService>(UsersService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should return user from UsersService when cache does not exist', async () => {
    const userId = 1;
    const mockUser: UsersType = { id: userId, name: 'John' };

    const circuitBreakerOptions = (usersCircuitBreakerService as any)
      .userscircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockImplementation(
      async (_key1, _key2, _ttl1, _ttl2, fetchFunction) => fetchFunction(),
    );
    (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);

    const result =
      await usersCircuitBreakerService.getUsersWithCircuitBreaker(userId);

    expect(usersService.getUser).toHaveBeenCalledWith(userId);
    expect(result).toBe(mockUser);

    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
    });
  });

  it('should return user from redis cache when cache exist', async () => {
    const userId = 2;
    const mockUserCache: UsersType = { id: userId, name: 'Otto' };

    const circuitBreakerOptions = (usersCircuitBreakerService as any)
      .userscircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockResolvedValue(mockUserCache);

    const result =
      await usersCircuitBreakerService.getUsersWithCircuitBreaker(userId);

    expect(redisService.getOrSetCache).toHaveBeenCalledWith(
      `user:${userId}`,
      `user-stale:${userId}`,
      60,
      6000,
      expect.any(Function),
    );
    expect(usersService.getUser).not.toHaveBeenCalled();
    expect(result).toBe(mockUserCache);
    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
    });
  });

  it('should return post stale cache when getOrSetCache fails', async () => {
    const userId = 3;
    const mockUserStaleCache: UsersType = { id: userId, name: 'Jack' };

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUserStaleCache),
    );

    const result =
      await usersCircuitBreakerService.getUsersWithCircuitBreaker(userId);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `user-stale:${userId}`,
    );
    expect(JSON.stringify(result)).toBe(JSON.stringify(mockUserStaleCache));
  });

  it('should return empty array when getOrSetCache fails and no stale cache exists', async () => {
    const userId = 3;

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(undefined);

    const result =
      await usersCircuitBreakerService.getUsersWithCircuitBreaker(userId);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `user-stale:${userId}`,
    );
    expect(result).toEqual([]);
  });
});
