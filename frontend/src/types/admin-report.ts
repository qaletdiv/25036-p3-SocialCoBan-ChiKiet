import type { ReportReason } from "@/constants/report";

export type ReportTargetType = "post" | "comment";

export type ReportStatus = "pending" | "approved" | "removed";

export type ReportDecision = "approved" | "removed" | "closed";

export type ReportHandleAction = "approve" | "remove" | "close";

export type ReportContentState = "available" | "removed" | "deleted";

export type ReportTab = "queue" | "history";

export interface ReportPerson {
  id: string;
  fullName: string;
  username: string;
}

export interface ReportActionView {
  id: string;
  decision: ReportDecision;
  note: string | null;
  isAutomatic: boolean;
  createdAt: string;
  admin: ReportPerson | null;
}

export interface AdminReportSummary {
  id: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: ReportPerson;
  author: ReportPerson | null;
  contentState: ReportContentState;
  contentPreview: string | null;
  lastAction: ReportActionView | null;
}

export interface AdminReportDetail extends AdminReportSummary {
  content: string | null;
  contentCreatedAt: string | null;
  sharedPost: { id: string; content: string; isDeleted: boolean; author: ReportPerson } | null;
  actions: ReportActionView[];
}

export interface AdminReportPage {
  reports: AdminReportSummary[];
  nextCursor: string | null;
}

export interface AdminReportFilters {
  status: ReportStatus | "";
  type: ReportTargetType | "";
  reason: ReportReason | "";
}
