"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { ACCOUNT_LOCKED_NOTICE_KEY } from "@/constants/account-status";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogin } from "@/hooks/use-login";
import { landingPathFor, resolveSafeRedirect } from "@/lib/redirect";

export function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirect(searchParams.get("redirect"));
  const justRegistered = searchParams.get("registered") === "1";
  const { status, user } = useAuthUser();
  const login = useLogin(redirectTo);
  const [lockedNotice, setLockedNotice] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (sessionStorage.getItem(ACCOUNT_LOCKED_NOTICE_KEY) !== "1") return;
    sessionStorage.removeItem(ACCOUNT_LOCKED_NOTICE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLockedNotice(true);
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") router.replace(landingPathFor(redirectTo, user?.role));
  }, [status, user, redirectTo, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageLoader message="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <AuthShell>
      <LoginForm {...login} justRegistered={justRegistered} lockedNotice={lockedNotice} />
    </AuthShell>
  );
}
