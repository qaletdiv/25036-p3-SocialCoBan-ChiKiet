import { AppDataSource } from "@/config/data-source";
import type { ReactionType } from "@/constants/reaction.constants";
import { PostReaction } from "@/entities/post-reaction.entity";

export interface ReactionCountRow {
  postId: string;
  type: ReactionType;
  count: number;
}

export const reactionRepository = AppDataSource.getRepository(PostReaction).extend({
  async setReaction(postId: string, userId: string, type: ReactionType): Promise<void> {
    await this.upsert({ postId, userId, type }, ["postId", "userId"]);
  },

  async removeReaction(postId: string, userId: string): Promise<void> {
    await this.delete({ postId, userId });
  },

  async countByPostIds(postIds: string[]): Promise<ReactionCountRow[]> {
    if (postIds.length === 0) return [];

    const rows = await this.createQueryBuilder("reaction")
      .select("reaction.postId", "postId")
      .addSelect("reaction.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("reaction.postId IN (:...postIds)", { postIds })
      .groupBy("reaction.postId")
      .addGroupBy("reaction.type")
      .getRawMany<{ postId: string; type: ReactionType; count: string }>();

    return rows.map((row) => ({ postId: String(row.postId), type: row.type, count: Number(row.count) }));
  },

  async findUserReactions(postIds: string[], userId: string): Promise<PostReaction[]> {
    if (postIds.length === 0) return [];
    return this.createQueryBuilder("reaction")
      .where("reaction.userId = :userId", { userId })
      .andWhere("reaction.postId IN (:...postIds)", { postIds })
      .getMany();
  },
});
