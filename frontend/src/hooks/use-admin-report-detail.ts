"use client";

import { useCallback, useEffect, useState } from "react";
import { adminReportService } from "@/services/admin-report.service";
import type { AdminReportDetail, ReportHandleAction } from "@/types/admin-report";

export const useAdminReportDetail = (reportId: string | null, onHandled: () => void) => {
  const [report, setReport] = useState<AdminReportDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  useEffect(() => {
    if (!reportId) return;
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setReport(null);
    setError(null);
    setNote("");
    setConfirmRemove(false);
    setActionError(null);
    setIsLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    void adminReportService
      .get(reportId)
      .then((detail) => {
        if (active) setReport(detail);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reportId]);

  const handle = useCallback(
    async (action: ReportHandleAction) => {
      if (!report) return;
      setIsSubmitting(true);
      setActionError(null);
      try {
        const updated = await adminReportService.handle(report.id, action, note.trim());
        setReport(updated);
        setConfirmRemove(false);
        setNote("");
        onHandled();
      } catch (caught) {
        setActionError(caught);
      } finally {
        setIsSubmitting(false);
      }
    },
    [note, onHandled, report],
  );

  return {
    report,
    error,
    isLoading,
    note,
    setNote,
    confirmRemove,
    setConfirmRemove,
    isSubmitting,
    actionError,
    handle,
  };
};
