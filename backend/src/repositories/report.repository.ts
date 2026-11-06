import { AppDataSource } from "@/config/data-source";
import type { ReportReason } from "@/constants/report.constants";
import { PostReport } from "@/entities/post-report.entity";

export const reportRepository = AppDataSource.getRepository(PostReport).extend({
  findByPostAndUser(postId: string, userId: string): Promise<PostReport | null> {
    return this.findOne({ where: { postId, userId } });
  },

  async saveReport(
    postId: string,
    userId: string,
    reason: ReportReason,
    detail: string | null,
  ): Promise<{ updated: boolean }> {
    const existing = await this.findOne({ where: { postId, userId } });
    if (existing) {
      await this.update({ id: existing.id }, { reason, detail });
      return { updated: true };
    }

    await this.save(this.create({ postId, userId, reason, detail }));
    return { updated: false };
  },
});