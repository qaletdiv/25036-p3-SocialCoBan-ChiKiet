import Link from "next/link";
import { UnreadBadge } from "@/components/messages/unread-badge";
import { COMING_SOON_LABEL, type NavigationItem } from "@/constants/navigation";
import { cn } from "@/lib/cn";

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  layout: "side" | "bottom";
  unreadCount?: number;
}

const LAYOUT_STYLES = {
  side: {
    base: "flex w-full items-center gap-3 rounded-xl px-4 py-4 text-base font-semibold transition-colors",
    active: "bg-white text-brand-700 shadow-md shadow-brand-600/10",
    idle: "text-zinc-600 hover:bg-white/70 hover:text-brand-700",
    disabled: "cursor-not-allowed text-zinc-400",
    icon: "size-6",
    badge: "ml-auto px-2 py-0.5 text-[10px]",
  },
  bottom: {
    base: "flex h-full flex-1 flex-col items-center justify-start gap-0.5 pt-2 text-[11px] font-medium transition-colors",
    active: "text-brand-700",
    idle: "text-zinc-500 hover:text-brand-700",
    disabled: "cursor-not-allowed text-zinc-400",
    icon: "size-6",
    badge: "px-1.5 text-[9px] leading-4",
  },
};

export function NavItem({ item, isActive, layout, unreadCount = 0 }: NavItemProps) {
  const styles = LAYOUT_STYLES[layout];
  const Icon = item.icon;

  const content = (
    <>
      <span className="relative">
        <Icon className={styles.icon} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
        {layout === "bottom" && (
          <UnreadBadge count={unreadCount} className="absolute -top-1.5 left-3.5 h-4 min-w-4 px-1 text-[10px]" />
        )}
      </span>
      <span className="whitespace-nowrap">{item.label}</span>
      {layout === "side" && <UnreadBadge count={unreadCount} className="ml-auto" />}
      {!item.enabled && (
        <span className={cn("rounded-full bg-zinc-100 font-semibold whitespace-nowrap text-zinc-500", styles.badge)}>
          {COMING_SOON_LABEL}
        </span>
      )}
    </>
  );

  if (!item.enabled) {
    return (
      <span aria-disabled="true" title={COMING_SOON_LABEL} className={cn(styles.base, styles.disabled)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(styles.base, isActive ? styles.active : styles.idle)}
    >
      {content}
    </Link>
  );
}
