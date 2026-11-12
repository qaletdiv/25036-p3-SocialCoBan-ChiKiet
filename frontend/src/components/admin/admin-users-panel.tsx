"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Search } from "lucide-react";
import { AdminUserDialog } from "@/components/admin/admin-user-dialog";
import { Button } from "@/components/ui/button";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/constants/account-status";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { getErrorMessage } from "@/lib/error-messages";
import type { UserRole } from "@/types/auth";
import type { AdminUserFilters, AdminUserSummary } from "@/types/admin-user";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const ROLE_LABELS: Record<UserRole, string> = { user: "Người dùng", admin: "Quản trị viên" };

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  unverified: "bg-amber-50 text-amber-800",
  locked: "bg-rose-50 text-rose-700",
};

export function AdminUsersPanel() {
  const list = useAdminUsers();
  const [draftQuery, setDraftQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    list.applyFilters({ ...list.filters, q: draftQuery.trim() });
  };

  const changeFilter = (patch: Partial<AdminUserFilters>) => {
    list.applyFilters({ ...list.filters, q: draftQuery.trim(), ...patch });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Quản lý người dùng</h1>
        <p className="text-sm text-zinc-500">Xem tài khoản đã đăng ký, tìm theo tên hoặc email, và khóa tài khoản vi phạm.</p>
      </header>

      <form onSubmit={submitSearch} className="grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5 sm:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
        <label className="sr-only" htmlFor="admin-user-search">
          Tìm theo họ tên, tên đăng nhập hoặc email
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-400" aria-hidden="true" />
          <input
            id="admin-user-search"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Họ tên, tên đăng nhập hoặc email"
            className="h-11 w-full rounded-xl border border-brand-100 bg-white pr-4 pl-10 text-sm shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <FilterSelect
          label="Trạng thái"
          value={list.filters.status}
          onChange={(status) => changeFilter({ status: status as AdminUserFilters["status"] })}
          options={[
            { value: "", label: "Mọi trạng thái" },
            { value: "active", label: ACCOUNT_STATUS_LABELS.active },
            { value: "unverified", label: ACCOUNT_STATUS_LABELS.unverified },
            { value: "locked", label: ACCOUNT_STATUS_LABELS.locked },
          ]}
        />
        <FilterSelect
          label="Vai trò"
          value={list.filters.role}
          onChange={(role) => changeFilter({ role: role as AdminUserFilters["role"] })}
          options={[
            { value: "", label: "Mọi vai trò" },
            { value: "user", label: "Người dùng" },
            { value: "admin", label: "Quản trị viên" },
          ]}
        />
        <Button type="submit" className="w-full sm:w-auto">
          Tìm
        </Button>
      </form>

      {list.status === "loading" && <UserListSkeleton />}
      {list.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
          <p className="max-w-sm text-sm text-rose-700">{getErrorMessage(list.error)}</p>
          <Button variant="outline" className="w-auto" onClick={() => void list.reload()}>
            Thử lại
          </Button>
        </div>
      )}
      {list.status === "ready" && list.users.length === 0 && (
        <p className="rounded-2xl border border-brand-100 bg-white px-6 py-10 text-center text-sm text-zinc-500">
          Không có tài khoản nào khớp.
        </p>
      )}
      {list.status === "ready" && list.users.length > 0 && (
        <ul className="space-y-3" aria-label="Danh sách tài khoản">
          {list.users.map((user) => (
            <li key={user.id}>
              <UserRow user={user} onOpen={() => setSelectedId(user.id)} />
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

      <AdminUserDialog userId={selectedId} onClose={() => setSelectedId(null)} onUpdated={list.replaceUser} />
    </div>
  );
}

function UserRow({ user, onOpen }: { user: AdminUserSummary; onOpen: () => void }) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-900">{user.fullName}</p>
          <p className="truncate text-sm text-zinc-500">@{user.username}</p>
          <p className="truncate text-sm text-zinc-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-sm text-zinc-500">{dateFormat.format(new Date(user.createdAt))}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[user.status]}`}>
            {ACCOUNT_STATUS_LABELS[user.status]}
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {ROLE_LABELS[user.role]}
          </span>
          <Button variant="outline" className="w-auto" onClick={onOpen}>
            Xem
          </Button>
        </div>
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

function UserListSkeleton() {
  return (
    <div role="status" aria-label="Đang tải danh sách" className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl border border-brand-100 bg-white" />
      ))}
    </div>
  );
}
