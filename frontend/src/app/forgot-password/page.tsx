import type { Metadata } from "next";
import { ForgotPasswordContainer } from "@/components/auth/forgot-password-container";

export const metadata: Metadata = {
  title: "Quên mật khẩu - Kircle",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContainer />;
}
