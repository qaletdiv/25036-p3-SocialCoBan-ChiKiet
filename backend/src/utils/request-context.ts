import type { Request } from "express";
import { AppError } from "@/utils/app-error";

export const requireUserId = (req: Request): string => {
  if (!req.auth) throw AppError.unauthorized();
  return req.auth.userId;
};
