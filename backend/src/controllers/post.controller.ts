import type { RequestHandler } from "express";
import type { FeedQueryDto } from "@/dtos/feed-query.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { PostContentDto } from "@/dtos/post-content.dto";
import type { PostPrivacyDto } from "@/dtos/post-privacy.dto";
import type { SharePostDto } from "@/dtos/share-post.dto";
import type { UpdatePostDto } from "@/dtos/update-post.dto";
import { postService } from "@/services/post.service";
import { requireUserId } from "@/utils/request-context";

export const getFeed: RequestHandler = async (req, res) => {
  const { cursor, limit } = res.locals.query as FeedQueryDto;
  const feed = await postService.getFeed(requireUserId(req), cursor, limit);
  res.json({ success: true, data: feed });
};

export const createPost: RequestHandler = async (req, res) => {
  const { content, privacy } = req.body as PostContentDto;
  const post = await postService.createPost(requireUserId(req), content, privacy);
  res.status(201).json({ success: true, data: { post } });
};

export const updatePost: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { content } = req.body as UpdatePostDto;
  const post = await postService.updatePost(requireUserId(req), id, content);
  res.json({ success: true, data: { post } });
};

export const updatePostPrivacy: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { privacy } = req.body as PostPrivacyDto;
  const post = await postService.updatePrivacy(requireUserId(req), id, privacy);
  res.json({ success: true, data: { post } });
};

export const deletePost: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  await postService.deletePost(requireUserId(req), id);
  res.json({ success: true, data: null });
};

export const sharePost: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { content, privacy } = req.body as SharePostDto;
  const result = await postService.sharePost(requireUserId(req), id, content ?? "", privacy ?? "public");
  res.status(result.created ? 201 : 200).json({ success: true, data: result });
};
