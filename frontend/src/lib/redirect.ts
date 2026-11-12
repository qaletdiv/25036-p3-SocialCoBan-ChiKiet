import type { UserRole } from "@/types/auth";

export const DEFAULT_AUTHENTICATED_PATH = "/newsfeed";
export const ADMIN_OVERVIEW_PATH = "/admin";
export const LOGIN_PATH = "/login";

// Admins land on the admin overview unless a specific page was requested
export const landingPathFor = (target: string, role?: UserRole): string =>
  role === "admin" && target === DEFAULT_AUTHENTICATED_PATH ? ADMIN_OVERVIEW_PATH : target;

// Only same-origin relative paths are allowed to prevent open redirects
export const resolveSafeRedirect = (target: string | null): string => {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }
  return target;
};

export const buildLoginUrl = (returnTo: string): string =>
  `${LOGIN_PATH}?redirect=${encodeURIComponent(returnTo)}`;
