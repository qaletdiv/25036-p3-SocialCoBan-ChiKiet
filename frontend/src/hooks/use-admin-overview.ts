"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import type { AdminOverview } from "@/types/admin";

type OverviewStatus = "idle" | "loading" | "ready" | "error";

export const useAdminOverview = (enabled: boolean) => {
  const [status, setStatus] = useState<OverviewStatus>("idle");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await adminService.getOverview();
      setOverview(data);
      setStatus("ready");
    } catch (caught) {
      setOverview(null);
      setError(caught);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [enabled, reload]);

  return { status: enabled ? status : "idle", overview, error, reload };
};
