import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(AppError.notFound("Route not found"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Malformed JSON body" },
    });
    return;
  }

  if (!env.isProduction) {
    console.error(error);
  }

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
  });
};
