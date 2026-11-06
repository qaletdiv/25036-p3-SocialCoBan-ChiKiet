"use client";

import { usePathname } from "next/navigation";
import { NavItem } from "@/components/layout/nav-item";
import { useChatRealtime } from "@/components/messages/chat-provider";
import { isNavigationActive, NAVIGATION_ITEMS } from "@/constants/navigation";

interface MobileNavProps {
  userId: string;
}

export function MobileNav({ userId }: MobileNavProps) {
  const pathname = usePathname();
  const { unreadConversationCount } = useChatRealtime();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isNavigationActive(pathname, item.href, userId)}
            layout="bottom"
            unreadCount={item.href === "/messages" ? unreadConversationCount : 0}
          />
        ))}
      </div>
    </nav>
  );
}
