"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NavItem } from "@/components/layout/nav-item";
import { useChatRealtime } from "@/components/messages/chat-provider";
import { isNavigationActive, NAVIGATION_ITEMS } from "@/constants/navigation";

interface SideNavProps {
  userId: string;
  onLogout: () => void;
}

export function SideNav({ userId, onLogout }: SideNavProps) {
  const pathname = usePathname();
  const { unreadConversationCount } = useChatRealtime();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex min-h-0 flex-1 flex-col"
    >
      <ul className="flex flex-col gap-3">
        {NAVIGATION_ITEMS.map((item) => (
          <li key={item.href}>
            <NavItem
              item={item}
              isActive={isNavigationActive(pathname, item.href, userId)}
              layout="side"
              unreadCount={item.href === "/messages" ? unreadConversationCount : 0}
            />
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-base font-semibold text-zinc-600 transition-colors hover:bg-white/70 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
        >
          <LogOut className="size-6" aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
