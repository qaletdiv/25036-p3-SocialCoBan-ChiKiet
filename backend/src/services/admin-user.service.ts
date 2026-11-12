import type { AccountStatus } from "@/constants/account-status.constants";
import { ADMIN_USER_PAGE_SIZE } from "@/constants/admin.constants";
import type { UserRole } from "@/constants/user-role.constants";
import type { User } from "@/entities/user.entity";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/utils/app-error";

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

const accountStatusOf = (user: Pick<User, "lockedAt" | "emailVerifiedAt">): AccountStatus => {
  if (user.lockedAt) return "locked";
  if (!user.emailVerifiedAt) return "unverified";
  return "active";
};

const toSummary = (user: User): AdminUserSummary => ({
  id: user.id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  role: user.role,
  status: accountStatusOf(user),
});

const toDetail = (user: User): AdminUserDetail => ({
  ...toSummary(user),
  bio: user.bio,
  emailVerified: user.emailVerifiedAt !== null,
});

export const adminUserService = {
  async listUsers(input: {
    q?: string;
    status?: AccountStatus;
    role?: UserRole;
    cursor?: string;
  }): Promise<AdminUserPage> {
    const rows = await userRepository.searchForAdmin({
      term: input.q,
      status: input.status,
      role: input.role,
      cursor: input.cursor,
      limit: ADMIN_USER_PAGE_SIZE + 1,
    });
    const hasMore = rows.length > ADMIN_USER_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, ADMIN_USER_PAGE_SIZE) : rows;
    const last = page[page.length - 1];

    return {
      users: page.map(toSummary),
      nextCursor: hasMore && last ? last.id : null,
    };
  },

  async getUser(userId: string): Promise<AdminUserDetail> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return toDetail(user);
  },

  async setLocked(userId: string, locked: boolean): Promise<AdminUserDetail> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    if (user.role !== "user") throw AppError.cannotLockAdmin();

    await userRepository.setLocked(userId, locked);
    const updated = await userRepository.findById(userId);
    if (!updated) throw AppError.notFound("User not found");
    return toDetail(updated);
  },
};
