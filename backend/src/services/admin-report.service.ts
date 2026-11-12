import { ADMIN_REPORT_PAGE_SIZE, REPORT_PREVIEW_LENGTH } from "@/constants/admin.constants";
import type {
  ReportDecision,
  ReportHandleAction,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/constants/report.constants";
import {
  adminReportRepository,
  type ReportActionRow,
  type ReportRow,
} from "@/repositories/admin-report.repository";
import { postRepository } from "@/repositories/post.repository";
import { AppError } from "@/utils/app-error";

export type ReportContentState = "available" | "removed" | "deleted";

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

const toPerson = (id: string | null, fullName: string | null, username: string | null): ReportPerson | null =>
  id && fullName !== null && username !== null ? { id: String(id), fullName, username } : null;

const isContentAvailable = (row: ReportRow): boolean => {
  if (row.target_type === "post") return row.post_pk !== null && row.post_deleted_at === null;
  return row.comment_pk !== null && row.comment_post_pk !== null && row.comment_post_deleted_at === null;
};

const toActionView = (row: ReportActionRow): ReportActionView => ({
  id: String(row.id),
  decision: row.decision,
  note: row.note,
  isAutomatic: row.is_automatic === 1,
  createdAt: row.created_at.toISOString(),
  admin: toPerson(row.handler_id, row.handler_name, row.handler_username),
});

const toLastAction = (row: ReportRow): ReportActionView | null => {
  if (row.action_id === null || row.decision === null || row.handled_at === null) return null;
  return {
    id: String(row.action_id),
    decision: row.decision,
    note: row.note,
    isAutomatic: row.is_automatic === 1,
    createdAt: row.handled_at.toISOString(),
    admin: toPerson(row.handler_id, row.handler_name, row.handler_username),
  };
};

const resolveContent = (row: ReportRow): { state: ReportContentState; content: string | null } => {
  if (isContentAvailable(row)) {
    return { state: "available", content: row.target_type === "post" ? row.post_content : row.comment_content };
  }
  if (row.decision === "removed" && row.content_snapshot !== null) {
    return { state: "removed", content: row.content_snapshot };
  }
  return { state: "deleted", content: null };
};

const truncate = (value: string | null): string | null => {
  if (value === null) return null;
  return value.length > REPORT_PREVIEW_LENGTH ? `${value.slice(0, REPORT_PREVIEW_LENGTH)}...` : value;
};

const toSummary = (row: ReportRow): AdminReportSummary & { content: string | null } => {
  const { state, content } = resolveContent(row);
  const reporter = toPerson(row.reporter_id, row.reporter_name, row.reporter_username) as ReportPerson;

  return {
    id: String(row.report_id),
    targetType: row.target_type,
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    createdAt: row.reported_at.toISOString(),
    reporter,
    author:
      toPerson(row.author_id, row.author_name, row.author_username) ??
      toPerson(row.snapshot_author_id, row.snapshot_author_name, row.snapshot_author_username),
    contentState: state,
    contentPreview: truncate(content),
    lastAction: toLastAction(row),
    content,
  };
};

const toPage = (rows: ReportRow[], cursorOf: (row: ReportRow) => string): AdminReportPage => {
  const hasMore = rows.length > ADMIN_REPORT_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, ADMIN_REPORT_PAGE_SIZE) : rows;
  const last = page[page.length - 1];

  return {
    reports: page.map((row) => {
      const { content: _content, ...summary } = toSummary(row);
      return summary;
    }),
    nextCursor: hasMore && last ? cursorOf(last) : null,
  };
};

const normalizeNote = (note?: string): string | null => {
  const trimmed = note?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
};

export const adminReportService = {
  async listReports(input: {
    status?: ReportStatus;
    type?: ReportTargetType;
    reason?: ReportReason;
    cursor?: string;
  }): Promise<AdminReportPage> {
    const rows = await adminReportRepository.listReports({ ...input, limit: ADMIN_REPORT_PAGE_SIZE + 1 });
    return toPage(rows, (row) => String(row.report_id));
  },

  async listHistory(cursor?: string): Promise<AdminReportPage> {
    const rows = await adminReportRepository.listHistory(cursor, ADMIN_REPORT_PAGE_SIZE + 1);
    return toPage(rows, (row) => String(row.action_id));
  },

  async getReport(id: string): Promise<AdminReportDetail> {
    const row = await adminReportRepository.findRowById(id);
    if (!row) throw AppError.notFound("Report not found");

    const { content, ...summary } = toSummary(row);
    const actions = await adminReportRepository.listActions(id);

    let sharedPost: AdminReportDetail["sharedPost"] = null;
    if (row.target_type === "post" && row.post_shared_id) {
      const [original] = await postRepository.findByIdsIncludingDeleted([row.post_shared_id]);
      if (original) {
        sharedPost = {
          id: original.id,
          content: original.content,
          isDeleted: original.deletedAt !== null,
          author: { id: original.author.id, fullName: original.author.fullName, username: original.author.username },
        };
      }
    }

    const contentCreatedAt = row.target_type === "post" ? row.post_created_at : row.comment_created_at;

    return {
      ...summary,
      content,
      contentCreatedAt: contentCreatedAt ? contentCreatedAt.toISOString() : null,
      sharedPost: summary.contentState === "available" ? sharedPost : null,
      actions: actions.map(toActionView),
    };
  },

  async handleReport(
    adminId: string,
    reportId: string,
    action: ReportHandleAction,
    note?: string,
  ): Promise<AdminReportDetail> {
    const normalizedNote = normalizeNote(note);

    await adminReportRepository.runInTransaction(async (manager) => {
      const report = await adminReportRepository.lockReport(manager, reportId);
      if (!report) throw AppError.notFound("Report not found");
      if (report.status !== "pending") throw AppError.reportAlreadyHandled();

      const target = await adminReportRepository.findLiveTarget(manager, report);

      if (action === "close") {
        if (target) throw AppError.reportContentAvailable();
        await adminReportRepository.insertActions(manager, [
          {
            reportId,
            adminId,
            decision: "closed",
            note: normalizedNote,
            isAutomatic: false,
            contentSnapshot: null,
            snapshotAuthorId: null,
          },
        ]);
        await adminReportRepository.setStatus(manager, [reportId], "removed");
        return;
      }

      if (!target) throw AppError.reportContentUnavailable();

      if (action === "approve") {
        await adminReportRepository.insertActions(manager, [
          {
            reportId,
            adminId,
            decision: "approved",
            note: normalizedNote,
            isAutomatic: false,
            contentSnapshot: null,
            snapshotAuthorId: null,
          },
        ]);
        await adminReportRepository.setStatus(manager, [reportId], "approved");
        return;
      }

      // Removing the content also closes every other pending report on it
      const pending = await adminReportRepository.findPendingOnSameTarget(manager, report);
      const relatedIds = pending.map((item) => item.id).filter((id) => id !== reportId);

      const removalEntries = [
        { id: reportId, isAutomatic: false, note: normalizedNote },
        ...relatedIds.map((id) => ({ id, isAutomatic: true, note: null })),
      ];
      await adminReportRepository.insertActions(
        manager,
        removalEntries.map((entry) => ({
          reportId: entry.id,
          adminId,
          decision: "removed" as const,
          note: entry.note,
          isAutomatic: entry.isAutomatic,
          contentSnapshot: target.content,
          snapshotAuthorId: target.authorId,
        })),
      );
      await adminReportRepository.setStatus(manager, [reportId, ...relatedIds], "removed");
      await adminReportRepository.deleteTarget(manager, report, target);
    });

    return this.getReport(reportId);
  },
};
