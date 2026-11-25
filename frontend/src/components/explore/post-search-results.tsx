"use client";

import { AlertCircle, Loader2, Search } from "lucide-react";
import { FeedSkeleton } from "@/components/newsfeed/feed-states";
import { PostItem } from "@/components/newsfeed/post-item";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { usePostSearch } from "@/hooks/use-post-search";
import type { AuthUser } from "@/types/auth";

interface PostSearchResultsProps {
  query: string;
  user: AuthUser;
}

export function PostSearchResults({ query, user }: PostSearchResultsProps) {
  const search = usePostSearch(query);
  const isReady = search.status === "ready";
  const sentinelRef = useInfiniteScroll({
    enabled: isReady && search.hasMore && !search.loadMoreFailed,
    onReachEnd: () => void search.loadMore(),
  });

  if (search.status === "idle") {
    return (
      <EmptyState
        title="Tìm bài viết theo nội dung hoặc từ khóa"
        description="Nhập một đoạn chữ có trong bài viết. Bài chia sẻ chỉ khớp với lời dẫn."
      />
    );
  }

  if (search.status === "loading") {
    return <FeedSkeleton />;
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
    <section aria-label="Bài viết" className="space-y-4">
      {search.posts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài viết"
          description={`Không có bài viết nào khớp với “${query.trim()}”.`}
        />
      ) : (
        search.posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            user={user}
            onUpdated={search.replacePost}
            onUpsert={search.upsertPost}
            onPatch={search.patchPost}
            onDeleted={search.removePost}
          />
        ))
      )}
      {search.posts.length > 0 && (
        <>
          <div key={search.posts.length} ref={sentinelRef} aria-hidden="true" className="h-px -translate-y-96" />
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
