import type { ReportReason } from "@/constants/report.constants";
import { commentRepository } from "@/repositories/comment.repository";
import { reportRepository } from "@/repositories/report.repository";
import { postAccessService } from "@/services/post-access.service";
import { AppError } from "@/utils/app-error";

const normalizeDetail = (reason: ReportReason, detail?: string): string | null =>
  reason === "other" ? (detail ?? "").trim() : null;

export const reportService = {
  async reportPost(
    userId: string,
    postId: string,
    reason: ReportReason,
    detail?: string,
  ): Promise<{ updated: boolean }> {
    const post = await postAccessService.ensureCanView(userId, postId);
    if (post.userId === userId) throw AppError.cannotReportOwnPost();

    return reportRepository.saveReport({ type: "post", id: postId }, userId, reason, normalizeDetail(reason, detail));
  },

  async reportComment(
    userId: string,
    commentId: string,
    reason: ReportReason,
    detail?: string,
  ): Promise<{ updated: boolean }> {
    const comment = await commentRepository.findByIdWithAuthor(commentId);
    if (!comment) throw AppError.notFound("Comment not found");
    await postAccessService.ensureCanView(userId, comment.postId);
    if (comment.userId === userId) throw AppError.cannotReportOwnComment();

    return reportRepository.saveReport(
      { type: "comment", id: commentId },
      userId,
      reason,
      normalizeDetail(reason, detail),
    );
  },
};
