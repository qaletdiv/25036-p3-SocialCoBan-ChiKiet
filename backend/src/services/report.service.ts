import type { ReportReason } from "@/constants/report.constants";
import { reportRepository } from "@/repositories/report.repository";
import { postAccessService } from "@/services/post-access.service";
import { AppError } from "@/utils/app-error";

export const reportService = {
  async reportPost(
    userId: string,
    postId: string,
    reason: ReportReason,
    detail?: string,
  ): Promise<{ updated: boolean }> {
    const post = await postAccessService.ensureCanView(userId, postId);
    if (post.userId === userId) throw AppError.cannotReportOwnPost();

    return reportRepository.saveReport(postId, userId, reason, reason === "other" ? (detail ?? "").trim() : null);
  },
};
