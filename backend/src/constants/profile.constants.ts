export const PROFILE_NAME_MAX_LENGTH = 100;
export const PROFILE_BIO_MAX_LENGTH = 160;
export const PROFILE_POST_KINDS = ["authored", "shared"] as const;

export type ProfilePostKind = (typeof PROFILE_POST_KINDS)[number];
