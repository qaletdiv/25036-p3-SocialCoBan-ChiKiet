import { apiRequest } from "@/lib/api-client";
import type { AuthUser, LoginPayload, RegisterPayload, ResetPasswordPayload } from "@/types/auth";

interface UserResponse {
  user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const data = await apiRequest<UserResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<void> {
    await apiRequest<{ email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resendVerificationEmail(payload: LoginPayload): Promise<void> {
    await apiRequest<null>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiRequest<null>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiRequest<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async validateResetToken(token: string): Promise<void> {
    await apiRequest<null>("/auth/reset-password/validate", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const data = await apiRequest<{ sessionRevocationToken: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.sessionRevocationToken;
  },

  async revokeSessions(token: string): Promise<void> {
    await apiRequest<null>("/auth/revoke-sessions", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async logout(): Promise<void> {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  },

  async getCurrentUser(): Promise<AuthUser> {
    const data = await apiRequest<UserResponse>("/auth/me");
    return data.user;
  },
};
