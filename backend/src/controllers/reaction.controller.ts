import type { RequestHandler } from "express";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { SetReactionDto } from "@/dtos/set-reaction.dto";
import { reactionService } from "@/services/reaction.service";
import { requireUserId } from "@/utils/request-context";

export const setReaction: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { type } = req.body as SetReactionDto;
  const reactions = await reactionService.setReaction(requireUserId(req), id, type);
  res.json({ success: true, data: { reactions } });
};

export const removeReaction: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const reactions = await reactionService.removeReaction(requireUserId(req), id);
  res.json({ success: true, data: { reactions } });
};
