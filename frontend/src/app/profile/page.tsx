import type { Metadata } from "next";
import { ProfileContainer } from "@/components/profile/profile-container";

export const metadata: Metadata = {
  title: "Trang cá nhân - Kircle",
};

export default function ProfilePage() {
  return <ProfileContainer />;
}
