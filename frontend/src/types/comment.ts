import type { PostAuthor } from "@/types/post";

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  editedAt: string | null;
  replyCount: number;
  author: PostAuthor;
}

export interface CommentPage {
  comments: Comment[];
  nextCursor: string | null;
}

export interface CreatedComment {
  comment: Comment;
  commentCount: number;
}
