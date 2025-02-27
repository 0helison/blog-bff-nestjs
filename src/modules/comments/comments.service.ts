import { Inject, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';
import { CommentsType } from './types/comments-type';

@Injectable()
export class CommentsService {
  constructor(@Inject('HttpComments') private readonly http: Http) {}

  async getComments(
    postId: number,
    limit: number = 5,
  ): Promise<CommentsType[]> {
    const response = (await this.http.request<CommentsType[]>(
      {
        method: 'GET',
        path: `/comments`,
        query: { postId },
      },
      { timeout: 5000 },
    )) as CommentsType[];

    return response.slice(0, limit).map(({ id, text, userId }) => ({
      id,
      text,
      userId,
      postId,
      user: '',
    }));
  }
}
