"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

export const useAuthUser = () => {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    setState({ status: "loading", user: null });
    try {
      const user = await authService.getCurrentUser();
      setState({ status: "authenticated", user });
    } catch (error) {
      const isUnauthorized = error instanceof ApiError && error.status === 401;
      setState({ status: isUnauthorized ? "unauthenticated" : "error", user: null });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setState((current) =>
      current.user ? { status: "authenticated", user: { ...current.user, ...patch } } : current,
    );
  }, []);

  return { ...state, refresh, updateUser };
};
