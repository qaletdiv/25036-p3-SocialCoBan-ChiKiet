import rateLimit from "express-rate-limit";

interface RateLimiterOptions {
  windowMs: number;
  limit: number;
}

export const createRateLimiter = ({ windowMs, limit }: RateLimiterOptions) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please try again later" },
      });
    },
  });
