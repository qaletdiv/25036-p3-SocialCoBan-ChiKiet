import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import {
  AUTH_COOKIE_NAME,
  GOOGLE_OAUTH_COOKIE_NAME,
  GOOGLE_OAUTH_COOKIE_PATH,
  GOOGLE_OAUTH_TTL_SECONDS,
  authCookieOptions,
} from "@/constants/auth.constants";
import { env } from "@/config/env";
import type { LoginDto } from "@/dtos/login.dto";
import type { RegisterDto } from "@/dtos/register.dto";
import type { ForgotPasswordDto } from "@/dtos/forgot-password.dto";
import type { ResetPasswordDto } from "@/dtos/reset-password.dto";
import type { TokenDto } from "@/dtos/token.dto";
import { authService } from "@/services/auth.service";
import { googleAuthService } from "@/services/google-auth.service";
import { passwordResetService } from "@/services/password-reset.service";
import { AppError } from "@/utils/app-error";
import { signAccessToken, signGoogleOAuthState, verifyGoogleOAuthState } from "@/utils/jwt";
import { generateToken } from "@/utils/token";
import { landingPathFor, resolveSafeRedirect } from "@/utils/redirect";

export const login: RequestHandler = async (req, res) => {
  const { user, accessToken } = await authService.login(req.body as LoginDto);

  res.cookie(AUTH_COOKIE_NAME, accessToken, {
    ...authCookieOptions,
    maxAge: env.jwt.expiresInSeconds * 1000,
  });
  res.json({ success: true, data: { user } });
};

export const register: RequestHandler = async (req, res) => {
  const dto = req.body as RegisterDto;
  await authService.register(dto);
  res.status(201).json({ success: true, data: { email: dto.email } });
};

export const resendVerificationEmail: RequestHandler = async (req, res) => {
  await authService.resendVerificationEmail(req.body as LoginDto);
  res.json({ success: true, data: null });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  await authService.verifyEmail((req.body as TokenDto).token);
  res.json({ success: true, data: null });
};

export const forgotPassword: RequestHandler = (req, res) => {
  // Intentionally not awaited: see passwordResetService.requestReset
  void passwordResetService.requestReset((req.body as ForgotPasswordDto).email);
  res.json({ success: true, data: null });
};

export const validateResetToken: RequestHandler = async (req, res) => {
  await passwordResetService.validateToken((req.body as TokenDto).token);
  res.json({ success: true, data: null });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const sessionRevocationToken = await passwordResetService.resetPassword(req.body as ResetPasswordDto);
  res.json({ success: true, data: { sessionRevocationToken } });
};

export const revokeSessions: RequestHandler = async (req, res) => {
  await passwordResetService.revokeSessions((req.body as TokenDto).token);
  res.json({ success: true, data: null });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.json({ success: true, data: null });
};

const googleOauthCookieOptions = {
  ...authCookieOptions,
  maxAge: GOOGLE_OAUTH_TTL_SECONDS * 1000,
  path: GOOGLE_OAUTH_COOKIE_PATH,
};

const sameSecret = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const googleLoginErrorUrl = (code: string, redirectTo: string): string => {
  const params = new URLSearchParams({ google_error: code, redirect: redirectTo });
  return `${env.clientOrigin}/login?${params.toString()}`;
};

const publicGoogleErrorCode = (error: unknown): string => {
  if (!(error instanceof AppError)) return "GOOGLE_AUTH_FAILED";
  if (error.code === "ACCOUNT_LOCKED" || error.code === "GOOGLE_EMAIL_NOT_VERIFIED" || error.code === "GOOGLE_ACCOUNT_CONFLICT") {
    return error.code;
  }
  return "GOOGLE_AUTH_FAILED";
};

export const startGoogleLogin: RequestHandler = (req, res) => {
  const redirectTo = resolveSafeRedirect(req.query.redirect);
  const state = generateToken();
  res.cookie(GOOGLE_OAUTH_COOKIE_NAME, signGoogleOAuthState(state, redirectTo), googleOauthCookieOptions);
  res.redirect(googleAuthService.authorizationUrl(state));
};

export const googleCallback: RequestHandler = async (req, res) => {
  const rawCookie = req.cookies?.[GOOGLE_OAUTH_COOKIE_NAME];
  res.clearCookie(GOOGLE_OAUTH_COOKIE_NAME, googleOauthCookieOptions);

  let redirectTo = resolveSafeRedirect(null);
  try {
    if (typeof rawCookie !== "string") throw AppError.googleAuthFailed();
    const payload = verifyGoogleOAuthState(rawCookie);
    redirectTo = resolveSafeRedirect(payload.redirectTo);
    const queryState = typeof req.query.state === "string" ? req.query.state : "";
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code || !queryState || !sameSecret(queryState, payload.state) || typeof req.query.error === "string") {
      throw AppError.googleAuthFailed();
    }

    const user = await googleAuthService.authenticate(code);
    res.cookie(AUTH_COOKIE_NAME, signAccessToken(user.id), {
      ...authCookieOptions,
      maxAge: env.jwt.expiresInSeconds * 1000,
    });
    res.redirect(`${env.clientOrigin}${landingPathFor(redirectTo, user.role)}`);
  } catch (error) {
    res.redirect(googleLoginErrorUrl(publicGoogleErrorCode(error), redirectTo));
  }
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  if (!req.auth) throw AppError.unauthorized();

  const user = await authService.getCurrentUser(req.auth.userId);
  res.json({ success: true, data: { user } });
};
