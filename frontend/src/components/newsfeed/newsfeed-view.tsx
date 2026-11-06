"use client";

import { PageBackdrop } from "@/components/common/page-backdrop";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SideNav } from "@/components/layout/side-nav";
import { FeedEmpty, FeedError, FeedFooter, FeedSkeleton } from "@/components/newsfeed/feed-states";
import { PostComposerContainer } from "@/components/newsfeed/post-composer-container";
import { PostItem } from "@/components/newsfeed/post-item";
import { ProfileSummaryCard } from "@/components/newsfeed/profile-summary-card";
import { RightRail } from "@/components/newsfeed/right-rail";
import { useFeed } from "@/hooks/use-feed";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { AuthUser } from "@/types/auth";

interface NewsfeedViewProps {
  user: AuthUser;
  onLogout: () => void;
}

export function NewsfeedView({ user, onLogout }: NewsfeedViewProps) {
  const feed = useFeed();
  const isReady = feed.status === "ready";

  const sentinelRef = useInfiniteScroll({
    enabled: isReady && feed.hasMore && !feed.loadMoreFailed,
    onReachEnd: () => void feed.loadMore(),
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <PageBackdrop />
      <AppHeader user={user} onLogout={onLogout} />
      <main className="mx-auto grid w-full max-w-360 flex-1 gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-6 lg:pb-6 xl:grid-cols-[18rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[20rem_minmax(0,1fr)_22rem]">
        <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-4">
          <ProfileSummaryCard user={user} />
          <SideNav userId={user.id} onLogout={onLogout} />
        </aside>

        <div className="scroll-area lg:-mx-2 lg:min-h-0 lg:overflow-y-auto lg:px-2 lg:py-1">
          <div className="mx-auto w-full max-w-3xl space-y-5">
            <PostComposerContainer user={user} onCreated={feed.addPost} />

            <section aria-label="Bảng tin" className="space-y-4">
              {feed.status === "loading" && <FeedSkeleton />}
              {feed.status === "error" && <FeedError onRetry={() => void feed.reload()} />}
              {isReady && feed.posts.length === 0 && <FeedEmpty />}
              {isReady &&
                feed.posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    user={user}
                    onUpdated={feed.replacePost}
                    onUpsert={feed.upsertPost}
                    onPatch={feed.patchPost}
                    onDeleted={feed.removePost}
                  />
                ))}
              {isReady && feed.posts.length > 0 && (
                <>
                  <div key={feed.posts.length} ref={sentinelRef} aria-hidden="true" className="h-px -translate-y-96" />
                  <FeedFooter
                    isLoadingMore={feed.isLoadingMore}
                    loadMoreFailed={feed.loadMoreFailed}
                    hasMore={feed.hasMore}
                    onRetry={() => void feed.loadMore()}
                  />
                </>
              )}
            </section>
          </div>
        </div>

        <aside className="hidden xl:flex xl:min-h-0 xl:flex-col">
          <RightRail />
        </aside>
      </main>
      <MobileNav userId={user.id} />
    </div>
  );
}
