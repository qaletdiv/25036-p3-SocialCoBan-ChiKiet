import type { EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { env } from "@/config/env";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from "@/constants/username.constants";
import type { User } from "@/entities/user.entity";
import { emailVerificationTokenRepository } from "@/repositories/email-verification-token.repository";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/utils/app-error";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const AVATAR_URL_MAX_LENGTH = 500;
const FULL_NAME_MAX_LENGTH = 100;
const USERNAME_ATTEMPTS = 100;

interface GoogleIdentity {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl: string | null;
}

interface GoogleTokenResponse {
  access_token?: unknown;
}

interface GoogleUserInfoResponse {
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
  picture?: unknown;
}

const readJson = async (response: Response): Promise<unknown> => {
  if (!response.ok) return null;
  return response.json().catch(() => null);
};

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+$/.test(email)) return null;
  return email;
};

const normalizeFullName = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, FULL_NAME_MAX_LENGTH);
};

const normalizeAvatarUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url.startsWith("https://") || url.length > AVATAR_URL_MAX_LENGTH) return null;
  return url;
};

const normalizeGoogleId = (value: unknown): string | null => {
  if (typeof value !== "string" || !/^[\w.-]{1,64}$/.test(value)) return null;
  return value;
};

// Local part only: drop characters the username rule rejects, then pad a short result
const usernameBaseFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
  const padded = cleaned.length >= USERNAME_MIN_LENGTH ? cleaned : `${cleaned}user`;
  return padded.slice(0, USERNAME_MAX_LENGTH);
};

const usernameCandidate = (base: string, index: number): string | null => {
  const suffix = index === 0 ? "" : String(index);
  if (suffix.length >= USERNAME_MAX_LENGTH) return null;
  const candidate = `${base.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`;
  return USERNAME_PATTERN.test(candidate) ? candidate : null;
};

const allocateUsername = async (email: string, manager: EntityManager): Promise<string> => {
  const base = usernameBaseFromEmail(email);
  for (let index = 0; index < USERNAME_ATTEMPTS; index += 1) {
    const candidate = usernameCandidate(base, index);
    if (!candidate) continue;
    const taken = await userRepository.findByUsername(candidate, manager);
    if (!taken) return candidate;
  }
  throw AppError.googleAuthFailed();
};

const fetchIdentity = async (code: string): Promise<GoogleIdentity> => {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.redirectUri,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10000),
  });
  const tokenBody = (await readJson(tokenResponse)) as GoogleTokenResponse | null;
  const accessToken = tokenBody?.access_token;
  if (typeof accessToken !== "string" || !accessToken) throw AppError.googleAuthFailed();

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  const profile = (await readJson(profileResponse)) as GoogleUserInfoResponse | null;
  const googleId = normalizeGoogleId(profile?.sub);
  const email = normalizeEmail(profile?.email);
  if (!profile || !googleId || !email) throw AppError.googleAuthFailed();

  return {
    googleId,
    email,
    emailVerified: profile.email_verified === true || profile.email_verified === "true",
    fullName: normalizeFullName(profile.name),
    avatarUrl: normalizeAvatarUrl(profile.picture),
  };
};

const applyEmptyAvatar = async (user: User, avatarUrl: string | null, manager: EntityManager): Promise<User> => {
  if (user.avatarUrl || !avatarUrl) return user;
  await userRepository.setAvatarIfEmpty(user.id, avatarUrl, manager);
  return (await userRepository.findById(user.id, manager)) ?? user;
};

const resolveUser = async (identity: GoogleIdentity, manager: EntityManager): Promise<User> => {
  const byGoogle = await userRepository.findByGoogleId(identity.googleId, manager);
  const byEmail = await userRepository.findByEmail(identity.email, manager);

  if (byGoogle && byEmail && byGoogle.id !== byEmail.id) throw AppError.googleAccountConflict();

  const account = byGoogle ?? byEmail;
  if (account?.lockedAt) throw AppError.accountLocked();

  if (byGoogle) return applyEmptyAvatar(byGoogle, identity.avatarUrl, manager);

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== identity.googleId) throw AppError.googleAccountConflict();
    const verifyEmail = !byEmail.emailVerifiedAt;
    await userRepository.linkGoogleAccount(
      byEmail.id,
      {
        googleId: identity.googleId,
        ...(verifyEmail ? { emailVerifiedAt: new Date() } : {}),
        ...(!byEmail.avatarUrl && identity.avatarUrl ? { avatarUrl: identity.avatarUrl } : {}),
      },
      manager,
    );
    if (verifyEmail) await emailVerificationTokenRepository.deleteAllForUser(byEmail.id, manager);
    const linked = await userRepository.findById(byEmail.id, manager);
    if (!linked) throw AppError.googleAuthFailed();
    return linked;
  }

  const username = await allocateUsername(identity.email, manager);
  return userRepository.createGoogleAccount(
    {
      email: identity.email,
      username,
      fullName: identity.fullName || username,
      googleId: identity.googleId,
      avatarUrl: identity.avatarUrl,
    },
    manager,
  );
};

export const googleAuthService = {
  authorizationUrl(state: string): string {
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", env.google.clientId);
    url.searchParams.set("redirect_uri", env.google.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  },

  async authenticate(code: string): Promise<User> {
    const identity = await fetchIdentity(code);
    if (!identity.emailVerified) throw AppError.googleEmailNotVerified();
    return AppDataSource.transaction((manager) => resolveUser(identity, manager));
  },
};
