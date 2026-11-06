"use client";

import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordResult } from "@/components/auth/reset-password-result";
import { StatusPanel } from "@/components/auth/status-panel";
import { LinkButton } from "@/components/ui/link-button";
import { useResetPassword } from "@/hooks/use-reset-password";
import { LOGIN_PATH } from "@/lib/redirect";

export function ResetPasswordContainer() {
  const token = useSearchParams().get("token");
  const reset = useResetPassword(token);

  if (reset.tokenStatus === "checking") {
    return (
      <AuthShell>
        <StatusPanel tone="loading" title="Đang kiểm tra liên kết..." description="Vui lòng đợi trong giây lát." />
      </AuthShell>
    );
  }

  if (reset.tokenStatus === "invalid") {
    return (
      <AuthShell>
        <StatusPanel
          tone="error"
          title="Liên kết không hợp lệ"
          description="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới."
        >
          <div className="space-y-3">
            <LinkButton href="/forgot-password">Yêu cầu liên kết mới</LinkButton>
            <LinkButton
              href={LOGIN_PATH}
              className="border border-brand-100 bg-white bg-none text-foreground shadow-sm hover:bg-brand-50"
            >
              Quay lại đăng nhập
            </LinkButton>
          </div>
        </StatusPanel>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {reset.step === "form" ? <ResetPasswordForm {...reset} /> : <ResetPasswordResult {...reset} />}
    </AuthShell>
  );
}
