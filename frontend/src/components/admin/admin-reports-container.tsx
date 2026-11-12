"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";

export function AdminReportsContainer() {
  return (
    <AdminGate>
      <AdminReportsPanel />
    </AdminGate>
  );
}
