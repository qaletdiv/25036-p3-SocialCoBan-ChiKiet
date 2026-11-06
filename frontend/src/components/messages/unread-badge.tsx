import { UNREAD_BADGE_MAX } from "@/constants/message";
import { cn } from "@/lib/cn";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const label = count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : String(count);

  return (
    <span
      role="status"
      aria-label={`${label} chưa đọc`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] leading-none font-bold text-white tabular-nums",
        className,
      )}
    >
      {label}
    </span>
  );
}
