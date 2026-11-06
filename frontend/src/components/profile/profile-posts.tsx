"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, NotebookPen, Share2 } from "lucide-react";
import { FeedFooter, FeedSkeleton } from "@/components/newsfeed/feed-states";
import { PostItem } from "@/components/newsfeed/post-item";
import { Button } from "@/components/ui/button";
import type { ProfilePostKind } from "@/constants/profile";
import { useProfilePosts } from "@/hooks/use-profile-posts";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { AuthUser } from "@/types/auth";

interface ProfilePostsProps {
  user: AuthUser;
  profileId: string;
  profileName: string;
  isSelf: boolean;
  kind: ProfilePostKind;
  onKindChange: (kind: ProfilePostKind) => void;
}

const TABS: { kind: ProfilePostKind; label: string }[] = [
  { kind: "authored", label: "Bài viết" },
  { kind: "shared", label: "Đã chia sẻ" },
];

export function ProfilePosts({
  user,
  profileId,
  profileName,
  isSelf,
  kind,
  onKindChange,
}: ProfilePostsProps) {
  const posts = useProfilePosts(profileId, kind, true);
  const { patchAuthorName } = posts;
  const isReady = posts.status === "ready";
  const knownName = useRef(profileName);
  const sentinelRef = useInfiniteScroll({
    enabled: isReady && posts.hasMore && !posts.loadMoreFailed,
    onReachEnd: () => void posts.loadMore(),
  });

  useEffect(() => {
    if (knownName.current === profileName) return;
    knownName.current = profileName;
    patchAuthorName(profileName);
  }, [patchAuthorName, profileName]);

  return (
    <section aria-label="Bài viết" className="space-y-4">
      <div role="tablist" aria-label="Danh sách bài viết" className="flex gap-2">
        {TABS.map((tab) => {
          const selected = kind === tab.kind;
          return (
            <button
              key={tab.kind}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onKindChange(tab.kind)}
              className={
                selected
                  ? "rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-md shadow-brand-600/10"
                  : "rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-white/70 hover:text-brand-700"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {posts.status === "loading" && <FeedSkeleton />}
      {posts.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <AlertCircle className="size-9 text-rose-500" aria-hidden="true" />
          <p className="max-w-xs text-sm text-rose-700">Không thể tải bài viết. Vui lòng thử lại.</p>
          <Button variant="outline" className="w-auto" onClick={() => void posts.reload()}>
            Thử lại
          </Button>
        </div>
      )}
      {isReady && posts.posts.length === 0 && <ProfilePostsEmpty kind={kind} isSelf={isSelf} name={profileName} />}
      {isReady &&
        posts.posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            user={user}
            onUpdated={posts.replacePost}
            onUpsert={posts.upsertPost}
            onPatch={posts.patchPost}
            onDeleted={posts.removePost}
          />
        ))}
      {isReady && posts.posts.length > 0 && (
        <>
          <div key={posts.posts.length} ref={sentinelRef} aria-hidden="true" className="h-px -translate-y-96" />
          <FeedFooter
            isLoadingMore={posts.isLoadingMore}
            loadMoreFailed={posts.loadMoreFailed}
            hasMore={posts.hasMore}
            onRetry={() => void posts.loadMore()}
          />
        </>
      )}
    </section>
  );
}

function ProfilePostsEmpty({ kind, isSelf, name }: { kind: ProfilePostKind; isSelf: boolean; name: string }) {
  const isShared = kind === "shared";
  const Icon = isShared ? Share2 : NotebookPen;
  const title = isShared ? "Chưa có bài chia sẻ" : "Chưa có bài viết";
  const description = isShared
    ? isSelf
      ? "Bài bạn chia sẻ sẽ hiện ở đây."
      : `${name} chưa chia sẻ bài viết nào.`
    : isSelf
      ? "Bài bạn đăng sẽ hiện ở đây."
      : `${name} chưa đăng bài viết nào.`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-brand-900">{title}</h2>
      <p className="max-w-sm text-sm text-zinc-600">{description}</p>
    </div>
  );
}
