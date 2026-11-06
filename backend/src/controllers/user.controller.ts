import type { RequestHandler } from "express";
import type { CursorQueryDto } from "@/dtos/cursor-query.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { ProfilePostsQueryDto } from "@/dtos/profile-posts-query.dto";
import type { SearchUsersQueryDto } from "@/dtos/search-users-query.dto";
import type { UpdateProfileDto } from "@/dtos/update-profile.dto";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";
import { requireUserId } from "@/utils/request-context";

export const searchUsers: RequestHandler = async (req, res) => {
  const { q, cursor } = res.locals.query as SearchUsersQueryDto;
  const page = await userService.searchUsers(requireUserId(req), q, cursor);
  res.json({ success: true, data: page });
};

export const followUser: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const result = await userService.followUser(requireUserId(req), id);
  res.json({ success: true, data: result });
};

export const unfollowUser: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const result = await userService.unfollowUser(requireUserId(req), id);
  res.json({ success: true, data: result });
};

export const getProfile: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const profile = await userService.getProfile(requireUserId(req), id);
  res.json({ success: true, data: { profile } });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { fullName, bio, username } = req.body as UpdateProfileDto;
  const profile = await userService.updateProfile(requireUserId(req), id, { fullName, bio, username });
  res.json({ success: true, data: { profile } });
};

export const listFollowers: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { cursor } = res.locals.query as CursorQueryDto;
  const page = await userService.listFollowers(requireUserId(req), id, cursor);
  res.json({ success: true, data: page });
};

export const listFollowing: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { cursor } = res.locals.query as CursorQueryDto;
  const page = await userService.listFollowing(requireUserId(req), id, cursor);
  res.json({ success: true, data: page });
};

export const listProfilePosts: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { kind, cursor, limit } = res.locals.query as ProfilePostsQueryDto;
  const viewerId = requireUserId(req);
  await userService.assertVisible(id);
  const page = await postService.listProfilePosts(viewerId, id, kind, cursor, limit);
  res.json({ success: true, data: page });
};
