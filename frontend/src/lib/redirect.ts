export const DEFAULT_AUTHENTICATED_PATH = "/newsfeed";
export const LOGIN_PATH = "/login";

// Only same-origin relative paths are allowed to prevent open redirects
export const resolveSafeRedirect = (target: string | null): string => {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }
  return target;
};

export const buildLoginUrl = (returnTo: string): string =>
  `${LOGIN_PATH}?redirect=${encodeURIComponent(returnTo)}`;
