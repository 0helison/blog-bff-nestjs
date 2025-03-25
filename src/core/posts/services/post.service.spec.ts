import { Http } from 'src/utils/http/http.service';
import { PostService } from './post.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsType } from 'src/utils/types/posts-type';

describe('PostService Unit Tests', () => {
  let postService: PostService;
  let httpMock: Http;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: 'HttpPosts',
          useValue: {
            sendRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    httpMock = module.get<Http>('HttpPosts');
  });

  test('constructor', () => {
    expect(postService).toBeDefined();
    expect(postService['http']).toBe(httpMock);
  });

  it('should return post by id', async () => {
    const mockPost: PostsType = {
      id: 1,
      title: 'Some title',
      authorId: 2,
      text: 'Some Text',
      author: '',
    };

    (httpMock.sendRequest as jest.Mock).mockResolvedValue(mockPost);

    const result = await postService.getPost(mockPost.id);

    expect(httpMock.sendRequest).toHaveBeenCalledTimes(1);
    expect(httpMock.sendRequest).toHaveBeenCalledWith(
      {
        method: 'GET',
        path: `/posts/${mockPost.id}`,
      },
      { timeout: 2000 },
    );
    expect(result).toStrictEqual(mockPost);
  });
});
