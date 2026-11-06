"use client";

import { PostComposer } from "@/components/newsfeed/post-composer";
import { usePostComposer } from "@/hooks/use-post-composer";
import type { AuthUser } from "@/types/auth";
import type { Post } from "@/types/post";

interface PostComposerContainerProps {
  user: AuthUser;
  onCreated: (post: Post) => void;
}

export function PostComposerContainer({ user, onCreated }: PostComposerContainerProps) {
  const composer = usePostComposer({ onCreated });

  return (
    <PostComposer
      user={user}
      content={composer.content}
      privacy={composer.privacy}
      trimmedContent={composer.trimmedContent}
      length={composer.length}
      isTooLong={composer.isTooLong}
      hasContent={composer.hasContent}
      canSubmit={composer.canSubmit}
      isPreviewing={composer.isPreviewing}
      isSubmitting={composer.isSubmitting}
      error={composer.error}
      onChange={composer.setContent}
      onPrivacyChange={composer.setPrivacy}
      onTogglePreview={composer.togglePreview}
      onCancel={composer.cancel}
      onSubmit={() => void composer.submit()}
    />
  );
}
