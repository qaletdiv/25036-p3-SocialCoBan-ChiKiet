export const REPORT_REASONS = ["spam", "sensitive", "harassment", "misinformation", "other"] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_DETAIL_MAX_LENGTH = 500;

export const REPORT_TARGET_TYPES = ["post", "comment"] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUSES = ["pending", "approved", "removed"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_HANDLE_ACTIONS = ["approve", "remove", "close"] as const;

export type ReportHandleAction = (typeof REPORT_HANDLE_ACTIONS)[number];

// closed means the content was already deleted before an admin handled the report
export const REPORT_DECISIONS = ["approved", "removed", "closed"] as const;

export type ReportDecision = (typeof REPORT_DECISIONS)[number];

export const REPORT_NOTE_MAX_LENGTH = 500;
