"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { LOGIN_PATH } from "@/lib/redirect";
import { authService } from "@/services/auth.service";
import type { RegisterFormValues } from "@/types/auth";

export const useRegister = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { fullName: "", username: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authService.register({
        ...values,
        fullName: values.fullName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      });
      setIsRedirecting(true);
      router.replace(`${LOGIN_PATH}?registered=1`);
    } catch (error) {
      const isEmailConflict =
        error instanceof ApiError &&
        (error.code === "EMAIL_ALREADY_EXISTS" || error.code === "EMAIL_PENDING_VERIFICATION");
      if (isEmailConflict) {
        setError("email", { message: getErrorMessage(error) }, { shouldFocus: true });
        return;
      }
      if (error instanceof ApiError && error.code === "USERNAME_ALREADY_EXISTS") {
        setError("username", { message: getErrorMessage(error) }, { shouldFocus: true });
        return;
      }
      setServerError(getErrorMessage(error));
    }
  });

  return {
    register,
    errors,
    onSubmit,
    passwordValue,
    serverError,
    isLoading: isSubmitting || isRedirecting,
  };
};
