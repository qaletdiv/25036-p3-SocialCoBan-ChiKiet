import type { RequestHandler } from "express";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/utils/app-error";
import { requireUserId } from "@/utils/request-context";

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  try {
    const user = await userRepository.findById(requireUserId(req));
    if (!user || user.role !== "admin") {
      next(AppError.forbidden("Admin access is required"));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
