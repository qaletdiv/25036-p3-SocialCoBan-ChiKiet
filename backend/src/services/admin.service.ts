import { ADMIN_ACTIVITY_WINDOW_DAYS } from "@/constants/admin.constants";
import { postRepository } from "@/repositories/post.repository";
import { reportRepository } from "@/repositories/report.repository";
import { userRepository } from "@/repositories/user.repository";

export interface AdminOverview {
  totalUsers: number;
  totalPosts: number;
  newUsers: number;
  newPosts: number;
  pendingReports: number;
  activityWindowDays: number;
}

const windowStart = (): Date =>
  new Date(Date.now() - ADMIN_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const since = windowStart();
    const [totalUsers, newUsers, totalPosts, newPosts, pendingReports] = await Promise.all([
      userRepository.countAll(),
      userRepository.countCreatedSince(since),
      postRepository.countExisting(),
      postRepository.countCreatedSince(since),
      reportRepository.countByStatus("pending"),
    ]);

    return {
      totalUsers,
      totalPosts,
      newUsers,
      newPosts,
      pendingReports,
      activityWindowDays: ADMIN_ACTIVITY_WINDOW_DAYS,
    };
  },
};
