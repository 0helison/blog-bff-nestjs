import { Test, TestingModule } from '@nestjs/testing';
import { PostsCircuitBreakerService } from './posts-circuit-breaker.service';
import { PostsService } from './posts.service';
import { RedisService } from 'src/utils/redis/redis.service';
import { PostsType } from 'src/utils/types/posts-type';

describe('PostsCircuitBreakerService Unit Tests', () => {
  let postsCircuitBreakerService: PostsCircuitBreakerService;
  let postsService: PostsService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsCircuitBreakerService,
        {
          provide: PostsService,
          useValue: {
            getPosts: jest.fn(),
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

    postsCircuitBreakerService = module.get<PostsCircuitBreakerService>(
      PostsCircuitBreakerService,
    );
    postsService = module.get<PostsService>(PostsService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should return posts from PostsService when cache does not exist', async () => {
    const limit = 2;
    const mockPosts: PostsType[] = [
      { id: 1, title: 'Post 1', authorId: 10, text: 'Text 1', author: '' },
      { id: 2, title: 'Post 2', authorId: 11, text: 'Text 2', author: '' },
      { id: 3, title: 'Post 3', authorId: 12, text: 'Text 3', author: '' },
    ];

    const circuitBreakerOptions = (postsCircuitBreakerService as any)
      .postsCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockImplementation(
      async (_key1, _key2, _ttl1, _ttl2, fetchFunction) => fetchFunction(),
    );
    (postsService.getPosts as jest.Mock).mockResolvedValue(mockPosts);

    const result =
      await postsCircuitBreakerService.getPostsWithCircuitBreaker(limit);

    expect(postsService.getPosts).toHaveBeenCalledWith(limit);
    expect(result).toBe(mockPosts);

    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 90,
      resetTimeout: 10000,
    });
  });

  it('should return posts from redis cache when cache exist', async () => {
    const limit = 2;
    const mockPostsCache: PostsType[] = [
      { id: 1, title: 'Post 1', authorId: 10, text: 'Text 1', author: '' },
      { id: 2, title: 'Post 2', authorId: 11, text: 'Text 2', author: '' },
      { id: 3, title: 'Post 3', authorId: 12, text: 'Text 3', author: '' },
    ];

    const circuitBreakerOptions = (postsCircuitBreakerService as any)
      .postsCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockResolvedValue(mockPostsCache);

    const result =
      await postsCircuitBreakerService.getPostsWithCircuitBreaker(limit);

    expect(redisService.getOrSetCache).toHaveBeenCalledWith(
      `posts:${limit}`,
      `posts-stale:${limit}`,
      60,
      6000,
      expect.any(Function),
    );
    expect(postsService.getPosts).not.toHaveBeenCalled();
    expect(result).toBe(mockPostsCache);
    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 90,
      resetTimeout: 10000,
    });
  });

  it('should return posts stale cache when getOrSetCache fails', async () => {
    const limit = 2;
    const mockPostsStaleCache: PostsType[] = [
      { id: 1, title: 'Post 1', authorId: 10, text: 'Text 1', author: '' },
      { id: 2, title: 'Post 2', authorId: 11, text: 'Text 2', author: '' },
      { id: 3, title: 'Post 3', authorId: 12, text: 'Text 3', author: '' },
    ];

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(
      JSON.stringify(mockPostsStaleCache),
    );

    const result =
      await postsCircuitBreakerService.getPostsWithCircuitBreaker(limit);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `posts-stale:${limit}`,
    );
    expect(JSON.stringify(result)).toBe(JSON.stringify(mockPostsStaleCache));
  });

  it('should return custom json when getOrSetCache fails and there is no stale cache', async () => {
    const limit = 2;

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(undefined);

    const result =
      await postsCircuitBreakerService.getPostsWithCircuitBreaker(limit);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `posts-stale:${limit}`,
    );
    expect(result).toEqual([]);
  });
});
