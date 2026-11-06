"use client";

import { useState } from "react";
import { PrivacyPicker } from "@/components/newsfeed/privacy-picker";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Modal } from "@/components/ui/modal";
import type { PostPrivacy } from "@/constants/privacy";
import { getErrorMessage } from "@/lib/error-messages";

interface PostPrivacyDialogProps {
  open: boolean;
  privacy: PostPrivacy;
  onClose: () => void;
  onSubmit: (privacy: PostPrivacy) => Promise<void>;
}

export function PostPrivacyDialog({ open, privacy, onClose, onSubmit }: PostPrivacyDialogProps) {
  if (!open) return null;
  return <PostPrivacyForm key={privacy} privacy={privacy} onClose={onClose} onSubmit={onSubmit} />;
}

function PostPrivacyForm({
  privacy,
  onClose,
  onSubmit,
}: Omit<PostPrivacyDialogProps, "open">) {
  const [value, setValue] = useState(privacy);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(value);
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
      title="Quyền riêng tư"
      description="Bạn luôn xem được bài của mình. Người khác chỉ xem được khi quyền của bài cho phép."
      onClose={close}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <PrivacyPicker value={value} disabled={isSubmitting} onChange={setValue} />
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="w-auto" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" className="w-auto" disabled={value === privacy} isLoading={isSubmitting}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
