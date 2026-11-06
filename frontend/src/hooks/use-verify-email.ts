"use client";

import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error-messages";
import { authService } from "@/services/auth.service";

type VerifyStatus = "verifying" | "success" | "error";

interface VerifyState {
  status: VerifyStatus;
  errorMessage: string | null;
}

const MISSING_TOKEN_MESSAGE = "Liên kết xác thực không hợp lệ hoặc đã hết hạn.";

export const useVerifyEmail = (token: string | null): VerifyState => {
  const [state, setState] = useState<VerifyState>(
    token ? { status: "verifying", errorMessage: null } : { status: "error", errorMessage: MISSING_TOKEN_MESSAGE },
  );
  // A token is single-use, so the request must not run twice (e.g. strict mode double effects)
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;

    authService
      .verifyEmail(token)
      .then(() => setState({ status: "success", errorMessage: null }))
      .catch((error: unknown) => setState({ status: "error", errorMessage: getErrorMessage(error) }));
  }, [token]);

  return state;
};
