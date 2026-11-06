"use client";

import * as Popover from "@radix-ui/react-popover";
import { Bell, BellOff } from "lucide-react";

export function NotificationMenu() {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Thông báo"
        className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50/60 text-zinc-600 transition-colors hover:bg-brand-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 data-[state=open]:bg-brand-100 data-[state=open]:text-brand-700"
      >
        <Bell className="size-5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={16}
          className="z-50 w-88 max-w-[calc(100vw-2rem)] rounded-2xl border border-brand-100 bg-white shadow-xl shadow-brand-900/10 focus:outline-none"
        >
          <div className="border-b border-brand-100 px-5 py-4">
            <h2 className="text-base font-bold text-brand-900">Thông báo</h2>
          </div>
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <BellOff className="size-7" aria-hidden="true" />
            </span>
            <p className="font-semibold text-brand-900">Chưa có thông báo nào</p>
            <p className="text-sm text-zinc-500">Thông báo mới của bạn sẽ xuất hiện tại đây.</p>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
