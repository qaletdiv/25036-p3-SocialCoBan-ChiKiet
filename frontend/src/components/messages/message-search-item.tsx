"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format-time";
import type { MessageSearchHit } from "@/types/conversation";

interface MessageSearchItemProps {
  hit: MessageSearchHit;
  currentUserId: string;
  isActive: boolean;
  onSelect: () => void;
}

export function MessageSearchItem({ hit, currentUserId, isActive, onSelect }: MessageSearchItemProps) {
  const preview = `${hit.message.senderId === currentUserId ? "Bạn: " : ""}${hit.message.content}`;

  return (
    <li>
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
          isActive ? "bg-brand-100/70" : "hover:bg-brand-50",
        )}
      >
        <Link
          href={userProfilePath(hit.participant.id)}
          aria-label={`Trang cá nhân của ${hit.participant.fullName}`}
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <UserAvatar fullName={hit.participant.fullName} avatarUrl={hit.participant.avatarUrl} />
        </Link>
        <button
          type="button"
          onClick={onSelect}
          aria-current={isActive ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        >
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-semibold text-brand-900">{hit.participant.fullName}</span>
              <time dateTime={hit.message.createdAt} className="shrink-0 text-xs text-zinc-400">
                {formatRelativeTime(hit.message.createdAt)}
              </time>
            </span>
            <span className="mt-0.5 block truncate text-sm text-zinc-500">{preview}</span>
          </span>
        </button>
      </div>
    </li>
  );
}
