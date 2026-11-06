export const loginValidation = {
  identifier: {
    required: "Vui lòng nhập email hoặc tên đăng nhập.",
    maxLength: { value: 255, message: "Email hoặc tên đăng nhập không được vượt quá 255 ký tự." },
  },
  password: {
    required: "Vui lòng nhập mật khẩu.",
    maxLength: { value: 128, message: "Mật khẩu không được vượt quá 128 ký tự." },
  },
} as const;
