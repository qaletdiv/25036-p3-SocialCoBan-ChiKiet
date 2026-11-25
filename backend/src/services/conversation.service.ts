import { In, QueryFailedError } from "typeorm";
import {
  CONVERSATION_PAGE_SIZE,
  MESSAGE_FOCUS_BEFORE,
  MESSAGE_PAGE_SIZE,
  MESSAGE_RECALL_WINDOW_MS,
} from "@/constants/message.constants";
import { SEARCH_PAGE_SIZE } from "@/constants/search.constants";
import type { Conversation } from "@/entities/conversation.entity";
import type { Message } from "@/entities/message.entity";
import type { User } from "@/entities/user.entity";
import { realtimeGateway } from "@/realtime/realtime.gateway";
import { conversationRepository } from "@/repositories/conversation.repository";
import { messageRepository } from "@/repositories/message.repository";
import { userRepository } from "@/repositories/user.repository";
import type {
  ChatContact,
  ConversationPage,
  MessageSearchHit,
  ConversationParticipant,
  ConversationView,
  MessagePage,
  MessageView,
  TypingPayload,
} from "@/types/chat.types";
import { AppError } from "@/utils/app-error";

const isDuplicateEntryError = (error: unknown): boolean =>
  error instanceof QueryFailedError && (error.driverError as { code?: string } | undefined)?.code === "ER_DUP_ENTRY";

const toMessageView = (message: Message): MessageView => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.recalledAt ? "" : message.content,
  createdAt: message.createdAt,
  seenAt: message.seenAt,
  recalledAt: message.recalledAt,
});

const toParticipant = (user: User): ConversationParticipant => ({
  id: user.id,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
});

const otherParticipantId = (conversation: Conversation, userId: string): string =>
  conversation.userLowId === userId ? conversation.userHighId : conversation.userLowId;

// Messages up to this id were deleted by the given participant
const clearedMessageIdFor = (conversation: Conversation, userId: string): string =>
  conversation.userLowId === userId ? conversation.userLowClearedMessageId : conversation.userHighClearedMessageId;

const requireVerifiedUser = async (userId: string): Promise<User> => {
  const user = await userRepository.findById(userId);
  if (!user?.emailVerifiedAt) throw AppError.notFound("User not found");
  return user;
};

const findMemberConversation = async (userId: string, conversationId: string): Promise<Conversation | null> => {
  const conversation = await conversationRepository.findOneBy({ id: conversationId });
  const isMember = conversation && (conversation.userLowId === userId || conversation.userHighId === userId);
  return isMember ? conversation : null;
};

const requireMemberConversation = async (userId: string, conversationId: string): Promise<Conversation> => {
  const conversation = await findMemberConversation(userId, conversationId);
  if (!conversation) throw AppError.notFound("Conversation not found");
  return conversation;
};

const buildViews = async (viewerId: string, conversations: Conversation[]): Promise<ConversationView[]> => {
  if (conversations.length === 0) return [];

  const participantIds = conversations.map((conversation) => otherParticipantId(conversation, viewerId));
  const lastMessageIds = conversations.flatMap((conversation) =>
    conversation.lastMessageId ? [conversation.lastMessageId] : [],
  );
  const [users, messages, unreadCounts] = await Promise.all([
    userRepository.findBy(participantIds.map((id) => ({ id }))),
    messageRepository.findByIds(lastMessageIds),
    messageRepository.countUnreadByConversation(
      viewerId,
      conversations.map((conversation) => conversation.id),
    ),
  ]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const messagesById = new Map(messages.map((message) => [message.id, message]));

  return conversations.flatMap((conversation) => {
    const participant = usersById.get(otherParticipantId(conversation, viewerId));
    if (!participant) return [];

    const lastMessage = conversation.lastMessageId ? messagesById.get(conversation.lastMessageId) : undefined;
    const isLastMessageVisible =
      lastMessage !== undefined && BigInt(lastMessage.id) > BigInt(clearedMessageIdFor(conversation, viewerId));

    return [
      {
        id: conversation.id,
        participant: toParticipant(participant),
        lastMessage: lastMessage && isLastMessageVisible ? toMessageView(lastMessage) : null,
        unreadCount: unreadCounts.get(conversation.id) ?? 0,
      },
    ];
  });
};

const buildView = async (viewerId: string, conversation: Conversation): Promise<ConversationView> => {
  const [view] = await buildViews(viewerId, [conversation]);
  if (!view) throw AppError.notFound("Conversation not found");
  return view;
};

export const conversationService = {
  async listConversations(userId: string, cursor?: string): Promise<ConversationPage> {
    const rows = await conversationRepository.findPageForUser(userId, CONVERSATION_PAGE_SIZE + 1, cursor);
    const hasMore = rows.length > CONVERSATION_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, CONVERSATION_PAGE_SIZE) : rows;
    const last = page[page.length - 1];

    return {
      conversations: await buildViews(userId, page),
      nextCursor: hasMore && last?.lastMessageId ? last.lastMessageId : null,
    };
  },

  async countUnreadConversations(userId: string): Promise<number> {
    return messageRepository.countUnreadConversations(userId);
  },

  async searchContacts(userId: string, term: string): Promise<ChatContact[]> {
    const users = await userRepository.searchChatContactsByName(userId, term, SEARCH_PAGE_SIZE);
    return users.map(toParticipant);
  },

  async searchMessages(userId: string, term: string): Promise<MessageSearchHit[]> {
    const messages = await messageRepository.searchLatestVisibleByContent(userId, term, SEARCH_PAGE_SIZE);
    if (messages.length === 0) return [];

    const conversationIds = [...new Set(messages.map((message) => message.conversationId))];
    const conversations = await conversationRepository.find({ where: { id: In(conversationIds) } });
    const conversationsById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
    const participantIds = [
      ...new Set(conversations.map((conversation) => otherParticipantId(conversation, userId))),
    ];
    const participants = await userRepository.find({ where: { id: In(participantIds) } });
    const participantsById = new Map(participants.map((participant) => [participant.id, participant]));

    return messages.flatMap((message) => {
      const conversation = conversationsById.get(message.conversationId);
      const participant = conversation ? participantsById.get(otherParticipantId(conversation, userId)) : undefined;
      if (!conversation || !participant) return [];
      return [
        {
          conversationId: conversation.id,
          participant: toParticipant(participant),
          message: {
            id: message.id,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt,
          },
        },
      ];
    });
  },

  async getConversation(userId: string, conversationId: string): Promise<ConversationView> {
    return buildView(userId, await requireMemberConversation(userId, conversationId));
  },

  // Returns the existing conversation for the pair, or creates an empty one that stays hidden until a message is sent
  async openWithUser(userId: string, targetId: string): Promise<ConversationView> {
    if (userId === targetId) throw AppError.cannotMessageSelf();
    await requireVerifiedUser(targetId);

    const [userLowId, userHighId] = BigInt(userId) < BigInt(targetId) ? [userId, targetId] : [targetId, userId];
    let conversation = await conversationRepository.findByPair(userLowId, userHighId);

    if (!conversation) {
      try {
        conversation = await conversationRepository.createPair(userLowId, userHighId);
      } catch (error) {
        if (!isDuplicateEntryError(error)) throw error;
        conversation = await conversationRepository.findByPair(userLowId, userHighId);
      }
    }
    if (!conversation) throw AppError.notFound("Conversation not found");

    return buildView(userId, conversation);
  },

  async listMessages(
    userId: string,
    conversationId: string,
    query: { cursor?: string; after?: string; focus?: string } = {},
  ): Promise<MessagePage> {
    const conversation = await requireMemberConversation(userId, conversationId);
    const clearedMessageId = clearedMessageIdFor(conversation, userId);

    if (query.after) return this.listNewerMessages(conversationId, clearedMessageId, query.after);
    if (query.focus && !query.cursor) {
      const around = await this.listMessagesAround(conversationId, clearedMessageId, query.focus);
      if (around) return around;
    }

    const rows = await messageRepository.findPage(conversationId, clearedMessageId, MESSAGE_PAGE_SIZE + 1, query.cursor);
    const hasMore = rows.length > MESSAGE_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;
    const oldest = page[page.length - 1];

    return {
      messages: page.map(toMessageView).reverse(),
      nextCursor: hasMore && oldest ? oldest.id : null,
      newerCursor: null,
    };
  },

  async listNewerMessages(conversationId: string, clearedMessageId: string, afterId: string): Promise<MessagePage> {
    const rows = await messageRepository.findFromId(conversationId, clearedMessageId, afterId, MESSAGE_PAGE_SIZE + 1, true);
    const hasMore = rows.length > MESSAGE_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;
    const newest = page[page.length - 1];

    return {
      messages: page.map(toMessageView),
      nextCursor: null,
      newerCursor: hasMore && newest ? newest.id : null,
    };
  },

  // A window around the focused message. Falls back when that message is no longer visible.
  async listMessagesAround(conversationId: string, clearedMessageId: string, focusId: string): Promise<MessagePage | null> {
    if (BigInt(focusId) <= BigInt(clearedMessageId)) return null;

    const beforeRows = await messageRepository.findPage(
      conversationId,
      clearedMessageId,
      MESSAGE_FOCUS_BEFORE + 1,
      focusId,
    );
    const hasOlder = beforeRows.length > MESSAGE_FOCUS_BEFORE;
    const before = (hasOlder ? beforeRows.slice(0, MESSAGE_FOCUS_BEFORE) : beforeRows).slice().reverse();

    const afterRows = await messageRepository.findFromId(
      conversationId,
      clearedMessageId,
      focusId,
      MESSAGE_PAGE_SIZE + 1,
      false,
    );
    if (!afterRows.some((message) => message.id === focusId)) return null;

    const hasNewer = afterRows.length > MESSAGE_PAGE_SIZE;
    const after = hasNewer ? afterRows.slice(0, MESSAGE_PAGE_SIZE) : afterRows;
    const messages = [...before, ...after];
    const oldest = messages[0];
    const newest = messages[messages.length - 1];

    return {
      messages: messages.map(toMessageView),
      nextCursor: hasOlder && oldest ? oldest.id : null,
      newerCursor: hasNewer && newest ? newest.id : null,
    };
  },

  async sendMessage(userId: string, conversationId: string, content: string): Promise<MessageView> {
    const conversation = await requireMemberConversation(userId, conversationId);
    const recipientId = otherParticipantId(conversation, userId);
    await requireVerifiedUser(recipientId);

    const message = await messageRepository.createMessage({ conversationId, senderId: userId, content });
    await conversationRepository.setLastMessage(conversationId, message.id);
    conversation.lastMessageId = message.id;

    const [recipientView, senderView] = await Promise.all([
      buildView(recipientId, conversation),
      buildView(userId, conversation),
    ]);
    realtimeGateway.emitToUser(recipientId, "message:new", { conversation: recipientView });
    realtimeGateway.emitToUser(userId, "message:new", { conversation: senderView });

    return toMessageView(message);
  },

  // Marks the other participant's messages as seen and tells both sides in realtime
  async markSeen(userId: string, conversationId: string): Promise<void> {
    const conversation = await requireMemberConversation(userId, conversationId);
    const seenAt = new Date();
    const updated = await messageRepository.markSeen(conversationId, userId, seenAt);
    if (updated > 0) {
      realtimeGateway.emitToUser(otherParticipantId(conversation, userId), "message:seen", { conversationId, seenAt });
      realtimeGateway.emitToUser(userId, "conversation:read", { conversationId });
    }
  },

  // Own messages only, within the recall window; the content is removed for both participants
  async recallMessage(userId: string, conversationId: string, messageId: string): Promise<MessageView> {
    const conversation = await requireMemberConversation(userId, conversationId);
    const message = await messageRepository.findOneBy({ id: messageId, conversationId });
    if (!message) throw AppError.notFound("Message not found");
    if (message.senderId !== userId) throw AppError.forbidden("You can only recall your own messages");
    if (message.recalledAt) return toMessageView(message);
    if (Date.now() - message.createdAt.getTime() > MESSAGE_RECALL_WINDOW_MS) throw AppError.messageRecallExpired();

    const recalledAt = new Date();
    await messageRepository.markRecalled(message.id, recalledAt);
    message.content = "";
    message.recalledAt = recalledAt;

    const recipientId = otherParticipantId(conversation, userId);
    const [recipientView, senderView] = await Promise.all([
      buildView(recipientId, conversation),
      buildView(userId, conversation),
    ]);
    realtimeGateway.emitToUser(recipientId, "message:recalled", {
      conversation: recipientView,
      messageId: message.id,
      recalledAt,
    });
    realtimeGateway.emitToUser(userId, "message:recalled", {
      conversation: senderView,
      messageId: message.id,
      recalledAt,
    });

    return toMessageView(message);
  },

  // Deletes the conversation for this user only; the other participant keeps the full history
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await requireMemberConversation(userId, conversationId);
    if (conversation.lastMessageId) {
      await conversationRepository.setClearedMessageId(conversation, userId, conversation.lastMessageId);
    }
    realtimeGateway.emitToUser(userId, "conversation:deleted", { conversationId });
  },

  async relayTyping(userId: string, { conversationId, isTyping }: TypingPayload): Promise<void> {
    const conversation = await findMemberConversation(userId, conversationId);
    if (!conversation) return;
    realtimeGateway.emitToUser(otherParticipantId(conversation, userId), "typing", { conversationId, isTyping });
  },
};
