"use client";

import Link from "next/link";
import { buildExplorePath, type ExploreTab } from "@/lib/explore-path";

interface ExploreTabsProps {
  query: string;
  tab: ExploreTab;
}

const TABS: { id: ExploreTab; label: string }[] = [
  { id: "users", label: "Người dùng" },
  { id: "posts", label: "Bài viết" },
];

export function ExploreTabs({ query, tab }: ExploreTabsProps) {
  return (
    <div role="tablist" aria-label="Loại tìm kiếm" className="flex gap-2">
      {TABS.map((item) => {
        const selected = tab === item.id;
        return (
          <Link
            key={item.id}
            href={buildExplorePath(query, item.id)}
            role="tab"
            aria-selected={selected}
            className={
              selected
                ? "rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-md shadow-brand-600/10"
                : "rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-white/70 hover:text-brand-700"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
