"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { UserMenu } from "@/components/layout/user-menu";
import type { AuthUser } from "@/types/auth";

interface AppHeaderProps {
  user: AuthUser;
  onLogout: () => void;
  searchQuery?: string;
}

export function AppHeader({ user, onLogout, searchQuery = "" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/newsfeed" aria-label="Kircle - Bảng tin" className="shrink-0">
          <BrandLogo />
        </Link>
        <div className="flex flex-1 items-center justify-end md:justify-start md:pl-2 lg:pl-6">
          <HeaderSearch key={searchQuery} defaultQuery={searchQuery} />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationMenu />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
