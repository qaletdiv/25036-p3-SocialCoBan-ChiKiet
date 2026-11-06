import { AppDataSource } from "@/config/data-source";
import { Conversation } from "@/entities/conversation.entity";

export const conversationRepository = AppDataSource.getRepository(Conversation).extend({
  findByPair(userLowId: string, userHighId: string): Promise<Conversation | null> {
    return this.findOne({ where: { userLowId, userHighId } });
  },

  async createPair(userLowId: string, userHighId: string): Promise<Conversation> {
    return this.save(this.create({ userLowId, userHighId, lastMessageId: null }));
  },

  // Conversations with at least one message the user has not deleted, most recent activity first
  findPageForUser(userId: string, limit: number, cursor?: string): Promise<Conversation[]> {
    const query = this.createQueryBuilder("conversation")
      .where(
        `((conversation.userLowId = :userId AND conversation.lastMessageId > conversation.userLowClearedMessageId)
          OR (conversation.userHighId = :userId AND conversation.lastMessageId > conversation.userHighClearedMessageId))`,
        { userId },
      )
      .orderBy("conversation.lastMessageId", "DESC")
      .limit(limit);

    if (cursor) query.andWhere("conversation.lastMessageId < :cursor", { cursor });
    return query.getMany();
  },

  async setLastMessage(id: string, lastMessageId: string): Promise<void> {
    await this.update({ id }, { lastMessageId });
  },

  // Hides every message up to clearedMessageId from one participant only
  async setClearedMessageId(conversation: Conversation, userId: string, clearedMessageId: string): Promise<void> {
    await this.update(
      { id: conversation.id },
      conversation.userLowId === userId
        ? { userLowClearedMessageId: clearedMessageId }
        : { userHighClearedMessageId: clearedMessageId },
    );
  },
});
