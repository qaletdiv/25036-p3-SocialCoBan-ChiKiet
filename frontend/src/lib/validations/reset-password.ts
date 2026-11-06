import { isStrongPassword } from "@/lib/validations/common";
import type { ResetPasswordFormValues } from "@/types/auth";

export const resetPasswordValidation = {
  password: {
    required: "Vui lòng nhập mật khẩu mới.",
    validate: (value: string) => isStrongPassword(value) || "Mật khẩu chưa đáp ứng đủ các yêu cầu bên dưới.",
  },
  confirmPassword: {
    required: "Vui lòng nhập lại mật khẩu mới.",
    validate: (value: string, formValues: ResetPasswordFormValues) =>
      value === formValues.password || "Mật khẩu nhập lại không khớp.",
  },
} as const;
