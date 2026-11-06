"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_DETAIL_MAX_LENGTH, REPORT_REASONS, type ReportReason } from "@/constants/report";
import { getErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/cn";
import { postService } from "@/services/post.service";

interface ReportPostDialogProps {
  postId: string | null;
  onClose: () => void;
}

export function ReportPostDialog({ postId, onClose }: ReportPostDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"created" | "updated" | null>(null);
  const isOther = reason === "other";
  const detailLength = detail.trim().length;
  const isDetailTooLong = detailLength > REPORT_DETAIL_MAX_LENGTH;
  const canSubmit = reason !== null && !isDetailTooLong && (!isOther || detailLength > 0) && !isSubmitting;

  const close = () => {
    if (isSubmitting) return;
    setReason(null);
    setDetail("");
    setError(null);
    setResult(null);
    onClose();
  };

  const submit = async () => {
    if (!postId || !canSubmit || !reason) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await postService.report(postId, reason, isOther ? detail.trim() : undefined);
      setResult(response.updated ? "updated" : "created");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={postId !== null}
      title="Báo cáo bài viết"
      description="Báo cáo được lưu lại để xử lý sau. Bài viết vẫn hiển thị bình thường cho đến khi được xem xét."
      onClose={close}
    >
      {result ? (
        <div className="space-y-4">
          <FormAlert variant="success">
            {result === "updated" ? "Đã cập nhật lý do báo cáo của bạn." : "Đã gửi báo cáo."}
          </FormAlert>
          <div className="flex justify-end">
            <Button type="button" className="w-auto" onClick={close}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-brand-900">Chọn lý do</legend>
            {REPORT_REASONS.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm",
                  reason === item.value ? "border-brand-400 bg-brand-50 text-brand-800" : "border-brand-100 text-zinc-700",
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={() => {
                    setReason(item.value);
                    setError(null);
                  }}
                  className="accent-brand-600"
                />
                {item.label}
              </label>
            ))}
          </fieldset>

          {isOther && (
            <div className="space-y-2">
              <Textarea
                aria-label="Lý do khác"
                aria-invalid={isDetailTooLong}
                placeholder="Mô tả lý do báo cáo"
                value={detail}
                disabled={isSubmitting}
                onChange={(event) => {
                  setDetail(event.target.value);
                  setError(null);
                }}
              />
              <CharacterCounter length={detailLength} maxLength={REPORT_DETAIL_MAX_LENGTH} />
              {isDetailTooLong && (
                <p role="alert" className="text-sm text-rose-600">
                  Lý do không được vượt quá 500 ký tự.
                </p>
              )}
            </div>
          )}

          {error && <FormAlert variant="error">{error}</FormAlert>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="w-auto" onClick={close} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="danger" className="w-auto" disabled={!canSubmit} isLoading={isSubmitting}>
              {!isSubmitting && <Flag className="size-4" aria-hidden="true" />}
              Gửi báo cáo
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
