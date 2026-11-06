import type { CookieOptions } from "express";
import { env } from "@/config/env";

export const AUTH_COOKIE_NAME = "kircle_token";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProduction,
  path: "/",
};

export const PASSWORD_SALT_ROUNDS = 10;
export const EMAIL_VERIFICATION_TTL_MINUTES = 15;
export const PASSWORD_RESET_TTL_MINUTES = 15;
// Minimum gap between two reset emails for the same account, to prevent mailbox flooding
export const PASSWORD_RESET_COOLDOWN_SECONDS = 60;
export const SESSION_REVOCATION_TTL_SECONDS = 10 * 60;
