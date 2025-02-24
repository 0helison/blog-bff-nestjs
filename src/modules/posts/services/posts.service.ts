import { Injectable } from '@nestjs/common';
import { Client } from 'undici';

export type Posts = {
  id: number;
  title: string;
  authorId: number;
  text: string;
};

@Injectable()
export class PostsService {
  private client: Client;

  constructor() {
    this.client = new Client('http://localhost:3001');
  }

  async getPosts(limit: number = 5) {
    const { body } = await this.client.request({
      method: 'GET',
      path: `/posts`,
    });

    const data: Posts[] = (await body.json()) as Posts[];

    const posts: {
      id: number;
      title: string;
      authorId: number;
      author: string;
    }[] = [];

    for (const post of data) {
      if (posts.length >= limit) continue;

      posts.push({
        id: post.id,
        title: post.title,
        authorId: post.authorId,
        author: '',
      });
    }

    return posts;
  }

  async getPost(id: number) {
    const { body } = await this.client.request({
      method: 'GET',
      path: `/posts/${id}`,
    });

    const data: Posts = (await body.json()) as Posts;

    return {
      id: data.id,
      title: data.title,
      text: data.text,
      authorId: data.authorId,
      author: '',
    };
  }
}
