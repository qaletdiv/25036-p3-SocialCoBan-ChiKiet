"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_REPORT_FILTERS } from "@/constants/admin-report";
import { adminReportService } from "@/services/admin-report.service";
import type { AdminReportFilters, AdminReportSummary, ReportTab } from "@/types/admin-report";

type ListStatus = "loading" | "ready" | "error";

export const useAdminReports = () => {
  const [tab, setTab] = useState<ReportTab>("queue");
  const [filters, setFilters] = useState<AdminReportFilters>(DEFAULT_REPORT_FILTERS);
  const [reports, setReports] = useState<AdminReportSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);

  const load = useCallback(async (activeTab: ReportTab, activeFilters: AdminReportFilters, cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
      setLoadMoreFailed(false);
    } else {
      setStatus("loading");
      setError(null);
    }

    try {
      const page =
        activeTab === "queue"
          ? await adminReportService.list(activeFilters, cursor)
          : await adminReportService.history(cursor);
      setReports((current) => (cursor ? [...current, ...page.reports] : page.reports));
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch (caught) {
      if (!cursor) {
        setReports([]);
        setNextCursor(null);
        setError(caught);
        setStatus("error");
      } else {
        setLoadMoreFailed(true);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(tab, filters);
  }, [tab, filters, load]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return;
    void load(tab, filters, nextCursor);
  }, [filters, isLoadingMore, load, nextCursor, tab]);

  return {
    tab,
    filters,
    reports,
    nextCursor,
    status,
    error,
    isLoadingMore,
    loadMoreFailed,
    changeTab: setTab,
    applyFilters: setFilters,
    loadMore,
    reload: () => load(tab, filters),
  };
};
