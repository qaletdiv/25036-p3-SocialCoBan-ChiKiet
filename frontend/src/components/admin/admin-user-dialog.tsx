"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ACCOUNT_STATUS_LABELS } from "@/constants/account-status";
import { getErrorMessage } from "@/lib/error-messages";
import { adminUserService } from "@/services/admin-user.service";
import type { AdminUserDetail } from "@/types/admin-user";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const ROLE_LABELS = { user: "Người dùng", admin: "Quản trị viên" } as const;

interface AdminUserDialogProps {
  userId: string | null;
  onClose: () => void;
  onUpdated: (user: AdminUserDetail) => void;
}

export function AdminUserDialog({ userId, onClose, onUpdated }: AdminUserDialogProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmLock, setConfirmLock] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(null);
    setError(null);
    setConfirmLock(null);
    setActionError(null);
    setIsLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    void adminUserService
      .get(userId)
      .then((detail) => {
        if (active) setUser(detail);
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
  }, [userId]);

  const applyLock = async (locked: boolean) => {
    if (!user) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await adminUserService.setLocked(user.id, locked);
      setUser(updated);
      setConfirmLock(null);
      onUpdated(updated);
    } catch (caught) {
      setActionError(caught);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={userId !== null} title={user?.fullName ?? "Thông tin tài khoản"} onClose={onClose}>
      {isLoading && <p className="text-sm text-zinc-500">Đang tải thông tin tài khoản...</p>}
      {error != null && (
        <p role="alert" className="text-sm text-rose-700">
          {getErrorMessage(error)}
        </p>
      )}
      {user && (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Detail label="Họ tên" value={user.fullName} />
            <Detail label="Tên đăng nhập" value={`@${user.username}`} />
            <Detail label="Email" value={user.email} />
            <Detail label="Xác minh email" value={user.emailVerified ? "Đã xác minh" : "Chưa xác minh"} />
            <Detail label="Ngày đăng ký" value={dateFormat.format(new Date(user.createdAt))} />
            <Detail label="Vai trò" value={ROLE_LABELS[user.role]} />
            <Detail label="Trạng thái" value={ACCOUNT_STATUS_LABELS[user.status]} />
            <Detail label="Tiểu sử" value={user.bio?.trim() ? user.bio : "Chưa có tiểu sử"} />
          </dl>

          {user.role === "admin" ? (
            <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">Không thể khóa tài khoản quản trị.</p>
          ) : confirmLock === null ? (
            <Button
              variant={user.status === "locked" ? "outline" : "danger"}
              onClick={() => setConfirmLock(user.status !== "locked")}
            >
              {user.status === "locked" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
              <p className="text-sm text-zinc-700">
                {confirmLock
                  ? "Khóa tài khoản này? Người này sẽ không đăng nhập và không dùng được các chức năng cần tài khoản."
                  : "Mở khóa tài khoản này? Người này có thể đăng nhập lại."}
              </p>
              {actionError != null && (
                <p role="alert" className="flex items-start gap-2 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {getErrorMessage(actionError)}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmLock(null)} disabled={isSaving}>
                  Hủy
                </Button>
                <Button
                  variant={confirmLock ? "danger" : "primary"}
                  isLoading={isSaving}
                  onClick={() => void applyLock(confirmLock)}
                >
                  {confirmLock ? "Khóa" : "Mở khóa"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-brand-900">{value}</dd>
    </div>
  );
}
