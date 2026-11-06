export const REPORT_REASONS = ["spam", "sensitive", "harassment", "misinformation", "other"] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_DETAIL_MAX_LENGTH = 500;
