export const ACCOUNT_STATUSES = ["active", "unverified", "locked"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
