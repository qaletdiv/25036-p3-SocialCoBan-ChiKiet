const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const absoluteFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const fullFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatRelativeTime = (isoDate: string, now: number = Date.now()): string => {
  const date = new Date(isoDate);
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (seconds < MINUTE) return "Vừa xong";
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} phút trước`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} giờ trước`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)} ngày trước`;
  return absoluteFormatter.format(date);
};

export const formatFullDate = (isoDate: string): string => fullFormatter.format(new Date(isoDate));

const clockFormatter = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

export const formatClockTime = (isoDate: string): string => clockFormatter.format(new Date(isoDate));

export const getDayKey = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const formatDayLabel = (isoDate: string, now: Date = new Date()): string => {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (getDayKey(isoDate) === getDayKey(now.toISOString())) return "Hôm nay";
  if (getDayKey(isoDate) === getDayKey(yesterday.toISOString())) return "Hôm qua";
  return absoluteFormatter.format(new Date(isoDate));
};

const joinFormatter = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" });

export const formatJoinDate = (isoDate: string): string => joinFormatter.format(new Date(isoDate));
