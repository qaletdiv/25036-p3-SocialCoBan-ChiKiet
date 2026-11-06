export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Ít nhất 8 ký tự", test: (value: string) => value.length >= 8 },
  { id: "lowercase", label: "Có chữ thường (a-z)", test: (value: string) => /[a-z]/.test(value) },
  { id: "uppercase", label: "Có chữ hoa (A-Z)", test: (value: string) => /[A-Z]/.test(value) },
  { id: "digit", label: "Có chữ số (0-9)", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "Có ký tự đặc biệt (ví dụ: @, #, !)", test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
] as const;

export const isStrongPassword = (value: string): boolean =>
  value.length <= 128 && PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value));
