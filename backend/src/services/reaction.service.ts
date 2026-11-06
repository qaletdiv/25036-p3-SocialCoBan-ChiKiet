import { REACTION_TYPES, type ReactionType } from "@/constants/reaction.constants";
import { reactionRepository } from "@/repositories/reaction.repository";
import { postAccessService } from "@/services/post-access.service";

export interface ReactionSummary {
  total: number;
  counts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
}

const createEmptySummary = (): ReactionSummary => ({
  total: 0,
  counts: Object.fromEntries(REACTION_TYPES.map((type) => [type, 0])) as Record<ReactionType, number>,
  myReaction: null,
});

export const reactionService = {
  async summarize(postIds: string[], userId: string): Promise<Map<string, ReactionSummary>> {
    const summaries = new Map(postIds.map((postId) => [postId, createEmptySummary()]));
    const [counts, mine] = await Promise.all([
      reactionRepository.countByPostIds(postIds),
      reactionRepository.findUserReactions(postIds, userId),
    ]);

    for (const row of counts) {
      const summary = summaries.get(row.postId);
      if (!summary) continue;
      summary.counts[row.type] = row.count;
      summary.total += row.count;
    }
    for (const reaction of mine) {
      const summary = summaries.get(reaction.postId);
      if (summary) summary.myReaction = reaction.type;
    }
    return summaries;
  },

  async summarizeOne(postId: string, userId: string): Promise<ReactionSummary> {
    return (await this.summarize([postId], userId)).get(postId) ?? createEmptySummary();
  },

  async setReaction(userId: string, postId: string, type: ReactionType): Promise<ReactionSummary> {
    await postAccessService.ensureCanView(userId, postId);
    await reactionRepository.setReaction(postId, userId, type);
    return this.summarizeOne(postId, userId);
  },

  async removeReaction(userId: string, postId: string): Promise<ReactionSummary> {
    await postAccessService.ensureCanView(userId, postId);
    await reactionRepository.removeReaction(postId, userId);
    return this.summarizeOne(postId, userId);
  },
};
