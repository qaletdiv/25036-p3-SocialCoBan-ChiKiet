"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { AdminReportDialog } from "@/components/admin/admin-report-dialog";
import { Button } from "@/components/ui/button";
import {
  REPORT_CONTENT_STATE_LABELS,
  REPORT_DECISION_LABELS,
  REPORT_DECISION_STYLES,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_STYLES,
  REPORT_TARGET_LABELS,
} from "@/constants/admin-report";
import { REPORT_REASONS } from "@/constants/report";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { getErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/cn";
import type { AdminReportFilters, AdminReportSummary, ReportTab } from "@/types/admin-report";

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const TABS: Array<{ value: ReportTab; label: string }> = [
  { value: "queue", label: "Báo cáo" },
  { value: "history", label: "Lịch sử xử lý" },
];

export function AdminReportsPanel() {
  const list = useAdminReports();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isQueue = list.tab === "queue";

  const changeFilter = (patch: Partial<AdminReportFilters>) => {
    list.applyFilters({ ...list.filters, ...patch });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Quản lý báo cáo</h1>
        <p className="text-sm text-zinc-500">
          Xem xét bài viết và bình luận bị báo cáo, phê duyệt hoặc gỡ bỏ nội dung vi phạm.
        </p>
      </header>

      <div role="tablist" aria-label="Chế độ xem báo cáo" className="inline-flex rounded-xl bg-brand-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={list.tab === tab.value}
            onClick={() => list.changeTab(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
              list.tab === tab.value ? "bg-white text-brand-800 shadow-sm" : "text-zinc-600 hover:text-brand-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isQueue && (
        <div className="grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5 sm:grid-cols-3">
          <FilterSelect
            label="Trạng thái xử lý"
            value={list.filters.status}
            onChange={(status) => changeFilter({ status: status as AdminReportFilters["status"] })}
            options={[
              { value: "", label: "Mọi trạng thái" },
              ...(["pending", "approved", "removed"] as const).map((value) => ({
                value,
                label: REPORT_STATUS_LABELS[value],
              })),
            ]}
          />
          <FilterSelect
            label="Loại nội dung"
            value={list.filters.type}
            onChange={(type) => changeFilter({ type: type as AdminReportFilters["type"] })}
            options={[
              { value: "", label: "Mọi loại nội dung" },
              { value: "post", label: REPORT_TARGET_LABELS.post },
              { value: "comment", label: REPORT_TARGET_LABELS.comment },
            ]}
          />
          <FilterSelect
            label="Lý do báo cáo"
            value={list.filters.reason}
            onChange={(reason) => changeFilter({ reason: reason as AdminReportFilters["reason"] })}
            options={[{ value: "", label: "Mọi lý do" }, ...REPORT_REASONS.map((item) => ({ ...item }))]}
          />
        </div>
      )}

      {list.status === "loading" && <ReportListSkeleton />}
      {list.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
          <p className="max-w-sm text-sm text-rose-700">{getErrorMessage(list.error)}</p>
          <Button variant="outline" className="w-auto" onClick={() => void list.reload()}>
            Thử lại
          </Button>
        </div>
      )}
      {list.status === "ready" && list.reports.length === 0 && (
        <p className="rounded-2xl border border-brand-100 bg-white px-6 py-10 text-center text-sm text-zinc-500">
          {isQueue ? "Không có báo cáo nào khớp." : "Chưa có báo cáo nào được xử lý."}
        </p>
      )}
      {list.status === "ready" && list.reports.length > 0 && (
        <ul className="space-y-3" aria-label={isQueue ? "Danh sách báo cáo" : "Lịch sử xử lý báo cáo"}>
          {list.reports.map((report) => (
            <li key={isQueue ? report.id : (report.lastAction?.id ?? report.id)}>
              <ReportRow report={report} isHistory={!isQueue} onOpen={() => setSelectedId(report.id)} />
            </li>
          ))}
        </ul>
      )}
      {list.status === "ready" && list.nextCursor && (
        <div className="flex flex-col items-center gap-2">
          {list.loadMoreFailed && (
            <p role="alert" className="text-sm text-rose-700">
              Không tải thêm được. Vui lòng thử lại.
            </p>
          )}
          <Button variant="outline" className="w-auto" isLoading={list.isLoadingMore} onClick={list.loadMore}>
            Xem thêm
          </Button>
        </div>
      )}

      <AdminReportDialog
        reportId={selectedId}
        onClose={() => setSelectedId(null)}
        onHandled={() => void list.reload()}
      />
    </div>
  );
}

function ReportRow({
  report,
  isHistory,
  onOpen,
}: {
  report: AdminReportSummary;
  isHistory: boolean;
  onOpen: () => void;
}) {
  const action = report.lastAction;

  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {REPORT_TARGET_LABELS[report.targetType]}
            </span>
            {isHistory && action ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REPORT_DECISION_STYLES[action.decision]}`}>
                {REPORT_DECISION_LABELS[action.decision]}
              </span>
            ) : (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REPORT_STATUS_STYLES[report.status]}`}>
                {REPORT_STATUS_LABELS[report.status]}
              </span>
            )}
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
              {REPORT_REASON_LABELS[report.reason]}
            </span>
            {isHistory && action?.isAutomatic && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Tự động</span>
            )}
          </div>

          {report.contentPreview !== null ? (
            <p className="line-clamp-3 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-zinc-800">
              {report.contentPreview}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic">{REPORT_CONTENT_STATE_LABELS.deleted}</p>
          )}

          <p className="text-xs text-zinc-500">
            Tác giả: {report.author?.fullName ?? "Không xác định"} · Người báo cáo: {report.reporter.fullName} ·{" "}
            {dateTimeFormat.format(new Date(report.createdAt))}
          </p>
          {isHistory && action && (
            <p className="text-xs text-zinc-500">
              Xử lý bởi {action.admin?.fullName ?? "Không xác định"} · {dateTimeFormat.format(new Date(action.createdAt))}
              {action.note ? ` · ${action.note}` : ""}
            </p>
          )}
        </div>

        <Button variant="outline" className="w-auto shrink-0" onClick={onOpen}>
          {report.status === "pending" && !isHistory ? "Xem xét" : "Xem"}
        </Button>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReportListSkeleton() {
  return (
    <div role="status" aria-label="Đang tải danh sách" className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-2xl border border-brand-100 bg-white" />
      ))}
    </div>
  );
}
