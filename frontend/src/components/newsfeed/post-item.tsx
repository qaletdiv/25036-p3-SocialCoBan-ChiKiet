"use client";

import { useState } from "react";
import { CommentThread } from "@/components/newsfeed/comment-thread";
import { DeletePostDialog } from "@/components/newsfeed/delete-post-dialog";
import { PostActionBar } from "@/components/newsfeed/post-action-bar";
import { PostActionsMenu } from "@/components/newsfeed/post-actions-menu";
import { PostCard } from "@/components/newsfeed/post-card";
import { PostContent } from "@/components/newsfeed/post-content";
import { PostEditForm } from "@/components/newsfeed/post-edit-form";
import { PostPrivacyDialog } from "@/components/newsfeed/post-privacy-dialog";
import { PRIVACY_LABELS } from "@/components/newsfeed/privacy-picker";
import { ReportContentDialog } from "@/components/newsfeed/report-content-dialog";
import { SharePostDialog } from "@/components/newsfeed/share-post-dialog";
import { SharedPostPreview } from "@/components/newsfeed/shared-post-preview";
import { UnavailableContent } from "@/components/newsfeed/unavailable-content";
import { usePostComments } from "@/hooks/use-post-comments";
import { usePostItem } from "@/hooks/use-post-item";
import { usePostReactions } from "@/hooks/use-post-reactions";
import { formatFullDate, formatRelativeTime } from "@/lib/format-time";
import { postService } from "@/services/post.service";
import type { AuthUser } from "@/types/auth";
import type { Post, SharedOriginal } from "@/types/post";

interface PostItemProps {
  post: Post;
  user: AuthUser;
  onUpdated: (post: Post) => void;
  onUpsert: (post: Post) => void;
  onPatch: (postId: string, patch: Partial<Post>) => void;
  onDeleted: (postId: string) => void;
}

const OWN_POST_SHARE_REASON = "Bạn không thể chia sẻ bài viết của chính mình";

export function PostItem({ post, user, onUpdated, onUpsert, onPatch, onDeleted }: PostItemProps) {
  const isShare = post.sharedPost !== null;
  const isOwner = post.author.id === user.id;
  const item = usePostItem({ post, allowEmpty: isShare, onUpdated, onDeleted });
  const reactions = usePostReactions({ post, onPatch });
  const comments = usePostComments(post.id, (commentCount) => onPatch(post.id, { commentCount }));
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  const original = post.sharedPost?.original ?? null;
  const shareTargetIsPublic = isShare ? original?.privacy === "public" : post.privacy === "public";
  const updatingOwnShare = isOwner && isShare;
  const shareTargetIsOwn = isShare ? original?.author.id === user.id : isOwner;
  const showShare = shareTargetIsPublic;
  const shareDisabledReason = showShare && shareTargetIsOwn && !updatingOwnShare ? OWN_POST_SHARE_REASON : null;
  const sharePreview: SharedOriginal | null =
    post.sharedPost?.original ??
    (isShare
      ? null
      : {
          id: post.id,
          content: post.content,
          privacy: post.privacy,
          createdAt: post.createdAt,
          editedAt: post.editedAt,
          author: post.author,
        });

  if (post.removed) {
    return (
      <PostCard
        author={post.author}
        timeLabel={formatRelativeTime(post.createdAt)}
        timeTitle={formatFullDate(post.createdAt)}
      >
        <UnavailableContent kind="removed-post" />
      </PostCard>
    );
  }

  return (
    <>
      <PostCard
        author={post.author}
        timeLabel={formatRelativeTime(post.createdAt)}
        timeTitle={formatFullDate(post.createdAt)}
        isEdited={post.editedAt !== null}
        privacyLabel={isOwner || post.privacy !== "public" ? PRIVACY_LABELS[post.privacy] : undefined}
        actions={
          !item.isEditing ? (
            <PostActionsMenu
              editLabel={isShare ? "Chỉnh sửa lời dẫn" : undefined}
              deleteLabel={isShare ? "Gỡ chia sẻ" : undefined}
              onEdit={isOwner ? item.startEdit : undefined}
              onPrivacy={isOwner ? () => setIsPrivacyOpen(true) : undefined}
              onDelete={isOwner ? () => item.setDeleteDialogOpen(true) : undefined}
              onReport={isOwner ? undefined : () => setReportPostId(post.id)}
            />
          ) : null
        }
      >
        {item.isEditing ? (
          <>
            <PostEditForm
              draft={item.draft}
              length={item.draftLength}
              isTooLong={item.isDraftTooLong}
              canSave={item.canSave}
              isSaving={item.isSaving}
              error={item.saveError}
              ariaLabel={isShare ? "Lời dẫn" : undefined}
              overLimitMessage={isShare ? "Lời dẫn không được vượt quá 5.000 ký tự." : undefined}
              onChange={item.setDraft}
              onSave={() => void item.save()}
              onCancel={item.cancelEdit}
            />
            {post.sharedPost && (
              <div className="mt-3">
                <SharedPostPreview state={post.sharedPost.state} original={post.sharedPost.original} />
              </div>
            )}
          </>
        ) : (
          <>
            {post.content && <PostContent content={post.content} />}
            {post.sharedPost && (
              <div className={post.content ? "mt-3" : undefined}>
                <SharedPostPreview
                  state={post.sharedPost.state}
                  original={post.sharedPost.original}
                  onReport={
                    post.sharedPost.original && post.sharedPost.original.author.id !== user.id
                      ? () => setReportPostId(post.sharedPost?.original?.id ?? null)
                      : undefined
                  }
                />
              </div>
            )}
            {reactions.error && <p className="mt-2 text-sm text-rose-600">{reactions.error}</p>}
            <PostActionBar
              reactions={post.reactions}
              commentCount={post.commentCount}
              isCommentsOpen={comments.isOpen}
              shareLabel={isOwner && isShare ? "Đã chia sẻ" : "Chia sẻ"}
              showShare={showShare}
              shareDisabledReason={shareDisabledReason}
              onReact={(type) => void reactions.react(type)}
              onToggleLike={() => void reactions.toggleLike()}
              onToggleComments={comments.toggle}
              onShare={() => setIsShareOpen(true)}
            />
            {comments.isOpen && <CommentThread user={user} comments={comments} />}
          </>
        )}
      </PostCard>
      {isOwner && (
        <DeletePostDialog
          open={item.isDeleteDialogOpen}
          isDeleting={item.isDeleting}
          error={item.deleteError}
          title={isShare ? "Gỡ chia sẻ?" : undefined}
          description={
            isShare
              ? "Bài chia sẻ sẽ biến khỏi bảng tin của bạn. Bài viết gốc và cảm xúc trên bài gốc không bị ảnh hưởng."
              : undefined
          }
          confirmLabel={isShare ? "Gỡ chia sẻ" : undefined}
          onOpenChange={item.setDeleteDialogOpen}
          onConfirm={() => void item.confirmDelete()}
        />
      )}
      <SharePostDialog
        open={isShareOpen}
        preview={sharePreview}
        initialCaption={isOwner && isShare ? post.content : ""}
        initialPrivacy={isOwner && isShare ? post.privacy : "public"}
        isUpdate={isOwner && isShare}
        onClose={() => setIsShareOpen(false)}
        onSubmit={async (content, privacy) => {
          onUpsert((await postService.share(post.id, content, privacy)).post);
        }}
      />
      {isOwner && (
        <PostPrivacyDialog
          open={isPrivacyOpen}
          privacy={post.privacy}
          onClose={() => setIsPrivacyOpen(false)}
          onSubmit={async (privacy) => {
            onUpdated(await postService.updatePrivacy(post.id, privacy));
          }}
        />
      )}
      <ReportContentDialog
        target={reportPostId ? { kind: "post", id: reportPostId } : null}
        onClose={() => setReportPostId(null)}
      />
    </>
  );
}
