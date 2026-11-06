import type { ReactNode } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import type { PostAuthor } from "@/types/post";

interface PostCardProps {
  author: PostAuthor;
  timeLabel: string;
  timeTitle?: string;
  isEdited?: boolean;
  privacyLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PostCard({
  author,
  timeLabel,
  timeTitle,
  isEdited = false,
  privacyLabel,
  actions,
  children,
}: PostCardProps) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5 transition-shadow hover:shadow-lg hover:shadow-brand-600/10 sm:p-5">
      <header className="flex items-start gap-3">
        <Link
          href={userProfilePath(author.id)}
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <UserAvatar fullName={author.fullName} avatarUrl={author.avatarUrl} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={userProfilePath(author.id)} className="block truncate font-semibold text-brand-900 hover:underline">
            {author.fullName}
          </Link>
          <p className="text-xs text-zinc-500">
            <span title={timeTitle}>{timeLabel}</span>
            {isEdited && <span> · Đã chỉnh sửa</span>}
            {privacyLabel && <span> · {privacyLabel}</span>}
          </p>
        </div>
        {actions}
      </header>
      <div className="mt-3">{children}</div>
    </article>
  );
}
