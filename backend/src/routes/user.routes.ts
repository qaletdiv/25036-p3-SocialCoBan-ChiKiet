import { Router } from "express";
import {
  followUser,
  getProfile,
  listFollowers,
  listFollowing,
  listProfilePosts,
  searchUsers,
  unfollowUser,
  updateProfile,
} from "@/controllers/user.controller";
import { CursorQueryDto } from "@/dtos/cursor-query.dto";
import { IdParamDto } from "@/dtos/id-param.dto";
import { ProfilePostsQueryDto } from "@/dtos/profile-posts-query.dto";
import { SearchUsersQueryDto } from "@/dtos/search-users-query.dto";
import { UpdateProfileDto } from "@/dtos/update-profile.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { createRateLimiter } from "@/middlewares/rate-limit.middleware";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";

const searchLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 60 });
const followLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 60 });
const profileUpdateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/search", searchLimiter, validateQuery(SearchUsersQueryDto), searchUsers);
userRouter.get("/:id/posts", validateParams(IdParamDto), validateQuery(ProfilePostsQueryDto), listProfilePosts);
userRouter.get("/:id/followers", validateParams(IdParamDto), validateQuery(CursorQueryDto), listFollowers);
userRouter.get("/:id/following", validateParams(IdParamDto), validateQuery(CursorQueryDto), listFollowing);
userRouter.get("/:id", validateParams(IdParamDto), getProfile);
userRouter.patch("/:id", profileUpdateLimiter, validateParams(IdParamDto), validateBody(UpdateProfileDto), updateProfile);
userRouter.put("/:id/follow", followLimiter, validateParams(IdParamDto), followUser);
userRouter.delete("/:id/follow", followLimiter, validateParams(IdParamDto), unfollowUser);
