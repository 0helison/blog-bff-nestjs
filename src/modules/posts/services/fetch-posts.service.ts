import { Injectable } from '@nestjs/common';
import { CommentsService } from '../../comments/comments.service';
import { UsersService } from '../../users/users.service';
import { PostsService } from './posts.service';
import { PostsType } from '../types/posts-type';
import { UsersResponseType } from 'src/modules/users/types/users-renponse-type';
import { CommentsType } from 'src/modules/comments/types/comments-type';
import { PostsResponse } from '../types/posts-response';
import { PostResponse } from '../types/post-response';

@Injectable()
export class FetchPostsAndCommentsWithAuthors {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  async fetchPosts(): Promise<PostsResponse[]> {
    const posts: PostsType[] = await this.postsService.getPosts();

    const uniqueAuthorsIds: number[] = [
      ...new Set(posts.map((post) => post.authorId)),
    ];

    const authors: UsersResponseType =
      await this.usersService.getUsers(uniqueAuthorsIds);

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: authors[post.authorId],
    }));
  }

  async fetchPost(id: number): Promise<PostResponse> {
    const [post, comments]: [PostsType, CommentsType[]] = await Promise.all([
      this.postsService.getPost(id),
      this.commentsService.getComments(id),
    ]);

    const uniqueUsersIds: number[] = [
      ...new Set([post.authorId, ...comments.map((c) => c.userId)]),
    ];

    const users: UsersResponseType =
      await this.usersService.getUsers(uniqueUsersIds);

    return {
      id: post.id,
      title: post.title,
      text: post.text,
      author: users[post.authorId],
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        user: users[comment.userId],
      })),
    };
  }
}
