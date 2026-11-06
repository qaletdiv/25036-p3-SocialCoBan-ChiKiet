"use client";

import { useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error-messages";
import { applyReaction } from "@/lib/reactions";
import { postService } from "@/services/post.service";
import type { Post, ReactionType } from "@/types/post";

interface PostReactionsOptions {
  post: Post;
  onPatch: (postId: string, patch: Partial<Post>) => void;
}

export const usePostReactions = ({ post, onPatch }: PostReactionsOptions) => {
  const [error, setError] = useState<string | null>(null);
  const latestRequestRef = useRef(0);

  // Optimistic update; only the latest request may confirm or roll back the state
  const react = async (type: ReactionType | null) => {
    const previous = post.reactions;
    const requestId = ++latestRequestRef.current;

    setError(null);
    onPatch(post.id, { reactions: applyReaction(previous, type) });
    try {
      const confirmed = type
        ? await postService.setReaction(post.id, type)
        : await postService.removeReaction(post.id);
      if (requestId === latestRequestRef.current) onPatch(post.id, { reactions: confirmed });
    } catch (reactionError) {
      if (requestId !== latestRequestRef.current) return;
      onPatch(post.id, { reactions: previous });
      setError(getErrorMessage(reactionError));
    }
  };

  const toggleLike = () => react(post.reactions.myReaction ? null : "like");

  return { error, react, toggleLike };
};
