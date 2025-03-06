import { CommentsDto } from './comments.dto';

export class PostResponseDto {
  id: number;
  title: string;
  text: string;
  author: string;
  comments: CommentsDto[];
}
