import Link from "next/link";
import { Eye, Pencil, Send } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { userProfilePath } from "@/constants/navigation";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { ImageFileButton, ImagePreview } from "@/components/newsfeed/image-attachment";
import { PostImage } from "@/components/newsfeed/post-image";
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
  imagePreview: string | null;
  onChange: (value: string) => void;
  onSelectImage: (file: File) => void;
  onClearImage: () => void;
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
  imagePreview,
  onChange,
  onSelectImage,
  onClearImage,
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
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex flex-col gap-5">
        {isPreviewing ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">Xem trước bài viết</p>
            <div className="rounded-2xl bg-brand-50/60 p-1.5 sm:p-2">
              <PostCard author={user} timeLabel="Vừa xong">
                <PostContent content={trimmedContent} />
                {imagePreview && <PostImage src={imagePreview} />}
              </PostCard>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link
                href={userProfilePath(user.id)}
                className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                <UserAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} />
              </Link>
              <Textarea
                aria-label="Nội dung bài viết"
                aria-invalid={isTooLong}
                rows={1}
                placeholder={`${getGivenName(user.fullName)} ơi, bạn đang nghĩ gì thế?`}
                value={content}
                disabled={isSubmitting}
                className="min-h-10 min-w-0 flex-1 py-2 leading-5"
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <ImageFileButton hasImage={imagePreview !== null} disabled={isSubmitting} onSelect={onSelectImage} />
            </div>
            {imagePreview && (
              <div className="pl-14">
                <ImagePreview src={imagePreview} disabled={isSubmitting} onClear={onClearImage} />
              </div>
            )}
          </div>
        )}

        <PrivacyPicker value={privacy} disabled={isSubmitting} onChange={onPrivacyChange} />
        </div>

        {isTooLong && (
          <p role="alert" className="text-sm text-rose-600">
            Nội dung bài viết không được vượt quá {POST_MAX_LENGTH.toLocaleString("vi-VN")} ký tự.
          </p>
        )}
        {error && <FormAlert variant="error">{error}</FormAlert>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-h-5">{hasContent && <CharacterCounter length={length} />}</div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {(hasContent || imagePreview) && (
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
