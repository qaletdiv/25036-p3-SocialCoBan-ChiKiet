import { apiRequest } from "@/lib/api-client";
import type { AdminOverview } from "@/types/admin";

export const adminService = {
  getOverview(): Promise<AdminOverview> {
    return apiRequest<AdminOverview>("/admin/overview");
  },
};
