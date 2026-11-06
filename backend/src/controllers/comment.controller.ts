import type { RequestHandler } from "express";
import type { CommentContentDto } from "@/dtos/comment-content.dto";
import type { CommentListQueryDto } from "@/dtos/comment-list-query.dto";
import type { CreateCommentDto } from "@/dtos/create-comment.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import { commentService } from "@/services/comment.service";
import { requireUserId } from "@/utils/request-context";

export const listComments: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { cursor, limit } = res.locals.query as CommentListQueryDto;
  const page = await commentService.listComments(requireUserId(req), id, cursor, limit);
  res.json({ success: true, data: page });
};

export const listReplies: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { cursor, limit } = res.locals.query as CommentListQueryDto;
  const page = await commentService.listReplies(requireUserId(req), id, cursor, limit);
  res.json({ success: true, data: page });
};

export const createComment: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { content, parentId } = req.body as CreateCommentDto;
  const result = await commentService.createComment(requireUserId(req), id, { content, parentId });
  res.status(201).json({ success: true, data: result });
};

export const updateComment: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { content } = req.body as CommentContentDto;
  const comment = await commentService.updateComment(requireUserId(req), id, content);
  res.json({ success: true, data: { comment } });
};

export const deleteComment: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const result = await commentService.deleteComment(requireUserId(req), id);
  res.json({ success: true, data: result });
};
