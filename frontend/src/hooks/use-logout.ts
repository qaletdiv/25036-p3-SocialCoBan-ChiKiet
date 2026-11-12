"use client";

import { useState } from "react";
import { LOGIN_PATH } from "@/lib/redirect";
import { authService } from "@/services/auth.service";

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      // A client-side navigation restores the login page still stuck on "Đang đăng nhập..."
      window.location.replace(LOGIN_PATH);
    }
  };

  return { logout, isLoggingOut };
};
