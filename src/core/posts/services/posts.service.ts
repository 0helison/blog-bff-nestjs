import { Inject, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';
import { PostsType } from '../../../utils/types/posts-type';

@Injectable()
export class PostsService {
  constructor(@Inject('HttpPosts') private readonly http: Http) {}

  async getPosts(limit: number): Promise<PostsType[]> {
    const response = (await this.http.request<PostsType[]>(
      {
        method: 'GET',
        path: `/posts`,
      },
      { timeout: 2000 },
    )) as PostsType[];

    return response.slice(0, limit).map((post) => ({
      ...post,
      author: '',
    }));
  }
}
