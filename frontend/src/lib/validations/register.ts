import { USERNAME_MAX_LENGTH, USERNAME_PATTERN, USERNAME_RULE_MESSAGE } from "@/constants/username";
import { EMAIL_PATTERN, isStrongPassword } from "@/lib/validations/common";
import type { RegisterFormValues } from "@/types/auth";

export const registerValidation = {
  fullName: {
    validate: (value: string) => value.trim().length > 0 || "Vui lòng nhập họ và tên.",
    maxLength: { value: 100, message: "Họ và tên không được vượt quá 100 ký tự." },
  },
  username: {
    required: "Vui lòng nhập tên đăng nhập.",
    maxLength: { value: USERNAME_MAX_LENGTH, message: USERNAME_RULE_MESSAGE },
    validate: (value: string) => USERNAME_PATTERN.test(value.trim()) || USERNAME_RULE_MESSAGE,
  },
  email: {
    required: "Vui lòng nhập email.",
    maxLength: { value: 255, message: "Email không được vượt quá 255 ký tự." },
    validate: (value: string) => EMAIL_PATTERN.test(value.trim()) || "Email không đúng định dạng.",
  },
  password: {
    required: "Vui lòng nhập mật khẩu.",
    validate: (value: string) => isStrongPassword(value) || "Mật khẩu chưa đáp ứng đủ các yêu cầu bên dưới.",
  },
  confirmPassword: {
    required: "Vui lòng nhập lại mật khẩu.",
    validate: (value: string, formValues: RegisterFormValues) =>
      value === formValues.password || "Mật khẩu nhập lại không khớp.",
  },
} as const;
