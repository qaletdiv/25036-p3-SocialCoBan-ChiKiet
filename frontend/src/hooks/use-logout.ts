"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_PATH } from "@/lib/redirect";
import { authService } from "@/services/auth.service";

export const useLogout = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      router.replace(LOGIN_PATH);
    }
  };

  return { logout, isLoggingOut };
};
