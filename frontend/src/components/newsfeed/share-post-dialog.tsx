"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { PrivacyPicker } from "@/components/newsfeed/privacy-picker";
import { SharedPostPreview } from "@/components/newsfeed/shared-post-preview";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { PostPrivacy } from "@/constants/privacy";
import { POST_MAX_LENGTH } from "@/constants/post";
import { getErrorMessage } from "@/lib/error-messages";
import type { SharedOriginal } from "@/types/post";

interface SharePostDialogProps {
  open: boolean;
  preview: SharedOriginal | null;
  initialCaption: string;
  initialPrivacy: PostPrivacy;
  isUpdate: boolean;
  onClose: () => void;
  onSubmit: (content: string, privacy: PostPrivacy) => Promise<void>;
}

export function SharePostDialog({ open, initialCaption, ...props }: SharePostDialogProps) {
  if (!open) return null;
  return <SharePostForm key={`${initialCaption}:${props.initialPrivacy}`} initialCaption={initialCaption} {...props} />;
}

function SharePostForm({
  preview,
  initialCaption,
  initialPrivacy,
  isUpdate,
  onClose,
  onSubmit,
}: Omit<SharePostDialogProps, "open">) {
  const [content, setContent] = useState(initialCaption);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const length = content.trim().length;
  const isTooLong = length > POST_MAX_LENGTH;

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const submit = async () => {
    if (isTooLong || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(content.trim(), privacy);
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={isUpdate ? "Cập nhật chia sẻ" : "Chia sẻ bài viết"}
      description="Lời dẫn không bắt buộc. Nếu bạn đã chia sẻ bài này, lời dẫn mới sẽ thay thế lời dẫn cũ."
      onClose={close}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {preview && <SharedPostPreview state="available" original={preview} />}
        <Textarea
          aria-label="Lời dẫn"
          aria-invalid={isTooLong}
          placeholder="Viết lời dẫn..."
          value={content}
          disabled={isSubmitting}
          onChange={(event) => {
            setContent(event.target.value);
            setError(null);
          }}
        />
        <PrivacyPicker value={privacy} disabled={isSubmitting} onChange={setPrivacy} />
        <div className="flex items-center justify-between gap-3">
          <CharacterCounter length={length} />
          {isTooLong && (
            <p role="alert" className="text-sm text-rose-600">
              Lời dẫn không được vượt quá 5.000 ký tự.
            </p>
          )}
        </div>
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="w-auto" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" className="w-auto" disabled={isTooLong} isLoading={isSubmitting}>
            {!isSubmitting && <Send className="size-4" aria-hidden="true" />}
            {isUpdate ? "Lưu chia sẻ" : "Chia sẻ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
