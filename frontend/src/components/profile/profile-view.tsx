"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { PageBackdrop } from "@/components/common/page-backdrop";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SideNav } from "@/components/layout/side-nav";
import { FollowListDialog } from "@/components/profile/follow-list-dialog";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfilePosts } from "@/components/profile/profile-posts";
import { RightRail } from "@/components/newsfeed/right-rail";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ProfilePostKind } from "@/constants/profile";
import { useOpenConversation } from "@/hooks/use-open-conversation";
import { useProfile, type ConnectionList } from "@/hooks/use-profile";
import type { AuthUser } from "@/types/auth";
import type { UserProfile } from "@/types/user";

interface ProfileViewProps {
  user: AuthUser;
  profileId: string;
  onLogout: () => void;
  onUserUpdated: (patch: Partial<AuthUser>) => void;
}

export function ProfileView({ user, profileId, onLogout, onUserUpdated }: ProfileViewProps) {
  const profileState = useProfile(profileId);
  const openConversation = useOpenConversation();
  const [kind, setKind] = useState<ProfilePostKind>("authored");
  const [isEditing, setIsEditing] = useState(false);
  const [openList, setOpenList] = useState<ConnectionList | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleSaved = (updated: UserProfile) => {
    profileState.replaceProfile(updated);
    if (updated.isSelf) {
      onUserUpdated({ fullName: updated.fullName, username: updated.username, avatarUrl: updated.avatarUrl });
    }
    setIsEditing(false);
  };

  const handleToggleFollow = () => {
    void profileState.toggleFollow().then(() => setListRefreshKey((key) => key + 1));
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <PageBackdrop />
      <AppHeader user={user} onLogout={onLogout} />
      <main className="mx-auto grid w-full max-w-360 flex-1 gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-6 lg:pb-6 xl:grid-cols-[18rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[20rem_minmax(0,1fr)_22rem]">
        <aside className="hidden lg:flex lg:min-h-0 lg:flex-col">
          <SideNav userId={user.id} onLogout={onLogout} />
        </aside>

        <div className="scroll-area lg:-mx-2 lg:min-h-0 lg:overflow-y-auto lg:px-2 lg:py-1">
          <div className="mx-auto w-full max-w-3xl space-y-5">
            {profileState.status === "loading" && <ProfileSkeleton />}
            {profileState.status === "error" && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
                <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
                <p className="text-sm text-rose-700">Không thể tải trang cá nhân. Vui lòng thử lại.</p>
                <Button variant="outline" className="w-auto" onClick={() => void profileState.reload()}>
                  Thử lại
                </Button>
              </div>
            )}
            {profileState.status === "notFound" && (
              <div className="rounded-2xl border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center">
                <h1 className="text-lg font-bold text-brand-900">Không tìm thấy trang cá nhân</h1>
                <p className="mt-2 text-sm text-zinc-600">Tài khoản này không tồn tại hoặc chưa xác minh email.</p>
              </div>
            )}
            {profileState.status === "ready" && profileState.profile && (
              <>
                {(profileState.actionError ?? openConversation.error) && (
                  <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {profileState.actionError ?? openConversation.error}
                  </p>
                )}
                <ProfileHeader
                  profile={profileState.profile}
                  isUpdatingFollow={profileState.isUpdatingFollow}
                  isOpeningChat={openConversation.openingUserId !== null}
                  onEdit={() => setIsEditing(true)}
                  onToggleFollow={handleToggleFollow}
                  onMessage={() => void openConversation.open(profileId)}
                  onOpenList={setOpenList}
                />
                <ProfilePosts
                  user={user}
                  profileId={profileState.profile.id}
                  profileName={profileState.profile.fullName}
                  isSelf={profileState.profile.isSelf}
                  kind={kind}
                  onKindChange={setKind}
                />
                <FollowListDialog
                  userId={profileState.profile.id}
                  list={openList}
                  refreshKey={listRefreshKey}
                  removeOnUnfollow={profileState.profile.isSelf && openList === "following"}
                  onClose={() => setOpenList(null)}
                  onChange={profileState.applyConnectionChange}
                />
                <Modal
                  open={isEditing}
                  title="Chỉnh sửa trang cá nhân"
                  description="Cập nhật họ tên, tên đăng nhập và tiểu sử. Ảnh đại diện sẽ được bổ sung sau."
                  onClose={() => setIsEditing(false)}
                >
                  <ProfileEditForm
                    profile={profileState.profile}
                    onSaved={handleSaved}
                    onCancel={() => setIsEditing(false)}
                  />
                </Modal>
              </>
            )}
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

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Đang tải trang cá nhân" className="animate-pulse rounded-2xl border border-brand-100 bg-white">
      <div className="h-28 bg-brand-100 sm:h-36" />
      <div className="space-y-3 px-6 py-6">
        <div className="-mt-12 size-24 rounded-full bg-brand-200" />
        <div className="h-6 w-48 rounded-full bg-brand-100" />
        <div className="h-4 w-64 rounded-full bg-brand-50" />
      </div>
    </div>
  );
}
