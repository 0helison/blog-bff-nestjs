import { Test, TestingModule } from '@nestjs/testing';
import { PostCircuitBreakerService } from './post-circuit-breaker.service';
import { PostService } from './post.service';
import { RedisService } from 'src/utils/redis/redis.service';
import { PostsType } from 'src/utils/types/posts-type';

describe('PostCircuitBreakerService Unit Tests', () => {
  let postCircuitBreakerService: PostCircuitBreakerService;
  let postService: PostService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostCircuitBreakerService,
        {
          provide: PostService,
          useValue: {
            getPost: jest.fn(),
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

    postCircuitBreakerService = module.get<PostCircuitBreakerService>(
      PostCircuitBreakerService,
    );
    postService = module.get<PostService>(PostService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should return post from PostService when cache does not exist', async () => {
    const postId = 1;
    const mockPost: PostsType = {
      id: postId,
      title: 'Some title',
      authorId: 2,
      text: 'Some Text',
      author: '',
    };

    const circuitBreakerOptions = (postCircuitBreakerService as any)
      .postCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockImplementation(
      async (_key1, _key2, _ttl1, _ttl2, fetchFunction) => fetchFunction(),
    );
    (postService.getPost as jest.Mock).mockResolvedValue(mockPost);

    const result =
      await postCircuitBreakerService.getPostWithCircuitBreaker(postId);

    expect(postService.getPost).toHaveBeenCalledWith(postId);
    expect(result).toBe(mockPost);

    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 90,
      resetTimeout: 10000,
    });
  });

  it('should return post from redis cache when cache exist', async () => {
    const postId = 2;
    const mockPostCache: PostsType = {
      id: postId,
      title: 'Other title',
      authorId: 2,
      text: 'Other Text',
      author: '',
    };

    const circuitBreakerOptions = (postCircuitBreakerService as any)
      .postCircuitBreaker;

    (redisService.getOrSetCache as jest.Mock).mockResolvedValue(mockPostCache);

    const result =
      await postCircuitBreakerService.getPostWithCircuitBreaker(postId);

    expect(redisService.getOrSetCache).toHaveBeenCalledWith(
      `post:${postId}`,
      `post-stale:${postId}`,
      60,
      6000,
      expect.any(Function),
    );
    expect(postService.getPost).not.toHaveBeenCalled();
    expect(result).toBe(mockPostCache);
    expect(circuitBreakerOptions.options).toMatchObject({
      timeout: 2500,
      errorThresholdPercentage: 90,
      resetTimeout: 10000,
    });
  });

  it('should return post stale cache when getOrSetCache fails', async () => {
    const postId = 3;
    const mockPostStaleCache: PostsType = {
      id: postId,
      title: 'Other title 2',
      authorId: 2,
      text: 'Other Text 2',
      author: '',
    };

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(
      JSON.stringify(mockPostStaleCache),
    );

    const result =
      await postCircuitBreakerService.getPostWithCircuitBreaker(postId);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `post-stale:${postId}`,
    );
    expect(JSON.stringify(result)).toBe(JSON.stringify(mockPostStaleCache));
  });

  it('should return custom json when getOrSetCache fails and there is no stale cache', async () => {
    const postId = 4;

    (redisService.getOrSetCache as jest.Mock).mockRejectedValue(undefined);

    (redisService.getClient().get as jest.Mock).mockResolvedValue(undefined);

    const result =
      await postCircuitBreakerService.getPostWithCircuitBreaker(postId);

    expect(redisService.getClient().get).toHaveBeenCalledWith(
      `post-stale:${postId}`,
    );
    expect(result).toEqual({
      id: 0,
      title: 'Post Unavailable',
      authorId: 0,
      text: 'The post is currently unavailable. Please try again later.',
      author: 'User 0',
    });
  });
});
