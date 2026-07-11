import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

export const navigationItems = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/users", key: "users", icon: Users },
  { href: "/products", key: "products", icon: Boxes },
  { href: "/orders", key: "orders", icon: ShoppingCart },
  { href: "/analytics", key: "analytics", icon: BarChart3 },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export type NavigationKey = (typeof navigationItems)[number]["key"];

export function getActiveNavigation(pathname: string) {
  return navigationItems.find(({ href }) =>
    href === "/" ? pathname === href : pathname.startsWith(href),
  );
}
