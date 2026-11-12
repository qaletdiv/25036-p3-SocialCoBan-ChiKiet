import type { Metadata } from "next";
import { AdminContainer } from "@/components/admin/admin-container";

export const metadata: Metadata = {
  title: "Tổng quan - Kircle",
};

export default function AdminPage() {
  return <AdminContainer />;
}
