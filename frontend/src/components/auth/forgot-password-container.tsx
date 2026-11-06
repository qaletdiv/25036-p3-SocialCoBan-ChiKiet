"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useForgotPassword } from "@/hooks/use-forgot-password";
import { DEFAULT_AUTHENTICATED_PATH } from "@/lib/redirect";

export function ForgotPasswordContainer() {
  const router = useRouter();
  const { status } = useAuthUser();
  const forgotPassword = useForgotPassword();

  useEffect(() => {
    if (status === "authenticated") router.replace(DEFAULT_AUTHENTICATED_PATH);
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageLoader message="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <AuthShell>
      <ForgotPasswordForm {...forgotPassword} />
    </AuthShell>
  );
}
