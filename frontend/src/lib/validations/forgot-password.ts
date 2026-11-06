import { EMAIL_PATTERN } from "@/lib/validations/common";

export const forgotPasswordValidation = {
  email: {
    required: "Vui lòng nhập email.",
    maxLength: { value: 255, message: "Email không được vượt quá 255 ký tự." },
    validate: (value: string) => EMAIL_PATTERN.test(value.trim()) || "Email không đúng định dạng.",
  },
} as const;
