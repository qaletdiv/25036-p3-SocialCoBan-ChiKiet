import Link from "next/link";
import { FileX, Flag } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import { PostContent } from "@/components/newsfeed/post-content";
import { formatFullDate, formatRelativeTime } from "@/lib/format-time";
import type { SharedOriginal } from "@/types/post";

interface SharedPostPreviewProps {
  available: boolean;
  original: SharedOriginal | null;
  onReport?: () => void;
}

export function SharedPostPreview({ available, original, onReport }: SharedPostPreviewProps) {
  if (!available || !original) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-5 text-sm text-zinc-500">
        <FileX className="size-5 shrink-0" aria-hidden="true" />
        Bài viết gốc không còn tồn tại.
      </div>
    );
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
