import type { UserRole } from "@/constants/user-role.constants";

export const DEFAULT_AUTHENTICATED_PATH = "/newsfeed";
export const ADMIN_OVERVIEW_PATH = "/admin";

export const resolveSafeRedirect = (target: unknown): string => {
  if (
    typeof target !== "string" ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("\\") ||
    target.includes("://")
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }
  return target;
};

export const landingPathFor = (target: string, role: UserRole): string =>
  role === "admin" && target === DEFAULT_AUTHENTICATED_PATH ? ADMIN_OVERVIEW_PATH : target;
