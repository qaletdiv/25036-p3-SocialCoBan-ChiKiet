import { REPORT_REASONS, type ReportReason } from "@/constants/report";
import type {
  AdminReportFilters,
  ReportContentState,
  ReportDecision,
  ReportStatus,
  ReportTargetType,
} from "@/types/admin-report";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Chờ xử lý",
  approved: "Đã phê duyệt",
  removed: "Đã gỡ bỏ",
};

export const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-700",
  removed: "bg-rose-50 text-rose-700",
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  post: "Bài viết",
  comment: "Bình luận",
};

export const REPORT_DECISION_LABELS: Record<ReportDecision, string> = {
  approved: "Phê duyệt, giữ nội dung",
  removed: "Gỡ bỏ nội dung",
  closed: "Đóng báo cáo, nội dung đã bị xóa",
};

export const REPORT_DECISION_STYLES: Record<ReportDecision, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  removed: "bg-rose-50 text-rose-700",
  closed: "bg-zinc-100 text-zinc-700",
};

export const REPORT_CONTENT_STATE_LABELS: Record<ReportContentState, string> = {
  available: "Nội dung đang hiển thị",
  removed: "Nội dung đã bị gỡ bỏ",
  deleted: "Nội dung đã bị xóa",
};

export const REPORT_REASON_LABELS = Object.fromEntries(
  REPORT_REASONS.map((reason) => [reason.value, reason.label]),
) as Record<ReportReason, string>;

export const REPORT_NOTE_MAX_LENGTH = 500;

export const DEFAULT_REPORT_FILTERS: AdminReportFilters = { status: "pending", type: "", reason: "" };
