import { Inject, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';
import { PostsType } from '../../../utils/types/posts-type';

@Injectable()
export class PostService {
  constructor(@Inject('HttpPosts') private readonly http: Http) {}

  async getPost(id: number): Promise<PostsType> {
    const response = (await this.http.request<PostsType>(
      {
        method: 'GET',
        path: `/posts/${id}`,
      },
      { timeout: 2000 },
    )) as PostsType;

    return {
      id: response.id,
      title: response.title,
      text: response.text,
      authorId: response.authorId,
      author: '',
    };
  }
}
