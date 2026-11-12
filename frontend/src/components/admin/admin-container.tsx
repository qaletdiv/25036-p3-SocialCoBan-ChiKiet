"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminOverviewView } from "@/components/admin/admin-overview";
import { useAdminOverview } from "@/hooks/use-admin-overview";
import { ApiError } from "@/lib/api-client";
import { buildLoginUrl, DEFAULT_AUTHENTICATED_PATH } from "@/lib/redirect";

export function AdminContainer() {
  return (
    <AdminGate>
      <AdminOverviewPanel />
    </AdminGate>
  );
}

function AdminOverviewPanel() {
  const router = useRouter();
  const overview = useAdminOverview(true);

  useEffect(() => {
    if (!(overview.error instanceof ApiError)) return;
    if (overview.error.status === 401 || overview.error.code === "ACCOUNT_LOCKED") {
      router.replace(buildLoginUrl("/admin"));
    } else if (overview.error.status === 403) {
      router.replace(DEFAULT_AUTHENTICATED_PATH);
    }
  }, [overview.error, router]);

  return (
    <AdminOverviewView
      status={overview.status}
      overview={overview.overview}
      error={overview.error}
      onRetry={() => void overview.reload()}
    />
  );
}
