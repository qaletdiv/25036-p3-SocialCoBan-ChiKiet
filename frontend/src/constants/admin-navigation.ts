import { Flag, LayoutDashboard, Users } from "lucide-react";
import type { NavigationItem } from "@/constants/navigation";

export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard, enabled: true },
  { label: "Quản lý người dùng", href: "/admin/users", icon: Users, enabled: true },
  { label: "Quản lý báo cáo", href: "/admin/reports", icon: Flag, enabled: true },
];

export const isAdminNavigationActive = (pathname: string, href: string): boolean => pathname === href;
