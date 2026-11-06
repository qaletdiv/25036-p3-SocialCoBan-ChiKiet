export const POST_PRIVACY_LEVELS = ["public", "followers", "only_me"] as const;

export type PostPrivacy = (typeof POST_PRIVACY_LEVELS)[number];
