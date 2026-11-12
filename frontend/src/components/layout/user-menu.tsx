"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Shield, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import type { AuthUser } from "@/types/auth";

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Menu tài khoản"
        className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <UserAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-64 rounded-2xl border border-brand-100 bg-white p-2 shadow-xl shadow-brand-900/10"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-brand-900">{user.fullName}</p>
            <p className="truncate text-xs text-zinc-500">@{user.username}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-brand-100" />
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-brand-50 data-highlighted:text-brand-700"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Trang cá nhân
            </Link>
          </DropdownMenu.Item>
          {user.role === "admin" && (
            <DropdownMenu.Item asChild>
              <Link
                href="/admin"
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-brand-50 data-highlighted:text-brand-700"
              >
                <Shield className="size-4" aria-hidden="true" />
                Quản trị
              </Link>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onSelect={onLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-brand-50 data-highlighted:text-brand-700"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Đăng xuất
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
