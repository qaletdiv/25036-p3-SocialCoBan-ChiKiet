import { Compass, Home, MessageCircle, UserRound, type LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Bảng tin", href: "/newsfeed", icon: Home, enabled: true },
  { label: "Khám phá", href: "/explore", icon: Compass, enabled: true },
  { label: "Tin nhắn", href: "/messages", icon: MessageCircle, enabled: true },
  { label: "Trang cá nhân", href: "/profile", icon: UserRound, enabled: true },
];

export const COMING_SOON_LABEL = "Sắp ra mắt";

export const userProfilePath = (userId: string): string => `/users/${userId}`;

export const messagesPath = (conversationId?: string): string =>
  conversationId ? `/messages?c=${conversationId}` : "/messages";

export const isNavigationActive = (pathname: string, href: string, userId: string): boolean => {
  if (href === "/profile") return pathname === "/profile" || pathname === userProfilePath(userId);
  return pathname === href;
};
