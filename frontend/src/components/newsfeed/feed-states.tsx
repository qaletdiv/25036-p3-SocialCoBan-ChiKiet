import { AlertCircle, Loader2, NotebookPen, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Đang tải bài viết">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-brand-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded-full bg-brand-100" />
              <div className="h-3 w-20 rounded-full bg-brand-50" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full rounded-full bg-brand-50" />
            <div className="h-3.5 w-5/6 rounded-full bg-brand-50" />
            <div className="h-3.5 w-2/3 rounded-full bg-brand-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <NotebookPen className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-brand-900">Chưa có bài viết nào</h2>
      <p className="max-w-xs text-sm text-zinc-600">
        Hãy chia sẻ điều đầu tiên của bạn. Bài viết sẽ xuất hiện ngay tại đây.
      </p>
    </div>
  );
}

interface FeedErrorProps {
  onRetry: () => void;
}

export function FeedError({ onRetry }: FeedErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
    >
      <AlertCircle className="size-9 text-rose-500" aria-hidden="true" />
      <p className="max-w-xs text-sm text-rose-700">
        Không thể tải bảng tin. Vui lòng kiểm tra kết nối và thử lại.
      </p>
      <Button variant="outline" className="w-auto" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}

interface FeedFooterProps {
  isLoadingMore: boolean;
  loadMoreFailed: boolean;
  hasMore: boolean;
  onRetry: () => void;
}

export function FeedFooter({ isLoadingMore, loadMoreFailed, hasMore, onRetry }: FeedFooterProps) {
  if (isLoadingMore) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-brand-700" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Đang tải thêm bài viết...
      </div>
    );
  }

  if (loadMoreFailed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
        <p className="text-sm text-rose-600">Không thể tải thêm bài viết.</p>
        <Button variant="outline" className="h-9 w-auto px-4" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <p className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-500">
        <PartyPopper className="size-4" aria-hidden="true" />
        Bạn đã xem hết bài viết
      </p>
    );
  }

  return null;
}
