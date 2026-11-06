import type { RequestHandler } from "express";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/constants/auth.constants";
import { env } from "@/config/env";
import type { LoginDto } from "@/dtos/login.dto";
import type { RegisterDto } from "@/dtos/register.dto";
import type { ForgotPasswordDto } from "@/dtos/forgot-password.dto";
import type { ResetPasswordDto } from "@/dtos/reset-password.dto";
import type { TokenDto } from "@/dtos/token.dto";
import { authService } from "@/services/auth.service";
import { passwordResetService } from "@/services/password-reset.service";
import { AppError } from "@/utils/app-error";

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

export const getCurrentUser: RequestHandler = async (req, res) => {
  if (!req.auth) throw AppError.unauthorized();

  const user = await authService.getCurrentUser(req.auth.userId);
  res.json({ success: true, data: { user } });
};
