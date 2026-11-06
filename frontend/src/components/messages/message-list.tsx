"use client";

import { useLayoutEffect, useRef } from "react";
import { MessageBubble } from "@/components/messages/message-bubble";
import { Button } from "@/components/ui/button";
import { formatDayLabel, getDayKey } from "@/lib/format-time";
import { isMessageRecallable } from "@/lib/message";
import type { Message } from "@/types/conversation";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  participantName: string;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  loadOlderFailed: boolean;
  onLoadOlder: () => void;
  onRecall: (message: Message) => void;
}

interface ScrollSnapshot {
  height: number;
  firstId: string | null;
  lastId: string | null;
}

export function MessageList({
  messages,
  currentUserId,
  participantName,
  hasOlder,
  isLoadingOlder,
  loadOlderFailed,
  onLoadOlder,
  onRecall,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const lastOwnMessageId =
    messages.findLast((message) => message.senderId === currentUserId && message.recalledAt === null)?.id ?? null;

  // Stick to the bottom for new messages, keep the reading position when older ones are prepended
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;
    const previous = snapshotRef.current;

    if (!previous || previous.lastId !== lastId) {
      container.scrollTop = container.scrollHeight;
    } else if (previous.firstId !== firstId) {
      container.scrollTop += container.scrollHeight - previous.height;
    }
    snapshotRef.current = { height: container.scrollHeight, firstId, lastId };
  }, [messages]);

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

        return (
          <div key={message.id} className="space-y-2">
            {startsNewDay && (
              <p className="py-2 text-center text-xs font-medium text-zinc-400">{formatDayLabel(message.createdAt)}</p>
            )}
            <MessageBubble
              message={message}
              isOwn={message.senderId === currentUserId}
              showStatus={message.id === lastOwnMessageId}
              canRecall={isMessageRecallable(message, currentUserId)}
              onRecall={() => onRecall(message)}
            />
          </div>
        );
      })}
    </div>
  );
}
