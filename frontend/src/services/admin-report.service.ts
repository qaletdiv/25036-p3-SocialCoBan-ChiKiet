import { apiRequest } from "@/lib/api-client";
import type {
  AdminReportDetail,
  AdminReportFilters,
  AdminReportPage,
  ReportHandleAction,
} from "@/types/admin-report";

const buildQuery = (params: Record<string, string | undefined>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const adminReportService = {
  list(filters: AdminReportFilters, cursor?: string): Promise<AdminReportPage> {
    return apiRequest<AdminReportPage>(
      `/admin/reports${buildQuery({ status: filters.status, type: filters.type, reason: filters.reason, cursor })}`,
    );
  },

  history(cursor?: string): Promise<AdminReportPage> {
    return apiRequest<AdminReportPage>(`/admin/reports/history${buildQuery({ cursor })}`);
  },

  get(id: string): Promise<AdminReportDetail> {
    return apiRequest<{ report: AdminReportDetail }>(`/admin/reports/${id}`).then((data) => data.report);
  },

  handle(id: string, action: ReportHandleAction, note?: string): Promise<AdminReportDetail> {
    return apiRequest<{ report: AdminReportDetail }>(`/admin/reports/${id}/handle`, {
      method: "POST",
      body: JSON.stringify({ action, note: note || undefined }),
    }).then((data) => data.report);
  },
};
