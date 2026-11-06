import { Suspense } from "react";
import type { Metadata } from "next";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { ProfileContainer } from "@/components/profile/profile-container";

export const metadata: Metadata = {
  title: "Trang cá nhân - Kircle",
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FullPageLoader message="Đang tải trang cá nhân..." />}>
      <ResolvedUserProfile params={params} />
    </Suspense>
  );
}

async function ResolvedUserProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfileContainer userId={id} />;
}
