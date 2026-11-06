"use client";

import { useState } from "react";
import { COMMENT_MAX_LENGTH } from "@/constants/comment";
import { getErrorMessage } from "@/lib/error-messages";

interface CommentComposerOptions {
  onSubmit: (content: string) => Promise<void>;
  onSubmitted?: () => void;
}

export const useCommentComposer = ({ onSubmit, onSubmitted }: CommentComposerOptions) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedContent = content.trim();
  const length = trimmedContent.length;
  const isTooLong = length > COMMENT_MAX_LENGTH;
  const canSubmit = length > 0 && !isTooLong && !isSubmitting;

  const reset = () => {
    setContent("");
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
      await onSubmit(trimmedContent);
      reset();
      onSubmitted?.();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    length,
    isTooLong,
    canSubmit,
    isSubmitting,
    error,
    setContent: updateContent,
    cancel: reset,
    submit,
  };
};
