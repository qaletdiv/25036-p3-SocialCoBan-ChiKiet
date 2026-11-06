export const REACTION_TYPES = ["like", "love", "haha", "wow", "sad", "angry"] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];
