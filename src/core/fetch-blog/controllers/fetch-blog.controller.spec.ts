import { Test, TestingModule } from '@nestjs/testing';
import { FetchBlogController } from '../controllers/fetch-blog.controller';
import { FetchBlogPosts } from '../fetch-blog-posts.service';
import { FetchBlogPost } from '../fetch-blog-post.service';
import { PostsResponseDto } from '../dto/posts-response.dto';
import { PostResponseDto } from '../dto/post-response.dto';

describe('FetchBlogController', () => {
  let fetchBlogController: FetchBlogController;
  let fetchBlogPosts: jest.Mocked<FetchBlogPosts>;
  let fetchBlogPost: jest.Mocked<FetchBlogPost>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchBlogController],
      providers: [
        {
          provide: FetchBlogPosts,
          useValue: { fetchPosts: jest.fn() },
        },
        {
          provide: FetchBlogPost,
          useValue: { fetchPost: jest.fn() },
        },
      ],
    }).compile();

    fetchBlogController = module.get<FetchBlogController>(FetchBlogController);
    fetchBlogPosts = module.get(FetchBlogPosts);
    fetchBlogPost = module.get(FetchBlogPost);
  });

  it('should return all posts', async () => {
    const mockPosts: PostsResponseDto[] = [
      { id: 1, title: 'Post 1', author: 'Author 1' },
      { id: 2, title: 'Post 2', author: 'Author 2' },
    ];

    fetchBlogPosts.fetchPosts.mockResolvedValue(mockPosts);

    const result = await fetchBlogController.findAll();

    expect(result).toEqual(mockPosts);
    expect(fetchBlogPosts.fetchPosts).toHaveBeenCalled();
  });

  it('should return a post id', async () => {
    const mockPost: PostResponseDto = {
      id: 1,
      title: 'Post 1',
      text: 'Content of post 1',
      author: 'Author 1',
      comments: [],
    };

    fetchBlogPost.fetchPost.mockResolvedValue(mockPost);

    const result = await fetchBlogController.findOne(1);

    expect(result).toEqual(mockPost);
    expect(fetchBlogPost.fetchPost).toHaveBeenCalledWith(1);
  });
});
