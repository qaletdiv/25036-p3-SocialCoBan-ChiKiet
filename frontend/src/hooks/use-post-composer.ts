"use client";

import { useState } from "react";
import type { PostPrivacy } from "@/constants/privacy";
import { POST_MAX_LENGTH } from "@/constants/post";
import { getErrorMessage } from "@/lib/error-messages";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

interface PostComposerOptions {
  onCreated: (post: Post) => void;
}

export const usePostComposer = ({ onCreated }: PostComposerOptions) => {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<PostPrivacy>("public");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedContent = content.trim();
  const length = trimmedContent.length;
  const isTooLong = length > POST_MAX_LENGTH;
  const hasContent = length > 0;
  const canSubmit = hasContent && !isTooLong && !isSubmitting;

  const reset = () => {
    setContent("");
    setPrivacy("public");
    setIsPreviewing(false);
    setError(null);
  };

  const updateContent = (value: string) => {
    setContent(value);
    setError(null);
  };

  const submit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const post = await postService.create(trimmedContent, privacy);
      onCreated(post);
      reset();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    privacy,
    trimmedContent,
    length,
    isTooLong,
    hasContent,
    canSubmit,
    isPreviewing,
    isSubmitting,
    error,
    setContent: updateContent,
    setPrivacy,
    togglePreview: () => setIsPreviewing((current) => !current),
    cancel: reset,
    submit,
  };
};
