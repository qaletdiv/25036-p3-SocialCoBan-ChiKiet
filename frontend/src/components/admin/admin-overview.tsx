import { AlertCircle, FilePlus2, FileText, Flag, UserPlus, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-messages";
import type { AdminOverview } from "@/types/admin";

const numberFormat = new Intl.NumberFormat("vi-VN");

interface AdminOverviewViewProps {
  status: "idle" | "loading" | "ready" | "error";
  overview: AdminOverview | null;
  error: unknown;
  onRetry: () => void;
}

export function AdminOverviewView({ status, overview, error, onRetry }: AdminOverviewViewProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Tổng quan</h1>
        <p className="text-sm text-zinc-500">Tình trạng người dùng, bài viết và báo cáo chưa xử lý trên hệ thống.</p>
      </header>

      {status === "loading" || status === "idle" ? <OverviewSkeleton /> : null}
      {status === "error" ? <OverviewError message={getErrorMessage(error)} onRetry={onRetry} /> : null}
      {status === "ready" && overview ? <OverviewCards overview={overview} /> : null}
    </div>
  );
}

function OverviewCards({ overview }: { overview: AdminOverview }) {
  const windowLabel = `${overview.activityWindowDays} ngày gần nhất`;
  const cards: Array<{ label: string; value: number; hint: string; icon: LucideIcon }> = [
    { label: "Tài khoản đã đăng ký", value: overview.totalUsers, hint: "Mọi tài khoản trên hệ thống", icon: Users },
    { label: "Bài viết", value: overview.totalPosts, hint: "Không tính bài đã xóa", icon: FileText },
    { label: "Tài khoản mới", value: overview.newUsers, hint: windowLabel, icon: UserPlus },
    { label: "Bài viết mới", value: overview.newPosts, hint: windowLabel, icon: FilePlus2 },
    { label: "Báo cáo chưa xử lý", value: overview.pendingReports, hint: "Đang chờ xử lý", icon: Flag },
  ];

  return (
    <section aria-label="Số liệu tổng quan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  );
}

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: number; hint: string; icon: LucideIcon }) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-md shadow-brand-600/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-brand-900 tabular-nums">{numberFormat.format(value)}</p>
          <p className="mt-2 text-sm text-zinc-500">{hint}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function OverviewSkeleton() {
  return (
    <div role="status" aria-label="Đang tải số liệu" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-brand-100 bg-white" />
      ))}
    </div>
  );
}

function OverviewError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
      <p className="max-w-sm text-sm text-rose-700">{message}</p>
      <Button variant="outline" className="w-auto" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}
