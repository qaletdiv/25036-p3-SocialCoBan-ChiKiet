import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "@/config/env";
import { errorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import { authRouter } from "@/routes/auth.routes";
import { commentRouter } from "@/routes/comment.routes";
import { conversationRouter } from "@/routes/conversation.routes";
import { postRouter } from "@/routes/post.routes";
import { userRouter } from "@/routes/user.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/users", userRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/conversations", conversationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
