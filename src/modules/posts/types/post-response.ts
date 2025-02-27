export type PostResponse = {
  id: number;
  title: string;
  text: string;
  author: string;
  comments: {
    id: number;
    text: string;
    user: string;
  }[];
};
