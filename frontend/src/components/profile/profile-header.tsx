"use client";

import { CalendarDays, MessageCircle, Pencil, UserRoundCheck, UserRoundPlus } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import type { ConnectionList } from "@/hooks/use-profile";
import { formatJoinDate } from "@/lib/format-time";
import type { UserProfile } from "@/types/user";

interface ProfileHeaderProps {
  profile: UserProfile;
  isUpdatingFollow: boolean;
  isOpeningChat: boolean;
  onEdit: () => void;
  onToggleFollow: () => void;
  onMessage: () => void;
  onOpenList: (list: ConnectionList) => void;
}

export function ProfileHeader({
  profile,
  isUpdatingFollow,
  isOpeningChat,
  onEdit,
  onToggleFollow,
  onMessage,
  onOpenList,
}: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-md shadow-brand-600/5">
      <div className="relative h-28 overflow-hidden bg-linear-to-r from-brand-700 via-brand-500 to-brand-300 sm:h-36">
        <div className="absolute -top-8 -left-6 size-28 rounded-full bg-white/15" />
        <div className="absolute -right-4 -bottom-10 size-32 rounded-full bg-white/15" />
      </div>
      <div className="px-5 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <UserAvatar
            fullName={profile.fullName}
            avatarUrl={profile.avatarUrl}
            size="lg"
            className="relative z-10 -mt-12 size-24 text-3xl ring-4 sm:size-28"
          />
          {profile.isSelf ? (
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onEdit}>
              <Pencil className="size-4" aria-hidden="true" />
              Chỉnh sửa trang cá nhân
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                isLoading={isOpeningChat}
                onClick={onMessage}
              >
                {!isOpeningChat && <MessageCircle className="size-4" aria-hidden="true" />}
                Nhắn tin
              </Button>
              <Button
                type="button"
                variant={profile.following ? "outline" : "primary"}
                className="w-full sm:w-auto"
                isLoading={isUpdatingFollow}
                onClick={onToggleFollow}
              >
                {profile.following ? (
                  <UserRoundCheck className="size-4" aria-hidden="true" />
                ) : (
                  <UserRoundPlus className="size-4" aria-hidden="true" />
                )}
                {profile.following ? "Đang theo dõi" : "Theo dõi"}
              </Button>
            </div>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold text-brand-900">{profile.fullName}</h1>
        <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
        {profile.bio ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">{profile.bio}</p>
        ) : (
          profile.isSelf && <p className="mt-2 text-sm text-zinc-400">Chưa có tiểu sử.</p>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500">
          <CalendarDays className="size-4" aria-hidden="true" />
          Tham gia {formatJoinDate(profile.createdAt)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <CountButton
            count={profile.followerCount}
            label="người theo dõi"
            onClick={() => onOpenList("followers")}
          />
          <CountButton
            count={profile.followingCount}
            label="đang theo dõi"
            onClick={() => onOpenList("following")}
          />
        </div>
      </div>
    </section>
  );
}

function CountButton({ count, label, onClick }: { count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-left transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
    >
      <span className="font-bold text-brand-900">{count.toLocaleString("vi-VN")}</span>{" "}
      <span className="text-sm text-zinc-500">{label}</span>
    </button>
  );
}
