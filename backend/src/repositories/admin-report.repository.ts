import type { EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import type {
  ReportDecision,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/constants/report.constants";
import { Comment } from "@/entities/comment.entity";
import { ContentReport } from "@/entities/content-report.entity";
import { Post } from "@/entities/post.entity";
import { ReportAction } from "@/entities/report-action.entity";

export interface AdminReportFilters {
  status?: ReportStatus;
  type?: ReportTargetType;
  reason?: ReportReason;
  cursor?: string;
  limit: number;
}

export interface ReportRow {
  report_id: string;
  target_type: ReportTargetType;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  reported_at: Date;
  reporter_id: string;
  reporter_name: string;
  reporter_username: string;
  post_pk: string | null;
  post_content: string | null;
  post_deleted_at: Date | null;
  post_created_at: Date | null;
  post_shared_id: string | null;
  comment_pk: string | null;
  comment_content: string | null;
  comment_created_at: Date | null;
  comment_post_pk: string | null;
  comment_post_deleted_at: Date | null;
  author_id: string | null;
  author_name: string | null;
  author_username: string | null;
  action_id: string | null;
  decision: ReportDecision | null;
  note: string | null;
  is_automatic: number | null;
  handled_at: Date | null;
  content_snapshot: string | null;
  handler_id: string | null;
  handler_name: string | null;
  handler_username: string | null;
  snapshot_author_id: string | null;
  snapshot_author_name: string | null;
  snapshot_author_username: string | null;
}

export interface ReportActionRow {
  id: string;
  decision: ReportDecision;
  note: string | null;
  is_automatic: number;
  created_at: Date;
  handler_id: string | null;
  handler_name: string | null;
  handler_username: string | null;
}

export interface LiveTarget {
  content: string;
  authorId: string;
  isShare: boolean;
}

export interface NewReportAction {
  reportId: string;
  adminId: string;
  decision: ReportDecision;
  note: string | null;
  isAutomatic: boolean;
  contentSnapshot: string | null;
  snapshotAuthorId: string | null;
}

const REPORT_COLUMNS = `
  r.id AS report_id, r.target_type, r.reason, r.detail, r.status, r.created_at AS reported_at,
  reporter.id AS reporter_id, reporter.full_name AS reporter_name, reporter.username AS reporter_username,
  p.id AS post_pk, p.content AS post_content, p.deleted_at AS post_deleted_at,
  p.created_at AS post_created_at, p.shared_post_id AS post_shared_id,
  c.id AS comment_pk, c.content AS comment_content, c.created_at AS comment_created_at,
  cp.id AS comment_post_pk, cp.deleted_at AS comment_post_deleted_at,
  author.id AS author_id, author.full_name AS author_name, author.username AS author_username,
  a.id AS action_id, a.decision, a.note, a.is_automatic, a.created_at AS handled_at, a.content_snapshot,
  handler.id AS handler_id, handler.full_name AS handler_name, handler.username AS handler_username,
  snap.id AS snapshot_author_id, snap.full_name AS snapshot_author_name, snap.username AS snapshot_author_username`;

const REPORT_JOINS = `
  JOIN users reporter ON reporter.id = r.user_id
  LEFT JOIN posts p ON p.id = r.post_id
  LEFT JOIN comments c ON c.id = r.comment_id
  LEFT JOIN posts cp ON cp.id = c.post_id
  LEFT JOIN users author ON author.id = COALESCE(p.user_id, c.user_id)
  LEFT JOIN users handler ON handler.id = a.admin_id
  LEFT JOIN users snap ON snap.id = a.snapshot_author_id`;

const LATEST_ACTION_JOIN = `
  LEFT JOIN report_actions a ON a.id = (SELECT MAX(ra.id) FROM report_actions ra WHERE ra.report_id = r.id)`;

export const adminReportRepository = {
  listReports({ status, type, reason, cursor, limit }: AdminReportFilters): Promise<ReportRow[]> {
    const conditions: string[] = [];
    const params: Array<string | number> = [];
    if (status) {
      conditions.push("r.status = ?");
      params.push(status);
    }
    if (type) {
      conditions.push("r.target_type = ?");
      params.push(type);
    }
    if (reason) {
      conditions.push("r.reason = ?");
      params.push(reason);
    }
    if (cursor) {
      conditions.push("r.id < ?");
      params.push(cursor);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return AppDataSource.query(
      `SELECT ${REPORT_COLUMNS}
       FROM content_reports r ${LATEST_ACTION_JOIN} ${REPORT_JOINS}
       ${where}
       ORDER BY r.id DESC
       LIMIT ?`,
      [...params, limit],
    );
  },

  listHistory(cursor: string | undefined, limit: number): Promise<ReportRow[]> {
    const where = cursor ? "WHERE a.id < ?" : "";
    const params: Array<string | number> = cursor ? [cursor, limit] : [limit];

    return AppDataSource.query(
      `SELECT ${REPORT_COLUMNS}
       FROM report_actions a
       JOIN content_reports r ON r.id = a.report_id
       ${REPORT_JOINS}
       ${where}
       ORDER BY a.id DESC
       LIMIT ?`,
      params,
    );
  },

  async findRowById(id: string): Promise<ReportRow | null> {
    const rows: ReportRow[] = await AppDataSource.query(
      `SELECT ${REPORT_COLUMNS}
       FROM content_reports r ${LATEST_ACTION_JOIN} ${REPORT_JOINS}
       WHERE r.id = ?`,
      [id],
    );
    return rows[0] ?? null;
  },

  listActions(reportId: string): Promise<ReportActionRow[]> {
    return AppDataSource.query(
      `SELECT a.id, a.decision, a.note, a.is_automatic, a.created_at,
              handler.id AS handler_id, handler.full_name AS handler_name, handler.username AS handler_username
       FROM report_actions a
       LEFT JOIN users handler ON handler.id = a.admin_id
       WHERE a.report_id = ?
       ORDER BY a.id DESC`,
      [reportId],
    );
  },

  runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return AppDataSource.transaction(work);
  },

  lockReport(manager: EntityManager, id: string): Promise<ContentReport | null> {
    return manager
      .getRepository(ContentReport)
      .findOne({ where: { id }, lock: { mode: "pessimistic_write" } });
  },

  async findLiveTarget(manager: EntityManager, report: ContentReport): Promise<LiveTarget | null> {
    const posts = manager.getRepository(Post);

    if (report.targetType === "post") {
      if (!report.postId) return null;
      const post = await posts.findOne({ where: { id: report.postId }, lock: { mode: "pessimistic_write" } });
      return post ? { content: post.content, authorId: post.userId, isShare: post.sharedPostId !== null } : null;
    }

    if (!report.commentId) return null;
    const comment = await manager
      .getRepository(Comment)
      .findOne({ where: { id: report.commentId }, lock: { mode: "pessimistic_write" } });
    if (!comment) return null;
    const parentPost = await posts.findOne({ where: { id: comment.postId } });
    return parentPost ? { content: comment.content, authorId: comment.userId, isShare: false } : null;
  },

  findPendingOnSameTarget(manager: EntityManager, report: ContentReport): Promise<ContentReport[]> {
    const where =
      report.targetType === "post"
        ? { postId: report.postId as string, status: "pending" as const }
        : { commentId: report.commentId as string, status: "pending" as const };
    return manager.getRepository(ContentReport).find({ where });
  },

  async setStatus(manager: EntityManager, ids: string[], status: ReportStatus): Promise<void> {
    if (ids.length === 0) return;
    await manager.getRepository(ContentReport).update(ids, { status });
  },

  async insertActions(manager: EntityManager, actions: NewReportAction[]): Promise<void> {
    if (actions.length === 0) return;
    const repository = manager.getRepository(ReportAction);
    await repository.save(actions.map((action) => repository.create(action)));
  },

  async deleteTarget(manager: EntityManager, report: ContentReport, target: LiveTarget): Promise<void> {
    if (report.targetType === "comment") {
      await manager.getRepository(Comment).delete({ id: report.commentId as string });
      return;
    }
    const posts = manager.getRepository(Post);
    // Keep the row so the feed can show a placeholder. Clearing the share link frees the one-share rule.
    await posts.update(
      { id: report.postId as string },
      { removedByModeration: true, ...(target.isShare ? { sharedPostId: null } : {}) },
    );
    await posts.softDelete({ id: report.postId as string });
  },
};
