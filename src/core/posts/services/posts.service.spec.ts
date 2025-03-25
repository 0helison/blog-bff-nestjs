import { Http } from 'src/utils/http/http.service';
import { PostsService } from './posts.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsType } from 'src/utils/types/posts-type';

describe('PostsService Unit Tests', () => {
  let postsService: PostsService;
  let httpMock: Http;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: 'HttpPosts',
          useValue: {
            sendRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    httpMock = module.get<Http>('HttpPosts');
  });

  test('constructor', () => {
    expect(postsService).toBeDefined();
    expect(postsService['http']).toBe(httpMock);
  });

  it('should return posts', async () => {
    const limit = 2;
    const mockPosts: PostsType[] = [
      { id: 1, title: 'Post 1', authorId: 10, text: 'Text 1', author: 'John' },
      { id: 2, title: 'Post 2', authorId: 11, text: 'Text 2', author: 'Carl' },
      { id: 3, title: 'Post 3', authorId: 12, text: 'Text 3', author: 'Otto' },
    ];

    (httpMock.sendRequest as jest.Mock).mockResolvedValue(mockPosts);

    const result = await postsService.getPosts(limit);

    expect(httpMock.sendRequest).toHaveBeenCalledTimes(1);
    expect(httpMock.sendRequest).toHaveBeenCalledWith(
      {
        method: 'GET',
        path: '/posts',
      },
      { timeout: 2000 },
    );
    expect(result.length).toBe(limit);
    expect(result).toStrictEqual(
      mockPosts.slice(0, limit).map((post) => ({
        ...post,
        author: '',
      })),
    );
  });
});
