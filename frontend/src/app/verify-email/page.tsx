import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailContainer } from "@/components/auth/verify-email-container";
import { FullPageLoader } from "@/components/common/full-page-loader";

export const metadata: Metadata = {
  title: "Xác thực email - Kircle",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <VerifyEmailContainer />
    </Suspense>
  );
}
