"use client";

import { SendHorizontal } from "lucide-react";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_MAX_LENGTH } from "@/constants/message";
import { useMessageComposer } from "@/hooks/use-message-composer";

interface MessageComposerProps {
  isSending: boolean;
  error: string | null;
  onSend: (content: string) => Promise<boolean>;
  onTyping: (hasText: boolean) => void;
}

const COUNTER_THRESHOLD = Math.floor(MESSAGE_MAX_LENGTH * 0.8);

export function MessageComposer({ isSending, error, onSend, onTyping }: MessageComposerProps) {
  const composer = useMessageComposer(onSend, isSending, onTyping);

  return (
    <form onSubmit={composer.handleSubmit} className="border-t border-brand-100 bg-white px-3 py-3 sm:px-4">
      {error && (
        <p role="alert" className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={composer.draft}
          onChange={(event) => composer.changeDraft(event.target.value)}
          onKeyDown={composer.handleKeyDown}
          rows={1}
          placeholder="Nhập tin nhắn..."
          aria-label="Nội dung tin nhắn"
          aria-invalid={composer.isOverLimit}
          className="min-h-11 max-h-40 flex-1 py-2.5"
        />
        <Button
          type="submit"
          className="size-11 shrink-0 px-0"
          aria-label="Gửi tin nhắn"
          title="Gửi tin nhắn"
          isLoading={isSending}
          disabled={!composer.canSend}
        >
          {!isSending && <SendHorizontal className="size-5" aria-hidden="true" />}
        </Button>
      </div>
      {composer.draft.length >= COUNTER_THRESHOLD && (
        <div className="mt-1 text-right">
          <CharacterCounter length={composer.draft.length} maxLength={MESSAGE_MAX_LENGTH} />
        </div>
      )}
    </form>
  );
}
