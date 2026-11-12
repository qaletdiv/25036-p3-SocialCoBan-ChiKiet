"use client";

import { AlertCircle, Check, Trash2, XCircle } from "lucide-react";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_CONTENT_STATE_LABELS,
  REPORT_DECISION_LABELS,
  REPORT_DECISION_STYLES,
  REPORT_NOTE_MAX_LENGTH,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_STYLES,
  REPORT_TARGET_LABELS,
} from "@/constants/admin-report";
import { useAdminReportDetail } from "@/hooks/use-admin-report-detail";
import { getErrorMessage } from "@/lib/error-messages";
import type { AdminReportDetail, ReportActionView, ReportPerson } from "@/types/admin-report";

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface AdminReportDialogProps {
  reportId: string | null;
  onClose: () => void;
  onHandled: () => void;
}

const formatPerson = (person: ReportPerson | null): string =>
  person ? `${person.fullName} (@${person.username})` : "Không xác định";

export function AdminReportDialog({ reportId, onClose, onHandled }: AdminReportDialogProps) {
  const detail = useAdminReportDetail(reportId, onHandled);
  const { report } = detail;
  const noteLength = detail.note.trim().length;
  const isNoteTooLong = noteLength > REPORT_NOTE_MAX_LENGTH;

  return (
    <Modal open={reportId !== null} title="Chi tiết báo cáo" onClose={onClose}>
      {detail.isLoading && <p className="text-sm text-zinc-500">Đang tải báo cáo...</p>}
      {detail.error != null && (
        <p role="alert" className="text-sm text-rose-700">
          {getErrorMessage(detail.error)}
        </p>
      )}

      {report && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {REPORT_TARGET_LABELS[report.targetType]}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REPORT_STATUS_STYLES[report.status]}`}>
              {REPORT_STATUS_LABELS[report.status]}
            </span>
          </div>

          <ReportedContent report={report} />

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Info label="Tác giả nội dung" value={formatPerson(report.author)} />
            <Info label="Người báo cáo" value={formatPerson(report.reporter)} />
            <Info label="Lý do" value={REPORT_REASON_LABELS[report.reason]} />
            <Info label="Thời gian báo cáo" value={dateTimeFormat.format(new Date(report.createdAt))} />
            {report.detail && (
              <div className="sm:col-span-2">
                <Info label="Mô tả của người báo cáo" value={report.detail} />
              </div>
            )}
          </dl>

          {report.actions.length > 0 && <ActionHistory actions={report.actions} />}

          {report.status === "pending" && (
            <div className="space-y-3 border-t border-brand-100 pt-4">
              <div className="space-y-2">
                <label htmlFor="report-note" className="text-sm font-semibold text-brand-900">
                  Ghi chú xử lý <span className="font-normal text-zinc-500">(không bắt buộc)</span>
                </label>
                <Textarea
                  id="report-note"
                  value={detail.note}
                  disabled={detail.isSubmitting}
                  aria-invalid={isNoteTooLong}
                  placeholder="Lý do bạn đưa ra quyết định này"
                  onChange={(event) => detail.setNote(event.target.value)}
                />
                <CharacterCounter length={noteLength} maxLength={REPORT_NOTE_MAX_LENGTH} />
                {isNoteTooLong && (
                  <p role="alert" className="text-sm text-rose-600">
                    Ghi chú không được vượt quá 500 ký tự.
                  </p>
                )}
              </div>

              {detail.actionError != null && (
                <p role="alert" className="flex items-start gap-2 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {getErrorMessage(detail.actionError)}
                </p>
              )}

              {report.contentState !== "available" ? (
                <Button
                  variant="outline"
                  isLoading={detail.isSubmitting}
                  disabled={isNoteTooLong}
                  onClick={() => void detail.handle("close")}
                >
                  {!detail.isSubmitting && <XCircle className="size-4" aria-hidden="true" />}
                  Đóng báo cáo
                </Button>
              ) : detail.confirmRemove ? (
                <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm text-rose-800">
                    {report.targetType === "comment"
                      ? "Gỡ bình luận này? Các phản hồi của bình luận cũng sẽ bị xóa và không thể khôi phục."
                      : "Gỡ bài viết này? Nội dung sẽ không còn đọc được. Bài viết vẫn hiện để mọi người biết nó đã bị gỡ."}{" "}
                    Các báo cáo khác đang chờ xử lý về nội dung này sẽ được chuyển sang &quot;Đã gỡ bỏ&quot;.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={detail.isSubmitting}
                      onClick={() => detail.setConfirmRemove(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="danger"
                      isLoading={detail.isSubmitting}
                      disabled={isNoteTooLong}
                      onClick={() => void detail.handle("remove")}
                    >
                      Xác nhận gỡ bỏ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="primary"
                    isLoading={detail.isSubmitting}
                    disabled={isNoteTooLong}
                    onClick={() => void detail.handle("approve")}
                  >
                    {!detail.isSubmitting && <Check className="size-4" aria-hidden="true" />}
                    Phê duyệt, giữ nội dung
                  </Button>
                  <Button
                    variant="danger"
                    disabled={detail.isSubmitting || isNoteTooLong}
                    onClick={() => detail.setConfirmRemove(true)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Gỡ bỏ nội dung
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ReportedContent({ report }: { report: AdminReportDetail }) {
  return (
    <section aria-label="Nội dung bị báo cáo" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-brand-900">Nội dung bị báo cáo</h3>
        {report.contentState !== "available" && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
            {REPORT_CONTENT_STATE_LABELS[report.contentState]}
          </span>
        )}
      </div>

      {report.content !== null ? (
        <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-zinc-800">{report.content}</p>
          {report.contentCreatedAt && (
            <p className="mt-2 text-xs text-zinc-500">
              Đăng lúc {dateTimeFormat.format(new Date(report.contentCreatedAt))}
            </p>
          )}
          {report.sharedPost && (
            <blockquote className="mt-3 rounded-lg border border-brand-100 bg-white p-3">
              <p className="text-xs font-semibold text-zinc-500">
                Bài viết gốc của {report.sharedPost.author.fullName}
                {report.sharedPost.isDeleted && " (đã bị xóa)"}
              </p>
              <p className="mt-1 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-zinc-700">
                {report.sharedPost.content}
              </p>
            </blockquote>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500">
          Nội dung đã bị xóa
        </p>
      )}

      {report.contentState === "removed" && (
        <p className="text-xs text-zinc-500">Đây là bản lưu của nội dung tại thời điểm bị gỡ bỏ.</p>
      )}
    </section>
  );
}

function ActionHistory({ actions }: { actions: ReportActionView[] }) {
  return (
    <section aria-label="Lịch sử xử lý" className="space-y-2">
      <h3 className="text-sm font-semibold text-brand-900">Lịch sử xử lý</h3>
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id} className="rounded-xl border border-brand-100 bg-white p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REPORT_DECISION_STYLES[action.decision]}`}>
                {REPORT_DECISION_LABELS[action.decision]}
              </span>
              {action.isAutomatic && (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  Tự động
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">
              {formatPerson(action.admin)} · {dateTimeFormat.format(new Date(action.createdAt))}
            </p>
            {action.note && <p className="mt-1.5 wrap-break-word whitespace-pre-wrap text-zinc-700">{action.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-break-word whitespace-pre-wrap text-brand-900">{value}</dd>
    </div>
  );
}
