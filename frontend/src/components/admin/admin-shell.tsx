"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { PageBackdrop } from "@/components/common/page-backdrop";
import { NavItem } from "@/components/layout/nav-item";
import { UserMenu } from "@/components/layout/user-menu";
import { ADMIN_NAVIGATION_ITEMS, isAdminNavigationActive } from "@/constants/admin-navigation";
import type { AuthUser } from "@/types/auth";

interface AdminShellProps {
  user: AuthUser;
  onLogout: () => void;
  children: ReactNode;
}

export function AdminShell({ user, onLogout, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <PageBackdrop />
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-360 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" aria-label="Kircle - Quản trị" className="shrink-0">
            <BrandLogo />
          </Link>
          <p className="hidden text-sm font-semibold text-brand-700 sm:block">Khu vực quản trị</p>
          <div className="ml-auto">
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-360 flex-1 gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-6 lg:pb-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden lg:flex lg:min-h-0 lg:flex-col">
          <nav aria-label="Điều hướng quản trị" className="flex min-h-0 flex-1 flex-col">
            <p className="px-4 pb-3 text-xs font-semibold tracking-wide text-brand-600 uppercase">Quản trị</p>
            <ul className="flex flex-col gap-3">
              {ADMIN_NAVIGATION_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={isAdminNavigationActive(pathname, item.href)}
                    layout="side"
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
        </aside>

        <div className="scroll-area lg:-mx-2 lg:min-h-0 lg:overflow-y-auto lg:px-2 lg:py-1">{children}</div>
      </div>

      <nav
        aria-label="Điều hướng quản trị"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch">
          {ADMIN_NAVIGATION_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isAdminNavigationActive(pathname, item.href)}
              layout="bottom"
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
