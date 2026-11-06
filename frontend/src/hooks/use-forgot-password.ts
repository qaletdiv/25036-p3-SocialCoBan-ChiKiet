"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/lib/error-messages";
import { authService } from "@/services/auth.service";
import type { ForgotPasswordFormValues } from "@/types/auth";

export const useForgotPassword = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ defaultValues: { email: "" } });

  // The same outcome is shown whether or not the email belongs to an account
  const onSubmit = handleSubmit(async ({ email }) => {
    setServerError(null);
    setIsSent(false);
    try {
      await authService.forgotPassword(email.trim());
      setIsSent(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return { register, errors, onSubmit, serverError, isSent, isLoading: isSubmitting };
};
