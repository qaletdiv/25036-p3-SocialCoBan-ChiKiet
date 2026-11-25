const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const googleLoginUrl = (redirectTo: string): string => {
  const url = new URL("/api/auth/google", new URL(API_BASE_URL).origin);
  url.searchParams.set("redirect", redirectTo);
  return url.toString();
};
