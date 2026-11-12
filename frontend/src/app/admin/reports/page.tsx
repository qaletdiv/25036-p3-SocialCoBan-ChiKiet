import type { Metadata } from "next";
import { AdminReportsContainer } from "@/components/admin/admin-reports-container";

export const metadata: Metadata = {
  title: "Kiểm duyệt nội dung - Kircle",
};

export default function AdminReportsPage() {
  return <AdminReportsContainer />;
}
