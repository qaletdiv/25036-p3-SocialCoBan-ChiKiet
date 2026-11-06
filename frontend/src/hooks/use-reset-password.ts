"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { authService } from "@/services/auth.service";
import type { ResetPasswordFormValues } from "@/types/auth";

type TokenStatus = "checking" | "valid" | "invalid";
type ResetStep = "form" | "decision" | "done";
type SessionOutcome = "revoked" | "kept";

export const useResetPassword = (token: string | null) => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(token ? "checking" : "invalid");
  const [step, setStep] = useState<ResetStep>("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [revocationToken, setRevocationToken] = useState<string | null>(null);
  const [sessionOutcome, setSessionOutcome] = useState<SessionOutcome | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ defaultValues: { password: "", confirmPassword: "" } });

  const passwordValue = useWatch({ control, name: "password" });

  useEffect(() => {
    if (!token) return;
    authService
      .validateResetToken(token)
      .then(() => setTokenStatus("valid"))
      .catch((error: unknown) => {
        const isInvalidLink = error instanceof ApiError && error.code === "INVALID_RESET_TOKEN";
        // Network or server failures are not proof that the link is bad
        if (isInvalidLink) setTokenStatus("invalid");
        else {
          setTokenStatus("valid");
          setServerError(getErrorMessage(error));
        }
      });
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setServerError(null);
    try {
      setRevocationToken(await authService.resetPassword({ token, ...values }));
      setStep("decision");
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_RESET_TOKEN") {
        setTokenStatus("invalid");
        return;
      }
      setServerError(getErrorMessage(error));
    }
  });

  const revokeOtherSessions = async () => {
    if (!revocationToken) return;
    setIsRevoking(true);
    setRevokeError(null);
    try {
      await authService.revokeSessions(revocationToken);
      setSessionOutcome("revoked");
      setStep("done");
    } catch (error) {
      setRevokeError(getErrorMessage(error));
    } finally {
      setIsRevoking(false);
    }
  };

  const keepSessions = () => {
    setSessionOutcome("kept");
    setStep("done");
  };

  return {
    register,
    errors,
    onSubmit,
    passwordValue,
    serverError,
    isLoading: isSubmitting,
    tokenStatus,
    step,
    sessionOutcome,
    isRevoking,
    revokeError,
    revokeOtherSessions,
    keepSessions,
  };
};
