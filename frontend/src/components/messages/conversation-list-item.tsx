import { UserAvatar } from "@/components/common/user-avatar";
import { UnreadBadge } from "@/components/messages/unread-badge";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format-time";
import type { Conversation } from "@/types/conversation";

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationListItem({ conversation, currentUserId, isActive, onSelect }: ConversationListItemProps) {
  const { participant, lastMessage } = conversation;
  const hasUnread = conversation.unreadCount > 0;
  const preview = lastMessage
    ? lastMessage.recalledAt
      ? "Tin nhắn đã được thu hồi"
      : `${lastMessage.senderId === currentUserId ? "Bạn: " : ""}${lastMessage.content}`
    : "";

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
          isActive ? "bg-brand-100/70" : "hover:bg-brand-50",
        )}
      >
        <UserAvatar fullName={participant.fullName} avatarUrl={participant.avatarUrl} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={cn("truncate text-brand-900", hasUnread ? "font-bold" : "font-semibold")}>
              {participant.fullName}
            </span>
            {lastMessage && (
              <time dateTime={lastMessage.createdAt} className="shrink-0 text-xs text-zinc-400">
                {formatRelativeTime(lastMessage.createdAt)}
              </time>
            )}
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                hasUnread ? "font-semibold text-brand-900" : "text-zinc-500",
                lastMessage?.recalledAt && "italic",
              )}
            >
              {preview}
            </span>
            <UnreadBadge count={conversation.unreadCount} className="shrink-0" />
          </span>
        </span>
      </button>
    </li>
  );
}
