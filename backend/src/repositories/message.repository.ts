import { In } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { Conversation } from "@/entities/conversation.entity";
import { Message } from "@/entities/message.entity";

interface NewMessageData {
  conversationId: string;
  senderId: string;
  content: string;
}

// Excludes messages the viewer already deleted from their side of the conversation
const UNREAD_CLEARED_CONDITION =
  "message.id > IF(conversation.userLowId = :viewerId, conversation.userLowClearedMessageId, conversation.userHighClearedMessageId)";

export const messageRepository = AppDataSource.getRepository(Message).extend({
  createMessage(data: NewMessageData): Promise<Message> {
    return this.save(this.create({ ...data, seenAt: null, recalledAt: null }));
  },

  async findByIds(ids: string[]): Promise<Message[]> {
    if (ids.length === 0) return [];
    return this.find({ where: { id: In(ids) } });
  },

  // Newest first, callers reverse the page for display
  findPage(conversationId: string, clearedMessageId: string, limit: number, cursor?: string): Promise<Message[]> {
    const query = this.createQueryBuilder("message")
      .where("message.conversationId = :conversationId", { conversationId })
      .andWhere("message.id > :clearedMessageId", { clearedMessageId })
      .orderBy("message.id", "DESC")
      .limit(limit);

    if (cursor) query.andWhere("message.id < :cursor", { cursor });
    return query.getMany();
  },

  async markSeen(conversationId: string, recipientId: string, seenAt: Date): Promise<number> {
    const result = await this.createQueryBuilder()
      .update(Message)
      .set({ seenAt })
      .where("conversation_id = :conversationId", { conversationId })
      .andWhere("sender_id <> :recipientId", { recipientId })
      .andWhere("seen_at IS NULL")
      .execute();
    return result.affected ?? 0;
  },

  // The text is emptied so a recalled message cannot be read from the database or API afterwards
  async markRecalled(id: string, recalledAt: Date): Promise<void> {
    await this.update({ id }, { content: "", recalledAt });
  },

  async countUnreadByConversation(viewerId: string, conversationIds: string[]): Promise<Map<string, number>> {
    if (conversationIds.length === 0) return new Map();

    const rows = await this.createQueryBuilder("message")
      .innerJoin(Conversation, "conversation", "conversation.id = message.conversationId")
      .select("message.conversationId", "conversationId")
      .addSelect("COUNT(*)", "count")
      .where("message.conversationId IN (:...conversationIds)", { conversationIds })
      .andWhere("message.senderId <> :viewerId", { viewerId })
      .andWhere("message.seenAt IS NULL")
      .andWhere("message.recalledAt IS NULL")
      .andWhere(UNREAD_CLEARED_CONDITION)
      .groupBy("message.conversationId")
      .getRawMany<{ conversationId: string; count: string }>();

    return new Map(rows.map((row) => [String(row.conversationId), Number(row.count)]));
  },

  async countUnreadConversations(viewerId: string): Promise<number> {
    const row = await this.createQueryBuilder("message")
      .innerJoin(Conversation, "conversation", "conversation.id = message.conversationId")
      .select("COUNT(DISTINCT message.conversationId)", "count")
      .where("(conversation.userLowId = :viewerId OR conversation.userHighId = :viewerId)", { viewerId })
      .andWhere("message.senderId <> :viewerId")
      .andWhere("message.seenAt IS NULL")
      .andWhere("message.recalledAt IS NULL")
      .andWhere(UNREAD_CLEARED_CONDITION)
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  },
});
