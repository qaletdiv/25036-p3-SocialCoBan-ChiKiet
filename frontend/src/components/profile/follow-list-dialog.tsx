"use client";

import Link from "next/link";
import { AlertCircle, Loader2, UserRoundCheck, UserRoundPlus, Users } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { userProfilePath } from "@/constants/navigation";
import { useFollowList } from "@/hooks/use-follow-list";
import type { ConnectionList } from "@/hooks/use-profile";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { UserSearchResult } from "@/types/user";

interface FollowListDialogProps {
  userId: string;
  list: ConnectionList | null;
  refreshKey: number;
  removeOnUnfollow: boolean;
  onClose: () => void;
  onChange: (personId: string, following: boolean) => void;
}

const TITLES: Record<ConnectionList, string> = {
  followers: "Người theo dõi",
  following: "Đang theo dõi",
};

export function FollowListDialog({
  userId,
  list,
  refreshKey,
  removeOnUnfollow,
  onClose,
  onChange,
}: FollowListDialogProps) {
  const followList = useFollowList(userId, list, refreshKey, removeOnUnfollow, onChange);
  const isReady = followList.status === "ready";
  const sentinelRef = useInfiniteScroll({
    enabled: isReady && followList.hasMore && !followList.loadMoreFailed,
    onReachEnd: () => void followList.loadMore(),
  });

  return (
    <Modal open={list !== null} title={list ? TITLES[list] : ""} onClose={onClose}>
      {followList.status === "loading" && (
        <div role="status" aria-label="Đang tải danh sách" className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-brand-50" />
          ))}
        </div>
      )}
      {followList.status === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
          <p className="text-sm text-zinc-600">Không thể tải danh sách. Vui lòng thử lại.</p>
          <Button variant="outline" className="w-auto" onClick={() => void followList.reload()}>
            Thử lại
          </Button>
        </div>
      )}
      {isReady && followList.users.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Users className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-zinc-600">
            {list === "followers" ? "Chưa có người theo dõi." : "Chưa theo dõi ai."}
          </p>
        </div>
      )}
      {isReady && followList.users.length > 0 && (
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {followList.actionError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {followList.actionError}
            </p>
          )}
          <ul className="space-y-2">
            {followList.users.map((person) => (
              <li key={person.id}>
                <FollowListRow person={person} onToggleFollow={() => void followList.toggleFollow(person)} />
              </li>
            ))}
          </ul>
          <div key={followList.users.length} ref={sentinelRef} aria-hidden="true" className="h-px" />
          {followList.isLoadingMore && (
            <p className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Đang tải thêm
            </p>
          )}
          {followList.loadMoreFailed && (
            <div className="flex justify-center py-2">
              <Button variant="outline" className="w-auto" onClick={() => void followList.loadMore()}>
                Tải lại
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function FollowListRow({ person, onToggleFollow }: { person: UserSearchResult; onToggleFollow: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-1.5">
      <Link href={userProfilePath(person.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl">
        <UserAvatar fullName={person.fullName} avatarUrl={person.avatarUrl} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-brand-900">{person.fullName}</span>
          <span className="block truncate text-xs text-zinc-500">@{person.username}</span>
        </span>
      </Link>
      {!person.isSelf && (
        <Button
          type="button"
          variant={person.following ? "outline" : "primary"}
          className="h-9 w-auto px-3"
          onClick={onToggleFollow}
        >
          {person.following ? (
            <UserRoundCheck className="size-4" aria-hidden="true" />
          ) : (
            <UserRoundPlus className="size-4" aria-hidden="true" />
          )}
          {person.following ? "Đang theo dõi" : "Theo dõi"}
        </Button>
      )}
    </div>
  );
}
