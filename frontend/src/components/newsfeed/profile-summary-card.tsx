import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import type { AuthUser } from "@/types/auth";

interface ProfileSummaryCardProps {
  user: AuthUser;
}

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  return (
    <section
      aria-label="Thông tin tài khoản"
      className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-md shadow-brand-600/5"
    >
      <div className="relative h-24 overflow-hidden bg-linear-to-r from-brand-700 via-brand-500 to-brand-300">
        <div className="absolute -top-8 -left-6 size-28 rounded-full bg-white/15" />
        <div className="absolute -right-4 -bottom-10 size-32 rounded-full bg-white/15" />
      </div>
      <div className="px-5 pb-6 text-center">
        <Link href="/profile" className="mx-auto block w-fit rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
          <UserAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="lg" className="relative z-10 -mt-10 ring-4" />
        </Link>
        <Link href="/profile" className="mt-3 block truncate text-lg font-bold text-brand-900 hover:underline">
          {user.fullName}
        </Link>
        <p className="truncate text-sm text-zinc-500">@{user.username}</p>
      </div>
    </section>
  );
}
