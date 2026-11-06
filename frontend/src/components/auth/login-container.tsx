"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogin } from "@/hooks/use-login";
import { resolveSafeRedirect } from "@/lib/redirect";

export function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirect(searchParams.get("redirect"));
  const justRegistered = searchParams.get("registered") === "1";
  const { status } = useAuthUser();
  const login = useLogin(redirectTo);

  useEffect(() => {
    if (status === "authenticated") router.replace(redirectTo);
  }, [status, redirectTo, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageLoader message="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <AuthShell>
      <LoginForm {...login} justRegistered={justRegistered} />
    </AuthShell>
  );
}
