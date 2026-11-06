import type { RequestHandler } from "express";
import { AUTH_COOKIE_NAME } from "@/constants/auth.constants";
import { authService } from "@/services/auth.service";
import { AppError } from "@/utils/app-error";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== "string" || token.length === 0) {
    next(AppError.unauthorized());
    return;
  }

  try {
    req.auth = { userId: await authService.authenticate(token) };
    next();
  } catch (error) {
    next(error);
  }
};
