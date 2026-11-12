import Link from "next/link";
import { Flag } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import { PostContent } from "@/components/newsfeed/post-content";
import { UnavailableContent } from "@/components/newsfeed/unavailable-content";
import { formatFullDate, formatRelativeTime } from "@/lib/format-time";
import type { SharedOriginal, SharedPostState } from "@/types/post";

interface SharedPostPreviewProps {
  state: SharedPostState;
  original: SharedOriginal | null;
  onReport?: () => void;
}

export function SharedPostPreview({ state, original, onReport }: SharedPostPreviewProps) {
  if (state === "removed") {
    return <UnavailableContent kind="removed-original" />;
  }

  if (state !== "available" || !original) {
    return <UnavailableContent kind="missing-original" />;
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5">
      <div className="flex items-start gap-2.5">
        <Link href={userProfilePath(original.author.id)} className="shrink-0 rounded-full">
          <UserAvatar fullName={original.author.fullName} avatarUrl={original.author.avatarUrl} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={userProfilePath(original.author.id)} className="block truncate text-sm font-semibold text-brand-900 hover:underline">
            {original.author.fullName}
          </Link>
          <p className="text-[11px] text-zinc-500">
            <span title={formatFullDate(original.createdAt)}>{formatRelativeTime(original.createdAt)}</span>
            {original.editedAt && <span> · Đã chỉnh sửa</span>}
          </p>
        </div>
        {onReport && (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-500 hover:bg-white hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            <Flag className="size-3.5" aria-hidden="true" />
            Báo cáo
          </button>
        )}
      </div>
      <div className="mt-2.5">
        <PostContent content={original.content} />
      </div>
    </div>
  );
}
