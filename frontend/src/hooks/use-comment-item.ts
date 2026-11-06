"use client";

import { COMMENT_MAX_LENGTH } from "@/constants/comment";
import { useEditableItem } from "@/hooks/use-editable-item";
import { commentService } from "@/services/comment.service";
import type { Comment } from "@/types/comment";

interface CommentItemOptions {
  comment: Comment;
  onUpdated: (comment: Comment) => void;
  onDeleted: (commentId: string, commentCount?: number) => void;
}

export const useCommentItem = ({ comment, onUpdated, onDeleted }: CommentItemOptions) =>
  useEditableItem<Comment, { commentCount: number }>({
    content: comment.content,
    maxLength: COMMENT_MAX_LENGTH,
    update: (content) => commentService.update(comment.id, content),
    remove: () => commentService.remove(comment.id),
    onUpdated,
    onDeleted: (result) => onDeleted(comment.id, result.commentCount),
    onGone: () => onDeleted(comment.id),
  });
