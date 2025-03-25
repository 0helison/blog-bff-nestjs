import { Test, TestingModule } from '@nestjs/testing';
import { FetchBlogPost } from './fetch-blog-post.service';
import { PostCircuitBreakerService } from '../posts/services/post-circuit-breaker.service';
import { CommentsCircuitBreakerService } from '../comments/comments-circuit-breaker.service';
import { UsersCircuitBreakerService } from '../users/users-circuit-breaker.service';
import { PostsType } from '../../utils/types/posts-type';
import { CommentsType } from 'src/utils/types/comments-type';
import { UsersType } from 'src/utils/types/users-type';

describe('FetchBlogPost Unit Tests', () => {
  let fetchBlogPost: FetchBlogPost;
  let postCircuitBreakerService: jest.Mocked<PostCircuitBreakerService>;
  let commentsCircuitBreakerService: jest.Mocked<CommentsCircuitBreakerService>;
  let usersCircuitBreakerService: jest.Mocked<UsersCircuitBreakerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchBlogPost,
        {
          provide: PostCircuitBreakerService,
          useValue: { getPostWithCircuitBreaker: jest.fn() },
        },
        {
          provide: CommentsCircuitBreakerService,
          useValue: { getCommentsWithCircuitBreaker: jest.fn() },
        },
        {
          provide: UsersCircuitBreakerService,
          useValue: { getUsersWithCircuitBreaker: jest.fn() },
        },
      ],
    }).compile();

    fetchBlogPost = module.get<FetchBlogPost>(FetchBlogPost);
    postCircuitBreakerService = module.get(PostCircuitBreakerService);
    commentsCircuitBreakerService = module.get(CommentsCircuitBreakerService);
    usersCircuitBreakerService = module.get(UsersCircuitBreakerService);
  });

  it('should return a post with author and comments with users', async () => {
    const postId = 1;

    const mockPost: PostsType = {
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      authorId: 1,
      author: '',
    };

    const mockComments: CommentsType[] = [
      { id: 5, text: 'Nice post!', userId: 2, postId, user: '' },
      { id: 6, text: 'Great work!', userId: 3, postId, user: '' },
    ];

    const mockAuthor: UsersType = { id: 1, name: 'User One' };
    const mockCommentsUsers: UsersType[] = [
      { id: 2, name: 'User Two' },
      { id: 3, name: 'User Three' },
    ];

    postCircuitBreakerService.getPostWithCircuitBreaker.mockResolvedValue(
      mockPost,
    );
    commentsCircuitBreakerService.getCommentsWithCircuitBreaker.mockResolvedValue(
      mockComments,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockImplementation(
      (id) => {
        if (id === 1) return Promise.resolve(mockAuthor);
        if (id === 2) return Promise.resolve(mockCommentsUsers[0]);
        if (id === 3) return Promise.resolve(mockCommentsUsers[1]);
      },
    );

    const result = await fetchBlogPost.fetchPost(postId);

    expect(result).toEqual({
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      author: 'User One',
      comments: [
        { id: 5, text: 'Nice post!', user: 'User Two' },
        { id: 6, text: 'Great work!', user: 'User Three' },
      ],
    });

    expect(
      postCircuitBreakerService.getPostWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
    expect(
      commentsCircuitBreakerService.getCommentsWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
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

  it('should return a post with author empty and comments with users empty - users api failing', async () => {
    const postId = 1;

    const mockPost: PostsType = {
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      authorId: 1,
      author: '',
    };

    const mockComments: CommentsType[] = [
      { id: 5, text: 'Nice post!', userId: 2, postId, user: '' },
      { id: 6, text: 'Great work!', userId: 3, postId, user: '' },
    ];

    postCircuitBreakerService.getPostWithCircuitBreaker.mockResolvedValue(
      mockPost,
    );
    commentsCircuitBreakerService.getCommentsWithCircuitBreaker.mockResolvedValue(
      mockComments,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockResolvedValue([]);

    const result = await fetchBlogPost.fetchPost(postId);

    expect(result).toEqual({
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      author: '',
      comments: [
        { id: 5, text: 'Nice post!', user: '' },
        { id: 6, text: 'Great work!', user: '' },
      ],
    });

    expect(
      postCircuitBreakerService.getPostWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
    expect(
      commentsCircuitBreakerService.getCommentsWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);

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

  it('should return a post with author and comments with empty array - comments api failing', async () => {
    const postId = 1;

    const mockPost: PostsType = {
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      authorId: 1,
      author: '',
    };

    const mockComments: CommentsType[] = [];

    const mockAuthor: UsersType = { id: 1, name: 'User One' };

    postCircuitBreakerService.getPostWithCircuitBreaker.mockResolvedValue(
      mockPost,
    );
    commentsCircuitBreakerService.getCommentsWithCircuitBreaker.mockResolvedValue(
      mockComments,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockImplementation(
      (id) => {
        if (id === 1) return Promise.resolve(mockAuthor);
      },
    );

    const result = await fetchBlogPost.fetchPost(postId);

    expect(result).toEqual({
      id: postId,
      title: 'Sample Post',
      text: 'This is a post content',
      author: 'User One',
      comments: [],
    });

    expect(
      postCircuitBreakerService.getPostWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
    expect(
      commentsCircuitBreakerService.getCommentsWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
  });

  it('should return a custom post and comments with users - posts api failing', async () => {
    const postId = 1;

    const mockFallbackPost = {
      id: 0,
      title: 'Post Unavailable',
      text: 'The post is currently unavailable. Please try again later.',
      authorId: 0,
      author: '',
    };

    const mockComments: CommentsType[] = [
      { id: 5, text: 'Nice post!', userId: 2, postId, user: '' },
      { id: 6, text: 'Great work!', userId: 3, postId, user: '' },
    ];

    const mockAuthor: UsersType = { id: 1, name: 'User One' };

    postCircuitBreakerService.getPostWithCircuitBreaker.mockResolvedValueOnce(
      mockFallbackPost,
    );
    commentsCircuitBreakerService.getCommentsWithCircuitBreaker.mockResolvedValue(
      mockComments,
    );
    usersCircuitBreakerService.getUsersWithCircuitBreaker.mockImplementation(
      (id) => {
        if (id === 1) return Promise.resolve(mockAuthor);
        return Promise.resolve({ id: id, name: `User ${id}` });
      },
    );

    const result = await fetchBlogPost.fetchPost(postId);

    expect(result).toEqual({
      id: 0,
      title: 'Post Unavailable',
      text: 'The post is currently unavailable. Please try again later.',
      author: 'User 0',
      comments: [
        { id: 5, text: 'Nice post!', user: 'User 2' },
        { id: 6, text: 'Great work!', user: 'User 3' },
      ],
    });

    expect(
      postCircuitBreakerService.getPostWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
    expect(
      commentsCircuitBreakerService.getCommentsWithCircuitBreaker,
    ).toHaveBeenCalledWith(postId);
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(2);
    expect(
      usersCircuitBreakerService.getUsersWithCircuitBreaker,
    ).toHaveBeenCalledWith(3);
  });
});
