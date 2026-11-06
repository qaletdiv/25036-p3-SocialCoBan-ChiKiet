export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "sensitive", label: "Nội dung phản cảm" },
  { value: "harassment", label: "Quấy rối" },
  { value: "misinformation", label: "Thông tin sai lệch" },
  { value: "other", label: "Khác" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const REPORT_DETAIL_MAX_LENGTH = 500;
