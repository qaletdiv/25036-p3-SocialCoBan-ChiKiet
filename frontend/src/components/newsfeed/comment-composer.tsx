"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Textarea } from "@/components/ui/textarea";
import { COMMENT_MAX_LENGTH } from "@/constants/comment";
import { useCommentComposer } from "@/hooks/use-comment-composer";
import type { AuthUser } from "@/types/auth";

interface CommentComposerProps {
  user: AuthUser;
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export function CommentComposer({
  user,
  placeholder,
  submitLabel,
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const composer = useCommentComposer({ onSubmit, onSubmitted: onCancel });
  const hasContent = composer.length > 0;

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        void composer.submit();
      }}
    >
      <div className="flex items-start gap-2.5">
        <Link
          href={userProfilePath(user.id)}
          className="mt-1 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <UserAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
        </Link>
        <Textarea
          autoFocus={autoFocus}
          aria-label={placeholder}
          aria-invalid={composer.isTooLong}
          placeholder={placeholder}
          value={composer.content}
          disabled={composer.isSubmitting}
          className="min-h-11 rounded-2xl bg-brand-50/70 py-2.5"
          onChange={(event) => composer.setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void composer.submit();
            }
          }}
        />
      </div>
      {composer.isTooLong && (
        <p role="alert" className="pl-11 text-sm text-rose-600">
          Bình luận không được vượt quá {COMMENT_MAX_LENGTH.toLocaleString("vi-VN")} ký tự.
        </p>
      )}
      {composer.error && <FormAlert variant="error">{composer.error}</FormAlert>}
      {(hasContent || onCancel) && (
        <div className="flex items-center justify-between gap-3 pl-11">
          <div className="min-h-5">{hasContent && <CharacterCounter length={composer.length} maxLength={COMMENT_MAX_LENGTH} />}</div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-3"
                onClick={() => {
                  composer.cancel();
                  onCancel();
                }}
                disabled={composer.isSubmitting}
              >
                Hủy
              </Button>
            )}
            <Button type="submit" className="h-9 w-auto px-4" disabled={!composer.canSubmit} isLoading={composer.isSubmitting}>
              {!composer.isSubmitting && <Send className="size-3.5" aria-hidden="true" />}
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
