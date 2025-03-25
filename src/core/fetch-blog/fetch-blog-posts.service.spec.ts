import { Test, TestingModule } from '@nestjs/testing';
import { FetchBlogPosts } from './fetch-blog-posts.service';
import { PostsCircuitBreakerService } from '../posts/services/posts-circuit-breaker.service';
import { UsersCircuitBreakerService } from '../users/users-circuit-breaker.service';
import { PostsType } from '../../utils/types/posts-type';
import { UsersType } from 'src/utils/types/users-type';
import { PostsResponseDto } from 'src/core/fetch-blog/dto/posts-response.dto';

describe('FetchBlogPosts Unit Tests', () => {
  let fetchBlogPosts: FetchBlogPosts;
  let postCircuitBreakerService: jest.Mocked<PostsCircuitBreakerService>;
  let usersCircuitBreakerService: jest.Mocked<UsersCircuitBreakerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchBlogPosts,
        {
          provide: PostsCircuitBreakerService,
          useValue: { getPostsWithCircuitBreaker: jest.fn() },
        },
        {
          provide: UsersCircuitBreakerService,
          useValue: { getUsersWithCircuitBreaker: jest.fn() },
        },
      ],
    }).compile();

    fetchBlogPosts = module.get<FetchBlogPosts>(FetchBlogPosts);
    postCircuitBreakerService = module.get(PostsCircuitBreakerService);
    usersCircuitBreakerService = module.get(UsersCircuitBreakerService);
  });

  it('should return posts with authors', async () => {
    const mockPosts: PostsType[] = [
      {
        id: 1,
        title: 'Sample Post',
        authorId: 1,
        text: 'This is a post content.',
        author: '',
      },
      {
        id: 2,
        title: 'Another Post',
        authorId: 2,
        text: 'Content of the other post.',
        author: '',
      },
    ];

    const mockAuthor1: UsersType = { id: 1, name: 'User One' };
    const mockAuthor2: UsersType = { id: 2, name: 'User Two' };

    postCircuitBreakerService.getPostsWithCircuitBreaker.mockResolvedValue(
      mockPosts,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockImplementation(
      (id) => {
        if (id === 1) return Promise.resolve(mockAuthor1);
        if (id === 2) return Promise.resolve(mockAuthor2);
      },
    );

    const result: PostsResponseDto[] = await fetchBlogPosts.fetchPosts();

    expect(result).toEqual([
      {
        id: 1,
        title: 'Sample Post',
        author: 'User One',
      },
      {
        id: 2,
        title: 'Another Post',
        author: 'User Two',
      },
    ]);

    expect(
      postCircuitBreakerService.getPostsWithCircuitBreaker,
    ).toHaveBeenCalled();
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(1);
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(2);
  });

  it('should return a posts with author empty - users api failing', async () => {
    const mockPosts: PostsType[] = [
      {
        id: 1,
        title: 'Sample Post',
        authorId: 1,
        text: 'This is a post content.',
        author: '',
      },
      {
        id: 2,
        title: 'Another Post',
        authorId: 2,
        text: 'Content of the other post.',
        author: '',
      },
      {
        id: 3,
        title: 'Some Post',
        authorId: 3,
        text: 'Content of the some post.',
        author: '',
      },
    ];

    postCircuitBreakerService.getPostsWithCircuitBreaker.mockResolvedValue(
      mockPosts,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockResolvedValue([]);

    const result: PostsResponseDto[] = await fetchBlogPosts.fetchPosts();

    expect(result).toEqual([
      {
        id: 1,
        title: 'Sample Post',
        author: '',
      },
      {
        id: 2,
        title: 'Another Post',
        author: '',
      },
      {
        id: 3,
        title: 'Some Post',
        author: '',
      },
    ]);

    expect(
      postCircuitBreakerService.getPostsWithCircuitBreaker,
    ).toHaveBeenCalled();
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(1);
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(2);
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(3);
  });

  it('should return empty array - posts api failing', async () => {
    const mockPosts: PostsType[] = [];

    postCircuitBreakerService.getPostsWithCircuitBreaker.mockResolvedValue(
      mockPosts,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockResolvedValue([]);

    const result: PostsResponseDto[] = await fetchBlogPosts.fetchPosts();

    expect(result).toEqual([]);

    expect(
      postCircuitBreakerService.getPostsWithCircuitBreaker,
    ).toHaveBeenCalled();

    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).not.toHaveBeenCalled();
  });
});
