import { REACTIONS } from "@/constants/reactions";
import type { ReactionSummary, ReactionType } from "@/types/post";

export const applyReaction = (summary: ReactionSummary, next: ReactionType | null): ReactionSummary => {
  const counts = { ...summary.counts };
  let total = summary.total;

  if (summary.myReaction) {
    counts[summary.myReaction] -= 1;
    total -= 1;
  }
  if (next) {
    counts[next] += 1;
    total += 1;
  }
  return { total, counts, myReaction: next };
};

export const getTopReactions = (summary: ReactionSummary, limit = 3): ReactionType[] =>
  REACTIONS.map((reaction) => reaction.type)
    .filter((type) => summary.counts[type] > 0)
    .sort((first, second) => summary.counts[second] - summary.counts[first])
    .slice(0, limit);
