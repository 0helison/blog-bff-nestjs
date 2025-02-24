import { Injectable } from '@nestjs/common';
import { CommentsService } from '../../comments/comments.service';
import { UsersService } from '../../users/users.service';
import { PostsService } from './posts.service';

@Injectable()
export class FetchPostsAndCommentsWithAuthors {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  async getFetchPosts() {
    const posts = await this.postsService.getPosts();

    const uniqueAuthorsIds = [...new Set(posts.map((post) => post.authorId))];

    const authors = await this.usersService.getUsers(uniqueAuthorsIds);

    return posts.map((post) => ({
      ...post,
      author: authors[post.authorId],
      authorId: undefined,
    }));
  }

  async getFetchPost(id: number) {
    const [post, comments] = await Promise.all([
      this.postsService.getPost(id),
      this.commentsService.getComments(id),
    ]);

    const uniqueUsersIds = [
      ...new Set([post.authorId, ...comments.map((c) => c.userId)]),
    ];

    const users = await this.usersService.getUsers(uniqueUsersIds);

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
