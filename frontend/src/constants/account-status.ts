export const ACCOUNT_STATUSES = ["active", "unverified", "locked"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Đang hoạt động",
  unverified: "Chưa xác minh email",
  locked: "Đã khóa",
};

export const ACCOUNT_LOCKED_NOTICE_KEY = "kircle.accountLocked";

export const ACCOUNT_LOCKED_MESSAGE =
  "Tài khoản đã bị khóa. Bạn không thể đăng nhập hoặc dùng các chức năng cần tài khoản.";
