"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useRegister } from "@/hooks/use-register";
import { DEFAULT_AUTHENTICATED_PATH } from "@/lib/redirect";

export function RegisterContainer() {
  const router = useRouter();
  const { status } = useAuthUser();
  const registration = useRegister();

  useEffect(() => {
    if (status === "authenticated") router.replace(DEFAULT_AUTHENTICATED_PATH);
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageLoader message="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <AuthShell>
      <RegisterForm {...registration} />
    </AuthShell>
  );
}
