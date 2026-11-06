"use client";

import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { ReactionIcon } from "@/components/newsfeed/reaction-icon";
import { ReactionPicker } from "@/components/newsfeed/reaction-picker";
import { ReactionSummary } from "@/components/newsfeed/reaction-summary";
import { REACTION_BY_TYPE } from "@/constants/reactions";
import { useReactionPicker } from "@/hooks/use-reaction-picker";
import { cn } from "@/lib/cn";
import type { ReactionSummary as ReactionSummaryData, ReactionType } from "@/types/post";

interface PostActionBarProps {
  reactions: ReactionSummaryData;
  commentCount: number;
  isCommentsOpen: boolean;
  shareLabel: string;
  showShare: boolean;
  shareDisabledReason: string | null;
  onReact: (type: ReactionType | null) => void;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onShare: () => void;
}

const ACTION_BUTTON =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100";

export function PostActionBar({
  reactions,
  commentCount,
  isCommentsOpen,
  shareLabel,
  showShare,
  shareDisabledReason,
  onReact,
  onToggleLike,
  onToggleComments,
  onShare,
}: PostActionBarProps) {
  const picker = useReactionPicker();
  const selected = reactions.myReaction;
  const selectedReaction = selected ? REACTION_BY_TYPE[selected] : null;

  return (
    <div className="mt-3">
      {(reactions.total > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between gap-3 pb-2">
          <ReactionSummary summary={reactions} />
          {commentCount > 0 && (
            <button
              type="button"
              onClick={onToggleComments}
              className="text-sm text-zinc-500 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              {commentCount.toLocaleString("vi-VN")} bình luận
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-brand-50 pt-1">
        <div
          className="relative flex-1"
          onPointerEnter={picker.onPointerEnter}
          onPointerLeave={picker.onPointerLeave}
        >
          {picker.isOpen && (
            <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2">
              <ReactionPicker
                selected={selected}
                onSelect={(type) => {
                  onReact(type === selected ? null : type);
                  picker.close();
                }}
              />
            </div>
          )}
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={picker.isOpen}
            className={cn(
              ACTION_BUTTON,
              selectedReaction
                ? selectedReaction.colorClassName
                : "text-zinc-600 hover:bg-brand-50 hover:text-brand-700",
            )}
            onPointerDown={picker.onPointerDown}
            onPointerUp={picker.onPointerUp}
            onPointerCancel={picker.onPointerCancel}
            onClick={() => {
              if (picker.consumePressOpen()) return;
              onToggleLike();
            }}
          >
            {selected ? (
              <ReactionIcon type={selected} className="size-5" />
            ) : (
              <ThumbsUp className="size-5" aria-hidden="true" />
            )}
            {selectedReaction?.label ?? "Thích"}
          </button>
        </div>

        <button
          type="button"
          aria-expanded={isCommentsOpen}
          onClick={onToggleComments}
          className={cn(
            ACTION_BUTTON,
            isCommentsOpen ? "bg-brand-50 text-brand-700" : "text-zinc-600 hover:bg-brand-50 hover:text-brand-700",
          )}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Bình luận
        </button>

        {showShare && (
          <button
            type="button"
            disabled={shareDisabledReason !== null}
            title={shareDisabledReason ?? undefined}
            onClick={onShare}
            className={cn(
              ACTION_BUTTON,
              shareDisabledReason
                ? "cursor-not-allowed text-zinc-400"
                : "text-zinc-600 hover:bg-brand-50 hover:text-brand-700",
            )}
          >
            <Share2 className="size-5" aria-hidden="true" />
            {shareLabel}
          </button>
        )}
      </div>
    </div>
  );
}
