import { Router } from "express";
import { deleteComment, listReplies, updateComment } from "@/controllers/comment.controller";
import { CommentContentDto } from "@/dtos/comment-content.dto";
import { CommentListQueryDto } from "@/dtos/comment-list-query.dto";
import { IdParamDto } from "@/dtos/id-param.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { createRateLimiter } from "@/middlewares/rate-limit.middleware";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";

const modifyCommentLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 60 });

export const commentRouter = Router();

commentRouter.use(requireAuth);

commentRouter.get("/:id/replies", validateParams(IdParamDto), validateQuery(CommentListQueryDto), listReplies);
commentRouter.patch(
  "/:id",
  modifyCommentLimiter,
  validateParams(IdParamDto),
  validateBody(CommentContentDto),
  updateComment,
);
commentRouter.delete("/:id", modifyCommentLimiter, validateParams(IdParamDto), deleteComment);
