"use client";

import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusPanel } from "@/components/auth/status-panel";
import { LinkButton } from "@/components/ui/link-button";
import { useVerifyEmail } from "@/hooks/use-verify-email";
import { LOGIN_PATH } from "@/lib/redirect";

export function VerifyEmailContainer() {
  const token = useSearchParams().get("token");
  const { status, errorMessage } = useVerifyEmail(token);

  return (
    <AuthShell>
      {status === "verifying" && (
        <StatusPanel tone="loading" title="Đang xác thực email..." description="Vui lòng đợi trong giây lát." />
      )}

      {status === "success" && (
        <StatusPanel
          tone="success"
          title="Xác thực email thành công"
          description="Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."
        >
          <LinkButton href={LOGIN_PATH}>Đến trang đăng nhập</LinkButton>
        </StatusPanel>
      )}

      {status === "error" && (
        <StatusPanel tone="error" title="Xác thực không thành công" description={errorMessage ?? undefined}>
          <LinkButton href={LOGIN_PATH}>Đến trang đăng nhập</LinkButton>
        </StatusPanel>
      )}
    </AuthShell>
  );
}
