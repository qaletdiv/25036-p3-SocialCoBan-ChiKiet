"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";

export function AdminUsersContainer() {
  return (
    <AdminGate>
      <AdminUsersPanel />
    </AdminGate>
  );
}
