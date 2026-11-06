"use client";

import { POST_MAX_LENGTH } from "@/constants/post";
import { useEditableItem } from "@/hooks/use-editable-item";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

interface PostItemOptions {
  post: Post;
  allowEmpty?: boolean;
  onUpdated: (post: Post) => void;
  onDeleted: (postId: string) => void;
}

export const usePostItem = ({ post, allowEmpty = false, onUpdated, onDeleted }: PostItemOptions) =>
  useEditableItem<Post, void>({
    content: post.content,
    maxLength: POST_MAX_LENGTH,
    allowEmpty,
    update: (content) => postService.update(post.id, content),
    remove: () => postService.remove(post.id),
    onUpdated,
    onDeleted: () => onDeleted(post.id),
    onGone: () => onDeleted(post.id),
  });
