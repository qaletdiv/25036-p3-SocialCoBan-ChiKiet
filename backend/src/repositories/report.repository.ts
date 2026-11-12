import { AppDataSource } from "@/config/data-source";
import type { ReportReason, ReportStatus, ReportTargetType } from "@/constants/report.constants";
import { ContentReport } from "@/entities/content-report.entity";

export interface ReportTarget {
  type: ReportTargetType;
  id: string;
}

export const reportRepository = AppDataSource.getRepository(ContentReport).extend({
  async saveReport(
    target: ReportTarget,
    userId: string,
    reason: ReportReason,
    detail: string | null,
  ): Promise<{ updated: boolean }> {
    const isPost = target.type === "post";
    const existing = await this.findOne({
      where: isPost ? { postId: target.id, userId } : { commentId: target.id, userId },
    });

    if (existing) {
      // A repeat report refreshes the reason and puts the report back in the pending queue
      await this.update({ id: existing.id }, { reason, detail, status: "pending" });
      return { updated: true };
    }

    await this.save(
      this.create({
        targetType: target.type,
        postId: isPost ? target.id : null,
        commentId: isPost ? null : target.id,
        userId,
        reason,
        detail,
        status: "pending",
      }),
    );
    return { updated: false };
  },

  countByStatus(status: ReportStatus): Promise<number> {
    return this.count({ where: { status } });
  },
});
