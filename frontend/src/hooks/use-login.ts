"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { authService } from "@/services/auth.service";
import type { LoginPayload } from "@/types/auth";

interface ResendNotice {
  type: "success" | "error";
  text: string;
}

const RESEND_SUCCESS_MESSAGE = "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư (kể cả thư rác) và bấm vào liên kết.";

export const useLogin = (redirectTo: string) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<ResendNotice | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({ defaultValues: { identifier: "", password: "" } });

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    setServerError(null);
    setNeedsVerification(false);
    setResendNotice(null);
    try {
      await authService.login({ identifier: identifier.trim(), password });
      setIsRedirecting(true);
      router.replace(redirectTo);
    } catch (error) {
      setNeedsVerification(error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED");
      setServerError(getErrorMessage(error));
    }
  });

  const resendVerificationEmail = async () => {
    const { identifier, password } = getValues();
    setIsResending(true);
    setResendNotice(null);
    try {
      await authService.resendVerificationEmail({ identifier: identifier.trim(), password });
      setResendNotice({ type: "success", text: RESEND_SUCCESS_MESSAGE });
    } catch (error) {
      setResendNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setIsResending(false);
    }
  };

  return {
    register,
    errors,
    onSubmit,
    serverError,
    isLoading: isSubmitting || isRedirecting,
    needsVerification,
    isResending,
    resendNotice,
    resendVerificationEmail,
  };
};
