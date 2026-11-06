import { Eye, Pencil, Send } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { PrivacyPicker } from "@/components/newsfeed/privacy-picker";
import { PostCard } from "@/components/newsfeed/post-card";
import { PostContent } from "@/components/newsfeed/post-content";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Textarea } from "@/components/ui/textarea";
import type { PostPrivacy } from "@/constants/privacy";
import { POST_MAX_LENGTH } from "@/constants/post";
import type { AuthUser } from "@/types/auth";

interface PostComposerProps {
  user: AuthUser;
  content: string;
  privacy: PostPrivacy;
  trimmedContent: string;
  length: number;
  isTooLong: boolean;
  hasContent: boolean;
  canSubmit: boolean;
  isPreviewing: boolean;
  isSubmitting: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onPrivacyChange: (value: PostPrivacy) => void;
  onTogglePreview: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const getGivenName = (fullName: string): string => fullName.trim().split(/\s+/).pop() ?? fullName;

export function PostComposer({
  user,
  content,
  privacy,
  trimmedContent,
  length,
  isTooLong,
  hasContent,
  canSubmit,
  isPreviewing,
  isSubmitting,
  error,
  onChange,
  onPrivacyChange,
  onTogglePreview,
  onCancel,
  onSubmit,
}: PostComposerProps) {
  return (
    <section
      aria-label="Tạo bài viết"
      className="rounded-2xl border border-brand-100 border-t-4 border-t-brand-500 bg-white p-4 shadow-md shadow-brand-600/5 sm:p-5"
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {isPreviewing ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">Xem trước bài viết</p>
            <div className="rounded-2xl bg-brand-50/60 p-1.5 sm:p-2">
              <PostCard author={user} timeLabel="Vừa xong">
                <PostContent content={trimmedContent} />
              </PostCard>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <UserAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} className="mt-0.5" />
            <Textarea
              aria-label="Nội dung bài viết"
              aria-invalid={isTooLong}
              placeholder={`${getGivenName(user.fullName)} ơi, bạn đang nghĩ gì thế?`}
              value={content}
              disabled={isSubmitting}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  onSubmit();
                }
              }}
            />
          </div>
        )}

        <PrivacyPicker value={privacy} disabled={isSubmitting} onChange={onPrivacyChange} />

        {isTooLong && (
          <p role="alert" className="text-sm text-rose-600">
            Nội dung bài viết không được vượt quá {POST_MAX_LENGTH.toLocaleString("vi-VN")} ký tự.
          </p>
        )}
        {error && <FormAlert variant="error">{error}</FormAlert>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-h-5">{hasContent && <CharacterCounter length={length} />}</div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {hasContent && (
              <Button type="button" variant="ghost" className="h-10 px-3" onClick={onCancel} disabled={isSubmitting}>
                Hủy
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-10 w-auto px-4"
              onClick={onTogglePreview}
              disabled={!hasContent || isSubmitting}
            >
              {isPreviewing ? (
                <Pencil className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
              {isPreviewing ? "Chỉnh sửa" : "Xem trước"}
            </Button>
            <Button type="submit" className="h-10 w-auto px-5" disabled={!canSubmit} isLoading={isSubmitting}>
              {!isSubmitting && <Send className="size-4" aria-hidden="true" />}
              Đăng bài
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
