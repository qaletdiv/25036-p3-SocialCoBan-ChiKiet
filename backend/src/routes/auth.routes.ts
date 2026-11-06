import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
  revokeSessions,
  validateResetToken,
  verifyEmail,
} from "@/controllers/auth.controller";
import { ForgotPasswordDto } from "@/dtos/forgot-password.dto";
import { LoginDto } from "@/dtos/login.dto";
import { RegisterDto } from "@/dtos/register.dto";
import { ResetPasswordDto } from "@/dtos/reset-password.dto";
import { TokenDto } from "@/dtos/token.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { createRateLimiter } from "@/middlewares/rate-limit.middleware";
import { validateBody } from "@/middlewares/validate.middleware";

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 20 });
const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 10 });
const verifyEmailLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });
const resendVerificationLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5 });
const forgotPasswordLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 10 });
const resetPasswordLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validateBody(LoginDto), login);
authRouter.post("/register", registerLimiter, validateBody(RegisterDto), register);
authRouter.post(
  "/resend-verification",
  resendVerificationLimiter,
  validateBody(LoginDto),
  resendVerificationEmail,
);
authRouter.post("/verify-email", verifyEmailLimiter, validateBody(TokenDto), verifyEmail);
authRouter.post("/forgot-password", forgotPasswordLimiter, validateBody(ForgotPasswordDto), forgotPassword);
authRouter.post("/reset-password/validate", resetPasswordLimiter, validateBody(TokenDto), validateResetToken);
authRouter.post("/reset-password", resetPasswordLimiter, validateBody(ResetPasswordDto), resetPassword);
authRouter.post("/revoke-sessions", resetPasswordLimiter, validateBody(TokenDto), revokeSessions);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, getCurrentUser);
