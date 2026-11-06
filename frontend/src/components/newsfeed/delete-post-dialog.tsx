"use client";

import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface DeletePostDialogProps {
  open: boolean;
  isDeleting: boolean;
  error: string | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeletePostDialog({
  title = "Xóa bài viết?",
  description = "Bài viết sẽ bị xóa khỏi bảng tin của bạn và không thể khôi phục lại.",
  confirmLabel = "Xóa bài viết",
  ...props
}: DeletePostDialogProps) {
  return <ConfirmDeleteDialog {...props} title={title} description={description} confirmLabel={confirmLabel} />;
}
