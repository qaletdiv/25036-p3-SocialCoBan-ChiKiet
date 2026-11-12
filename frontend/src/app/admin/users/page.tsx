import type { Metadata } from "next";
import { AdminUsersContainer } from "@/components/admin/admin-users-container";

export const metadata: Metadata = {
  title: "Quản lý người dùng - Kircle",
};

export default function AdminUsersPage() {
  return <AdminUsersContainer />;
}
