import { apiRequest } from "@/lib/api-client";
import type { AccountStatus } from "@/constants/account-status";
import type { UserRole } from "@/types/auth";
import type { AdminUserDetail, AdminUserPage } from "@/types/admin-user";

interface AdminUserQuery {
  q?: string;
  status?: AccountStatus | "";
  role?: UserRole | "";
  cursor?: string;
}

export const adminUserService = {
  list(query: AdminUserQuery = {}): Promise<AdminUserPage> {
    const search = new URLSearchParams();
    if (query.q) search.set("q", query.q);
    if (query.status) search.set("status", query.status);
    if (query.role) search.set("role", query.role);
    if (query.cursor) search.set("cursor", query.cursor);
    const suffix = search.toString();
    return apiRequest<AdminUserPage>(`/admin/users${suffix ? `?${suffix}` : ""}`);
  },

  get(id: string): Promise<AdminUserDetail> {
    return apiRequest<{ user: AdminUserDetail }>(`/admin/users/${id}`).then((data) => data.user);
  },

  setLocked(id: string, locked: boolean): Promise<AdminUserDetail> {
    return apiRequest<{ user: AdminUserDetail }>(`/admin/users/${id}/lock`, {
      method: "PATCH",
      body: JSON.stringify({ locked }),
    }).then((data) => data.user);
  },
};
