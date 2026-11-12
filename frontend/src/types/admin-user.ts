import type { AccountStatus } from "@/constants/account-status";
import type { UserRole } from "@/types/auth";

export interface AdminUserSummary {
  id: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: string;
  role: UserRole;
  status: AccountStatus;
}

export interface AdminUserDetail extends AdminUserSummary {
  bio: string | null;
  emailVerified: boolean;
}

export interface AdminUserPage {
  users: AdminUserSummary[];
  nextCursor: string | null;
}

export interface AdminUserFilters {
  q: string;
  status: AccountStatus | "";
  role: UserRole | "";
}
