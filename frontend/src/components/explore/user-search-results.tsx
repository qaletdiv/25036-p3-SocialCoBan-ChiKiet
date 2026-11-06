"use client";

import Link from "next/link";
import { AlertCircle, Loader2, Search, UserRoundCheck, UserRoundPlus } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { userProfilePath } from "@/constants/navigation";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useUserSearch } from "@/hooks/use-user-search";
import type { UserSearchResult } from "@/types/user";

interface UserSearchResultsProps {
  query: string;
}

export function UserSearchResults({ query }: UserSearchResultsProps) {
  const search = useUserSearch(query);
  const isReady = search.status === "ready";
  const sentinelRef = useInfiniteScroll({
    enabled: isReady && search.hasMore && !search.loadMoreFailed,
    onReachEnd: () => void search.loadMore(),
  });

  if (search.status === "idle") {
    return (
      <EmptyState
        title="Tìm bạn bè theo họ tên hoặc tên đăng nhập"
        description="Nhập họ tên hoặc tên đăng nhập vào ô tìm kiếm."
      />
    );
  }

  if (search.status === "loading") {
    return (
      <div role="status" aria-label="Đang tìm kiếm" className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl border border-brand-100 bg-white" />
        ))}
      </div>
    );
  }

  if (search.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-12 text-center">
        <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
        <p className="text-sm text-zinc-600">Không thể tải kết quả. Vui lòng thử lại.</p>
        <Button variant="outline" className="w-auto" onClick={() => void search.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <section aria-label="Người dùng" className="space-y-3">
      <h2 className="px-1 text-sm font-semibold tracking-wide text-brand-700 uppercase">Người dùng</h2>
      {search.actionError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {search.actionError}
        </p>
      )}
      {search.users.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tài khoản"
          description={`Không có tài khoản nào khớp với “${query.trim()}”.`}
        />
      ) : (
        search.users.map((person) => (
          <UserResultCard key={person.id} person={person} onToggleFollow={() => void search.toggleFollow(person)} />
        ))
      )}
      {search.users.length > 0 && (
        <>
          <div key={search.users.length} ref={sentinelRef} aria-hidden="true" className="h-px -translate-y-96" />
          {search.isLoadingMore && (
            <p className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Đang tải thêm
            </p>
          )}
          {search.loadMoreFailed && (
            <div className="flex justify-center">
              <Button variant="outline" className="w-auto" onClick={() => void search.loadMore()}>
                Tải lại
              </Button>
            </div>
          )}
          {!search.hasMore && !search.isLoadingMore && (
            <p className="py-2 text-center text-sm text-zinc-500">Bạn đã xem hết kết quả</p>
          )}
        </>
      )}
    </section>
  );
}

function UserResultCard({ person, onToggleFollow }: { person: UserSearchResult; onToggleFollow: () => void }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href={userProfilePath(person.id)} className="shrink-0 rounded-full">
          <UserAvatar fullName={person.fullName} avatarUrl={person.avatarUrl} />
        </Link>
        <div className="min-w-0">
          <Link href={userProfilePath(person.id)} className="block truncate font-semibold text-brand-900 hover:underline">
            {person.fullName}
          </Link>
          <p className="truncate text-sm text-zinc-500">@{person.username}</p>
          {person.isSelf && <p className="text-sm text-zinc-500">Đây là bạn</p>}
        </div>
      </div>
      {!person.isSelf && (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant={person.following ? "outline" : "primary"}
            className="h-10 w-auto px-4"
            title={person.following ? "Bỏ theo dõi" : "Theo dõi"}
            onClick={onToggleFollow}
          >
            {person.following ? (
              <UserRoundCheck className="size-4" aria-hidden="true" />
            ) : (
              <UserRoundPlus className="size-4" aria-hidden="true" />
            )}
            {person.following ? "Đang theo dõi" : "Theo dõi"}
          </Button>
        </div>
      )}
    </article>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Search className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-brand-900">{title}</h2>
      <p className="max-w-sm text-sm text-zinc-600">{description}</p>
    </div>
  );
}
