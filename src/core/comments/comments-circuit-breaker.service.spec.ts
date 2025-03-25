import { Test, TestingModule } from '@nestjs/testing';
import { CommentsCircuitBreakerService } from 'src/core/comments/comments-circuit-breaker.service';
import { CommentsService } from 'src/core/comments/comments.service';
import { RedisService } from 'src/utils/redis/redis.service';
import { CommentsType } from 'src/utils/types/comments-type';

describe('CommentsCircuitBreakerService Unit Tests', () => {
  let commentsCircuitBreakerService: CommentsCircuitBreakerService;
  let commentsService: CommentsService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsCircuitBreakerService,
        {
          provide: CommentsService,
          useValue: {
            getComments: jest.fn(),
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

    commentsCircuitBreakerService = module.get<CommentsCircuitBreakerService>(
      CommentsCircuitBreakerService,
    );
    commentsService = module.get<CommentsService>(CommentsService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should return comments from CommentsService when cache does not exist', async () => {
    const postId = 1;
    const limit = 2;
    const mockComments: CommentsType[] = [
      { id: 1, text: 'Text 1', userId: 2, postId: 1, user: '' },
      { id: 2, text: 'Text 2', userId: 4, postId: 1, user: '' },
      { id: 3, text: 'Text 3', userId: 8, postId: 1, user: '' },
    ];

    const circuitBreakerOptions = (commentsCircuitBreakerService as any)
      .commentsCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockImplementation(
      async (_key1, _key2, _ttl1, _ttl2, fetchFunction) => fetchFunction(),
    );
    (commentsService.getComments as jest.Mock).mockResolvedValue(mockComments);

    const result =
      await commentsCircuitBreakerService.getCommentsWithCircuitBreaker(
        postId,
        limit,
      );

    expect(commentsService.getComments).toHaveBeenCalledWith(postId, limit);
    expect(result).toBe(mockComments);

    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 10,
      resetTimeout: 10000,
    });
  });

  it('should return comments from redis cache when cache exist', async () => {
    const postId = 1;
    const limit = 2;
    const mockCommentsCache: CommentsType[] = [
      { id: 1, text: 'Text 1', userId: 2, postId: 1, user: '' },
      { id: 2, text: 'Text 2', userId: 4, postId: 1, user: '' },
      { id: 3, text: 'Text 3', userId: 8, postId: 1, user: '' },
    ];

    const circuitBreakerOptions = (commentsCircuitBreakerService as any)
      .commentsCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockResolvedValue(
      mockCommentsCache,
    );

    const result =
      await commentsCircuitBreakerService.getCommentsWithCircuitBreaker(
        postId,
        limit,
      );

    expect(redisService.getOrSetCache).toHaveBeenCalledWith(
      `comments:${postId}:${limit}`,
      `comments-stale:${postId}:${limit}`,
      60,
      6000,
      expect.any(Function),
    );
    expect(commentsService.getComments).not.toHaveBeenCalled();
    expect(result).toBe(mockCommentsCache);
    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 10,
      resetTimeout: 10000,
    });
  });

  it('should return comments stale cache when getOrSetCache fails', async () => {
    const postId = 1;
    const limit = 2;
    const mockCommentsStaleCache: CommentsType[] = [
      { id: 1, text: 'Text 1', userId: 2, postId: 1, user: '' },
      { id: 2, text: 'Text 2', userId: 4, postId: 1, user: '' },
      { id: 3, text: 'Text 3', userId: 8, postId: 1, user: '' },
    ];

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(
      JSON.stringify(mockCommentsStaleCache),
    );

    const result =
      await commentsCircuitBreakerService.getCommentsWithCircuitBreaker(
        postId,
        limit,
      );

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `comments-stale:${postId}:${limit}`,
    );
    expect(JSON.stringify(result)).toBe(JSON.stringify(mockCommentsStaleCache));
  });

  it('should return custom json when getOrSetCache fails and there is no stale cache', async () => {
    const postId = 1;
    const limit = 2;

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(undefined);

    const result =
      await commentsCircuitBreakerService.getCommentsWithCircuitBreaker(
        postId,
        limit,
      );

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `comments-stale:${postId}:${limit}`,
    );
    expect(result).toEqual([]);
  });
});
