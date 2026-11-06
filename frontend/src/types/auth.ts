export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterPayload = RegisterFormValues;

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload extends ResetPasswordFormValues {
  token: string;
}
