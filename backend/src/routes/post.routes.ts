import { Router } from "express";
import { createComment, listComments } from "@/controllers/comment.controller";
import { createPost, deletePost, getFeed, sharePost, updatePost, updatePostPrivacy } from "@/controllers/post.controller";
import { reportPost } from "@/controllers/report.controller";
import { removeReaction, setReaction } from "@/controllers/reaction.controller";
import { CommentListQueryDto } from "@/dtos/comment-list-query.dto";
import { CreateCommentDto } from "@/dtos/create-comment.dto";
import { FeedQueryDto } from "@/dtos/feed-query.dto";
import { IdParamDto } from "@/dtos/id-param.dto";
import { PostContentDto } from "@/dtos/post-content.dto";
import { PostPrivacyDto } from "@/dtos/post-privacy.dto";
import { ReportPostDto } from "@/dtos/report-post.dto";
import { SetReactionDto } from "@/dtos/set-reaction.dto";
import { SharePostDto } from "@/dtos/share-post.dto";
import { UpdatePostDto } from "@/dtos/update-post.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { createRateLimiter } from "@/middlewares/rate-limit.middleware";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";

const createPostLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });
const modifyPostLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 60 });
const reactionLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 200 });
const createCommentLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 60 });
const shareLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });
const reportLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 30 });

export const postRouter = Router();

postRouter.use(requireAuth);

postRouter.get("/feed", validateQuery(FeedQueryDto), getFeed);
postRouter.post("/", createPostLimiter, validateBody(PostContentDto), createPost);
postRouter.patch("/:id/privacy", modifyPostLimiter, validateParams(IdParamDto), validateBody(PostPrivacyDto), updatePostPrivacy);
postRouter.patch("/:id", modifyPostLimiter, validateParams(IdParamDto), validateBody(UpdatePostDto), updatePost);
postRouter.delete("/:id", modifyPostLimiter, validateParams(IdParamDto), deletePost);
postRouter.post("/:id/share", shareLimiter, validateParams(IdParamDto), validateBody(SharePostDto), sharePost);
postRouter.post("/:id/report", reportLimiter, validateParams(IdParamDto), validateBody(ReportPostDto), reportPost);

postRouter.put("/:id/reaction", reactionLimiter, validateParams(IdParamDto), validateBody(SetReactionDto), setReaction);
postRouter.delete("/:id/reaction", reactionLimiter, validateParams(IdParamDto), removeReaction);

postRouter.get("/:id/comments", validateParams(IdParamDto), validateQuery(CommentListQueryDto), listComments);
postRouter.post(
  "/:id/comments",
  createCommentLimiter,
  validateParams(IdParamDto),
  validateBody(CreateCommentDto),
  createComment,
);
