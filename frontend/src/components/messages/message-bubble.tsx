import { Check, CheckCheck, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatClockTime, formatFullDate } from "@/lib/format-time";
import type { Message } from "@/types/conversation";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showStatus: boolean;
  canRecall: boolean;
  onRecall: () => void;
}

export function MessageBubble({ message, isOwn, showStatus, canRecall, onRecall }: MessageBubbleProps) {
  const isSeen = message.seenAt !== null;
  const isRecalled = message.recalledAt !== null;

  return (
    <div className={cn("group flex flex-col", isOwn ? "items-end" : "items-start")}>
      <div className={cn("flex max-w-[85%] items-center gap-1.5 sm:max-w-[75%]", isOwn && "flex-row-reverse")}>
        <div
          title={formatFullDate(message.createdAt)}
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed wrap-anywhere whitespace-pre-wrap",
            isRecalled
              ? "border border-dashed border-zinc-300 bg-transparent text-zinc-400 italic"
              : isOwn
                ? "rounded-br-md bg-linear-to-br from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/20"
                : "rounded-bl-md border border-brand-100 bg-white text-foreground shadow-sm",
          )}
        >
          {isRecalled ? "Tin nhắn đã được thu hồi" : message.content}
        </div>
        {canRecall && (
          <button
            type="button"
            onClick={onRecall}
            aria-label="Thu hồi tin nhắn"
            title="Thu hồi tin nhắn"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 opacity-0 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 group-hover:opacity-100 pointer-coarse:opacity-100"
          >
            <Undo2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1.5 px-1 text-xs text-zinc-400">
        <time dateTime={message.createdAt}>{formatClockTime(message.createdAt)}</time>
        {isOwn && showStatus && (
          <span className={cn("flex items-center gap-1", isSeen && "text-brand-600")}>
            {isSeen ? (
              <CheckCheck className="size-3.5" aria-hidden="true" />
            ) : (
              <Check className="size-3.5" aria-hidden="true" />
            )}
            {isSeen ? "Đã xem" : "Đã gửi"}
          </span>
        )}
      </div>
    </div>
  );
}
