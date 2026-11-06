"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { PostActionsMenu } from "@/components/newsfeed/post-actions-menu";
import { PostContent } from "@/components/newsfeed/post-content";
import { PostEditForm } from "@/components/newsfeed/post-edit-form";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { COMMENT_MAX_LENGTH } from "@/constants/comment";
import { userProfilePath } from "@/constants/navigation";
import { useCommentItem } from "@/hooks/use-comment-item";
import { formatFullDate, formatRelativeTime } from "@/lib/format-time";
import type { Comment } from "@/types/comment";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  canReply?: boolean;
  isReplying?: boolean;
  onReply?: () => void;
  onUpdated: (comment: Comment) => void;
  onDeleted: (commentId: string, commentCount?: number) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  canReply = false,
  isReplying = false,
  onReply,
  onUpdated,
  onDeleted,
}: CommentItemProps) {
  const item = useCommentItem({ comment, onUpdated, onDeleted });
  const isOwner = comment.author.id === currentUserId;

  return (
    <article className="flex items-start gap-2.5">
      <Link
        href={userProfilePath(comment.author.id)}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <UserAvatar fullName={comment.author.fullName} avatarUrl={comment.author.avatarUrl} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        {item.isEditing ? (
          <PostEditForm
            draft={item.draft}
            length={item.draftLength}
            isTooLong={item.isDraftTooLong}
            canSave={item.canSave}
            isSaving={item.isSaving}
            error={item.saveError}
            maxLength={COMMENT_MAX_LENGTH}
            ariaLabel="Nội dung bình luận"
            overLimitMessage="Bình luận không được vượt quá 2.000 ký tự."
            onChange={item.setDraft}
            onSave={() => void item.save()}
            onCancel={item.cancelEdit}
          />
        ) : (
          <div className="rounded-2xl bg-brand-50/80 px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={userProfilePath(comment.author.id)}
                  className="block truncate text-sm font-semibold text-brand-900 hover:underline"
                >
                  {comment.author.fullName}
                </Link>
                <p className="text-[11px] text-zinc-500">
                  <span title={formatFullDate(comment.createdAt)}>{formatRelativeTime(comment.createdAt)}</span>
                  {comment.editedAt && <span> · Đã chỉnh sửa</span>}
                </p>
              </div>
              {isOwner && (
                <PostActionsMenu
                  label="Tùy chọn bình luận"
                  editLabel="Chỉnh sửa bình luận"
                  deleteLabel="Xóa bình luận"
                  onEdit={item.startEdit}
                  onDelete={() => item.setDeleteDialogOpen(true)}
                />
              )}
            </div>
            <div className="mt-1.5">
              <PostContent content={comment.content} />
            </div>
          </div>
        )}

        {canReply && !item.isEditing && (
          <button
            type="button"
            onClick={onReply}
            className="mt-1 inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold text-zinc-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            {isReplying ? "Đang trả lời" : "Trả lời"}
          </button>
        )}
      </div>

      {isOwner && (
        <ConfirmDeleteDialog
          open={item.isDeleteDialogOpen}
          title="Xóa bình luận?"
          description={
            comment.replyCount > 0
              ? "Bình luận này và các phản hồi của nó sẽ bị xóa, không thể khôi phục lại."
              : "Bình luận sẽ bị xóa và không thể khôi phục lại."
          }
          confirmLabel="Xóa bình luận"
          isDeleting={item.isDeleting}
          error={item.deleteError}
          onOpenChange={item.setDeleteDialogOpen}
          onConfirm={() => void item.confirmDelete()}
        />
      )}
    </article>
  );
}
