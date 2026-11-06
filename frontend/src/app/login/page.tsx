import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginContainer } from "@/components/auth/login-container";
import { FullPageLoader } from "@/components/common/full-page-loader";

export const metadata: Metadata = {
  title: "Đăng nhập - Kircle",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LoginContainer />
    </Suspense>
  );
}
