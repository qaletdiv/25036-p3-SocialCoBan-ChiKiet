"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/messages/message-bubble";
import { Button } from "@/components/ui/button";
import { formatDayLabel, getDayKey } from "@/lib/format-time";
import { isMessageRecallable } from "@/lib/message";
import { cn } from "@/lib/cn";
import type { Message } from "@/types/conversation";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  participantName: string;
  hasOlder: boolean;
  hasNewer: boolean;
  isLoadingOlder: boolean;
  loadOlderFailed: boolean;
  isLoadingNewer: boolean;
  loadNewerFailed: boolean;
  focusMessageId?: string | null;
  onLoadOlder: () => void;
  onLoadNewer: () => void;
  onRecall: (message: Message) => void;
}

interface ScrollSnapshot {
  height: number;
  scrollTop: number;
  firstId: string | null;
  lastId: string | null;
}

export function MessageList({
  messages,
  currentUserId,
  participantName,
  hasOlder,
  hasNewer,
  isLoadingOlder,
  loadOlderFailed,
  isLoadingNewer,
  loadNewerFailed,
  focusMessageId,
  onLoadOlder,
  onLoadNewer,
  onRecall,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const [litId, setLitId] = useState<string | null>(focusMessageId ?? null);
  const lastOwnMessageId =
    messages.findLast((message) => message.senderId === currentUserId && message.recalledAt === null)?.id ?? null;

  useEffect(() => {
    setLitId(focusMessageId ?? null);
    if (!focusMessageId) return;
    const timer = window.setTimeout(() => setLitId(null), 2500);
    return () => window.clearTimeout(timer);
  }, [focusMessageId]);

  const centerMessage = (container: HTMLDivElement, messageId: string): boolean => {
    const target = container.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (!target) return false;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop =
      container.scrollTop + targetRect.top - containerRect.top - container.clientHeight / 2 + targetRect.height / 2;
    container.scrollTop = Math.max(0, nextTop);
    return true;
  };

  // Center a search hit on the first paint, keep the reading position when older
  // messages are prepended, and follow the bottom only when the reader is already there.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;
    const previous = snapshotRef.current;

    if (!previous) {
      if (!(focusMessageId && lastId !== focusMessageId && centerMessage(container, focusMessageId))) {
        container.scrollTop = container.scrollHeight;
      }
    } else if (previous.firstId !== firstId && previous.lastId === lastId) {
      container.scrollTop += container.scrollHeight - previous.height;
    } else if (previous.firstId !== firstId) {
      container.scrollTop = container.scrollHeight;
    } else if (previous.lastId !== lastId) {
      const wasNearBottom = previous.scrollTop + container.clientHeight >= previous.height - 80;
      if (wasNearBottom) container.scrollTop = container.scrollHeight;
    }

    snapshotRef.current = {
      height: container.scrollHeight,
      scrollTop: container.scrollTop,
      firstId,
      lastId,
    };
  }, [focusMessageId, messages]);

  return (
    <div ref={containerRef} className="scroll-area min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
      {hasOlder && (
        <div className="flex justify-center pb-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-auto px-4"
            isLoading={isLoadingOlder}
            onClick={onLoadOlder}
          >
            {loadOlderFailed ? "Tải lại tin nhắn cũ" : "Xem tin nhắn cũ hơn"}
          </Button>
        </div>
      )}
      {messages.length === 0 && (
        <p className="py-10 text-center text-sm text-zinc-500">
          Chưa có tin nhắn nào. Hãy gửi lời chào tới {participantName}.
        </p>
      )}
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const startsNewDay = !previous || getDayKey(previous.createdAt) !== getDayKey(message.createdAt);

        const isFocused = message.id === litId;

        return (
          <div key={message.id} className="space-y-2">
            {startsNewDay && (
              <p className="py-2 text-center text-xs font-medium text-zinc-400">{formatDayLabel(message.createdAt)}</p>
            )}
            <div
              data-message-id={message.id}
              aria-current={isFocused ? "true" : undefined}
              className={cn("rounded-2xl", isFocused && "ring-2 ring-brand-300 ring-offset-2")}
            >
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUserId}
                showStatus={message.id === lastOwnMessageId}
                canRecall={isMessageRecallable(message, currentUserId)}
                onRecall={() => onRecall(message)}
              />
            </div>
          </div>
        );
      })}
      {hasNewer && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-auto px-4"
            isLoading={isLoadingNewer}
            onClick={onLoadNewer}
          >
            {loadNewerFailed ? "Tải lại tin nhắn mới hơn" : "Xem tin nhắn mới hơn"}
          </Button>
        </div>
      )}
    </div>
  );
}
