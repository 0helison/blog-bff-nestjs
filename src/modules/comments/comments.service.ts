import { Injectable } from '@nestjs/common';
import { Client } from 'undici';

type Comments = {
  id: number;
  text: string;
  userId: number;
  postId: number;
};

@Injectable()
export class CommentsService {
  private client: Client;

  constructor() {
    this.client = new Client('http://localhost:3002');
  }

  async getComments(postId: number, limit: number = 5) {
    const { body } = await this.client.request({
      method: 'GET',
      path: `/comments`,
      query: { postId },
    });

    const data: Comments[] = (await body.json()) as Comments[];

    const comments: {
      id: number;
      text: string;
      userId: number;
      user: string;
    }[] = [];

    for (const comment of data) {
      if (comments.length >= limit) continue;

      comments.push({
        id: comment.id,
        text: comment.text,
        userId: comment.userId,
        user: '',
      });
    }

    return comments;
  }
}
