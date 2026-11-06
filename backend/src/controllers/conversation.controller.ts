import type { RequestHandler } from "express";
import type { ContactSearchQueryDto } from "@/dtos/contact-search-query.dto";
import type { CursorQueryDto } from "@/dtos/cursor-query.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { MessageParamDto } from "@/dtos/message-param.dto";
import type { OpenConversationDto } from "@/dtos/open-conversation.dto";
import type { SendMessageDto } from "@/dtos/send-message.dto";
import { conversationService } from "@/services/conversation.service";
import { requireUserId } from "@/utils/request-context";

export const listConversations: RequestHandler = async (req, res) => {
  const { cursor } = res.locals.query as CursorQueryDto;
  const page = await conversationService.listConversations(requireUserId(req), cursor);
  res.json({ success: true, data: page });
};

export const getUnreadCount: RequestHandler = async (req, res) => {
  const count = await conversationService.countUnreadConversations(requireUserId(req));
  res.json({ success: true, data: { count } });
};

export const searchContacts: RequestHandler = async (req, res) => {
  const { q } = res.locals.query as ContactSearchQueryDto;
  const users = await conversationService.searchContacts(requireUserId(req), q);
  res.json({ success: true, data: { users } });
};

export const openConversation: RequestHandler = async (req, res) => {
  const { userId } = req.body as OpenConversationDto;
  const conversation = await conversationService.openWithUser(requireUserId(req), userId);
  res.json({ success: true, data: { conversation } });
};

export const getConversation: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const conversation = await conversationService.getConversation(requireUserId(req), id);
  res.json({ success: true, data: { conversation } });
};

export const listMessages: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { cursor } = res.locals.query as CursorQueryDto;
  const page = await conversationService.listMessages(requireUserId(req), id, cursor);
  res.json({ success: true, data: page });
};

export const sendMessage: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { content } = req.body as SendMessageDto;
  const message = await conversationService.sendMessage(requireUserId(req), id, content);
  res.status(201).json({ success: true, data: { message } });
};

export const recallMessage: RequestHandler = async (req, res) => {
  const { id, messageId } = res.locals.params as MessageParamDto;
  const message = await conversationService.recallMessage(requireUserId(req), id, messageId);
  res.json({ success: true, data: { message } });
};

export const deleteConversation: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  await conversationService.deleteConversation(requireUserId(req), id);
  res.json({ success: true, data: { deleted: true } });
};

export const markConversationSeen: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  await conversationService.markSeen(requireUserId(req), id);
  res.json({ success: true, data: { seen: true } });
};
