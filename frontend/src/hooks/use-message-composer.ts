"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { MESSAGE_MAX_LENGTH } from "@/constants/message";

export const useMessageComposer = (
  onSend: (content: string) => Promise<boolean>,
  isSending: boolean,
  onTyping: (hasText: boolean) => void,
) => {
  const [draft, setDraft] = useState("");
  const content = draft.trim();
  const isOverLimit = draft.length > MESSAGE_MAX_LENGTH;
  const canSend = content.length > 0 && !isOverLimit && !isSending;

  const changeDraft = (value: string) => {
    setDraft(value);
    onTyping(value.trim().length > 0);
  };

  const submit = async () => {
    if (!canSend) return;
    onTyping(false);
    if (await onSend(content)) setDraft("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  // Enter sends, Shift+Enter inserts a newline; ignored while an IME is composing text
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submit();
  };

  return { draft, changeDraft, canSend, isOverLimit, handleSubmit, handleKeyDown };
};
