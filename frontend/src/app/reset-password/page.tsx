import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordContainer } from "@/components/auth/reset-password-container";
import { FullPageLoader } from "@/components/common/full-page-loader";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - Kircle",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ResetPasswordContainer />
    </Suspense>
  );
}
