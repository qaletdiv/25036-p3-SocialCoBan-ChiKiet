import type { Metadata } from "next";
import { RegisterContainer } from "@/components/auth/register-container";

export const metadata: Metadata = {
  title: "Đăng ký - Kircle",
};

export default function RegisterPage() {
  return <RegisterContainer />;
}
