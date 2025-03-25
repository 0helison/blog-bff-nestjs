import { Http } from 'src/utils/http/http.service';
import { CommentsService } from './comments.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsType } from 'src/utils/types/comments-type';

describe('CommentsService Unit Tests', () => {
  let commentsService: CommentsService;
  let httpMock: Http;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: 'HttpComments',
          useValue: {
            sendRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    httpMock = module.get<Http>('HttpComments');
  });

  test('constructor', () => {
    expect(commentsService).toBeDefined();
    expect(commentsService['http']).toBe(httpMock);
  });

  it('should return comments by post id', async () => {
    const postId = 1;
    const limit = 2;
    const mockComments: CommentsType[] = [
      { id: 1, text: 'Text 1', userId: 2, postId: 1, user: 'John' },
      { id: 2, text: 'Text 2', userId: 4, postId: 1, user: 'Carl' },
      { id: 3, text: 'Text 3', userId: 8, postId: 1, user: 'Otto' },
    ];

    (httpMock.sendRequest as jest.Mock).mockResolvedValue(mockComments);

    const result = await commentsService.getComments(postId, limit);

    expect(httpMock.sendRequest).toHaveBeenCalledTimes(1);
    expect(httpMock.sendRequest).toHaveBeenCalledWith(
      {
        method: 'GET',
        path: `/comments`,
        query: { postId },
      },
      { timeout: 2000 },
    );
    expect(result.length).toBe(limit);
    expect(result).toStrictEqual(
      mockComments.slice(0, limit).map((comment) => ({
        ...comment,
        user: '',
      })),
    );
  });
});
