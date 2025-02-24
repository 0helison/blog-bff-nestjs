import { Injectable } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';
import { PostsService } from './posts.service';

@Injectable()
export class FetchPostAndCommentsWithAuthors {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  async getFetchComplete(id: number) {
    //const post = await this.getPost(id);
    //const comments = await this.commentsService.getComments(id);

    const [post, comments] = await Promise.all([
      this.postsService.getPost(id),
      this.commentsService.getComments(id),
    ]);

    const usersIds = new Set<number>();
    usersIds.add(post.authorId);

    for (const comment of comments) {
      usersIds.add(comment.userId);
    }

    const users = await this.usersService.getUsers(Array.from(usersIds));

    post.authorName = users[post.authorId];

    for (const comment of comments) {
      comment.user = users[comment.userId];
    }

    return {
      ...post,
      authorId: undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      comments: comments.map(({ userId, ...comment }) => comment),
    };
  }
}
