import { Router } from "express";
import {
  deleteConversation,
  getConversation,
  getUnreadCount,
  listConversations,
  listMessages,
  markConversationSeen,
  openConversation,
  recallMessage,
  searchContacts,
  sendMessage,
} from "@/controllers/conversation.controller";
import { ContactSearchQueryDto } from "@/dtos/contact-search-query.dto";
import { CursorQueryDto } from "@/dtos/cursor-query.dto";
import { IdParamDto } from "@/dtos/id-param.dto";
import { MessageParamDto } from "@/dtos/message-param.dto";
import { OpenConversationDto } from "@/dtos/open-conversation.dto";
import { SendMessageDto } from "@/dtos/send-message.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { createRateLimiter } from "@/middlewares/rate-limit.middleware";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";

const searchLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 60 });
const openLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 30 });
const sendLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 60 });
const unreadLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 120 });
const modifyLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 30 });

export const conversationRouter = Router();

conversationRouter.use(requireAuth);

conversationRouter.get("/", validateQuery(CursorQueryDto), listConversations);
conversationRouter.get("/unread-count", unreadLimiter, getUnreadCount);
conversationRouter.get("/search", searchLimiter, validateQuery(ContactSearchQueryDto), searchContacts);
conversationRouter.post("/", openLimiter, validateBody(OpenConversationDto), openConversation);
conversationRouter.get("/:id", validateParams(IdParamDto), getConversation);
conversationRouter.delete("/:id", modifyLimiter, validateParams(IdParamDto), deleteConversation);
conversationRouter.get("/:id/messages", validateParams(IdParamDto), validateQuery(CursorQueryDto), listMessages);
conversationRouter.post("/:id/messages", sendLimiter, validateParams(IdParamDto), validateBody(SendMessageDto), sendMessage);
conversationRouter.post("/:id/messages/:messageId/recall", modifyLimiter, validateParams(MessageParamDto), recallMessage);
conversationRouter.put("/:id/seen", validateParams(IdParamDto), markConversationSeen);
