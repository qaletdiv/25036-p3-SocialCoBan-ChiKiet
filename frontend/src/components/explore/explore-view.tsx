"use client";

import { PageBackdrop } from "@/components/common/page-backdrop";
import { ExploreSearchForm } from "@/components/explore/explore-search-form";
import { UserSearchResults } from "@/components/explore/user-search-results";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SideNav } from "@/components/layout/side-nav";
import { ProfileSummaryCard } from "@/components/newsfeed/profile-summary-card";
import { RightRail } from "@/components/newsfeed/right-rail";
import type { AuthUser } from "@/types/auth";

interface ExploreViewProps {
  user: AuthUser;
  query: string;
  onLogout: () => void;
}

export function ExploreView({ user, query, onLogout }: ExploreViewProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <PageBackdrop />
      <AppHeader user={user} searchQuery={query} onLogout={onLogout} />
      <main className="mx-auto grid w-full max-w-360 flex-1 gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-6 lg:pb-6 xl:grid-cols-[18rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[20rem_minmax(0,1fr)_22rem]">
        <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-4">
          <ProfileSummaryCard user={user} />
          <SideNav userId={user.id} onLogout={onLogout} />
        </aside>

        <div className="scroll-area lg:-mx-2 lg:min-h-0 lg:overflow-y-auto lg:px-2 lg:py-1">
          <div className="mx-auto w-full max-w-3xl space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">Khám phá</h1>
              <p className="mt-1 text-sm text-zinc-600">Tìm bạn bè theo họ tên hoặc tên đăng nhập.</p>
            </div>
            <ExploreSearchForm key={query} initialQuery={query} />
            <UserSearchResults query={query} />
          </div>
        </div>

        <aside className="hidden xl:flex xl:min-h-0 xl:flex-col">
          <RightRail />
        </aside>
      </main>
      <MobileNav userId={user.id} />
    </div>
  );
}
