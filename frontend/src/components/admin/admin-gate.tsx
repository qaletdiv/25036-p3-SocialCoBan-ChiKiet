"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";
import { buildLoginUrl, DEFAULT_AUTHENTICATED_PATH } from "@/lib/redirect";

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, refresh } = useAuthUser();
  const { logout } = useLogout();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(buildLoginUrl(pathname));
  }, [status, pathname, router]);

  useEffect(() => {
    if (status === "authenticated" && user && user.role !== "admin") {
      router.replace(DEFAULT_AUTHENTICATED_PATH);
    }
  }, [status, user, router]);

  if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && user?.role !== "admin")) {
    return <FullPageLoader message="Đang mở khu vực quản trị..." />;
  }

  if (status === "error" || !user) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="size-10 text-rose-500" aria-hidden="true" />
        <p className="max-w-sm text-sm text-zinc-600">Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.</p>
        <Button variant="outline" className="w-auto" onClick={() => void refresh()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <AdminShell user={user} onLogout={() => void logout()}>
      {children}
    </AdminShell>
  );
}
