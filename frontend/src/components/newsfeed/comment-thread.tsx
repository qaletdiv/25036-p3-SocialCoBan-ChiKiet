"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { CommentComposer } from "@/components/newsfeed/comment-composer";
import { CommentItem } from "@/components/newsfeed/comment-item";
import { Button } from "@/components/ui/button";
import { usePostComments } from "@/hooks/use-post-comments";
import type { AuthUser } from "@/types/auth";

interface CommentThreadProps {
  user: AuthUser;
  comments: ReturnType<typeof usePostComments>;
}

export function CommentThread({ user, comments }: CommentThreadProps) {
  return (
    <div className="mt-3 space-y-4 border-t border-brand-50 pt-3">
      <CommentComposer user={user} placeholder="Viết bình luận..." submitLabel="Gửi" onSubmit={comments.addComment} />

      {comments.status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-brand-700" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Đang tải bình luận...
        </div>
      )}

      {comments.status === "error" && (
        <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
          <AlertCircle className="size-5 text-rose-500" aria-hidden="true" />
          <p className="text-sm text-rose-600">Không thể tải bình luận.</p>
          <Button variant="outline" className="h-9 w-auto px-4" onClick={() => void comments.reload()}>
            Thử lại
          </Button>
        </div>
      )}

      {comments.status === "ready" && comments.comments.length === 0 && (
        <p className="text-center text-sm text-zinc-500">Hãy là người đầu tiên bình luận.</p>
      )}

      {comments.status === "ready" &&
        comments.comments.map((comment) => {
          const replyState = comments.replies[comment.id];
          const isReplying = comments.replyingToId === comment.id;

          return (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                currentUserId={user.id}
                canReply
                isReplying={isReplying}
                onReply={() => {
                  if (isReplying) {
                    comments.setReplyingToId(null);
                    return;
                  }
                  comments.setReplyingToId(comment.id);
                  if (comment.replyCount > 0 && replyState?.status !== "ready" && replyState?.status !== "loading") {
                    void comments.loadReplies(comment.id);
                  }
                }}
                onUpdated={comments.replaceComment}
                onDeleted={comments.removeComment}
              />

              {comment.replyCount > 0 && replyState?.status !== "ready" && replyState?.status !== "loading" && (
                <button
                  type="button"
                  className="ml-11 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  onClick={() => void comments.loadReplies(comment.id)}
                >
                  Xem {comment.replyCount.toLocaleString("vi-VN")} phản hồi
                </button>
              )}

              {replyState?.status === "loading" && (
                <p className="ml-11 flex items-center gap-2 text-sm text-brand-700">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  Đang tải phản hồi...
                </p>
              )}

              {replyState?.status === "error" && (
                <div className="ml-11">
                  <Button
                    variant="outline"
                    className="h-8 w-auto px-3 text-xs"
                    onClick={() => void comments.loadReplies(comment.id)}
                  >
                    Tải lại phản hồi
                  </Button>
                </div>
              )}

              {replyState?.status === "ready" && (
                <div className="ml-11 space-y-3">
                  {replyState.comments.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={user.id}
                      onUpdated={(updated) => comments.replaceReply(comment.id, updated)}
                      onDeleted={(replyId, commentCount) => comments.removeReply(comment.id, replyId, commentCount)}
                    />
                  ))}
                  {replyState.nextCursor && !replyState.isLoadingMore && !replyState.loadMoreFailed && (
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      onClick={() => void comments.loadReplies(comment.id, replyState.nextCursor)}
                    >
                      Xem thêm phản hồi
                    </button>
                  )}
                  {replyState.isLoadingMore && (
                    <p className="flex items-center gap-2 text-sm text-brand-700">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      Đang tải thêm phản hồi...
                    </p>
                  )}
                  {replyState.loadMoreFailed && (
                    <Button
                      variant="outline"
                      className="h-8 w-auto px-3 text-xs"
                      onClick={() => void comments.loadReplies(comment.id, replyState.nextCursor)}
                    >
                      Thử lại
                    </Button>
                  )}
                </div>
              )}

              {isReplying && (
                <div className="ml-11">
                  <CommentComposer
                    user={user}
                    autoFocus
                    placeholder={`Trả lời ${comment.author.fullName}...`}
                    submitLabel="Trả lời"
                    onSubmit={(content) => comments.addReply(comment.id, content)}
                    onCancel={() => comments.setReplyingToId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}

      {comments.status === "ready" && comments.hasMore && (
        <div className="text-center">
          {comments.isLoadingMore ? (
            <p className="flex items-center justify-center gap-2 text-sm text-brand-700">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Đang tải thêm bình luận...
            </p>
          ) : comments.loadMoreFailed ? (
            <Button variant="outline" className="h-9 w-auto px-4" onClick={() => void comments.loadMore()}>
              Thử lại
            </Button>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              onClick={() => void comments.loadMore()}
            >
              Xem thêm bình luận
            </button>
          )}
        </div>
      )}
    </div>
  );
}
