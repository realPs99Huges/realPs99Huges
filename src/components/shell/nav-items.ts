import { BarChart3, CalendarDays, CalendarRange, LayoutDashboard, Lightbulb, Palette, Settings, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/app", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/studio", key: "studio", icon: Sparkles },
  { href: "/app/calendar", key: "calendar", icon: CalendarDays },
  { href: "/app/planner", key: "planner", icon: CalendarRange },
  { href: "/app/ideas", key: "ideas", icon: Lightbulb },
  { href: "/app/performance", key: "performance", icon: BarChart3 },
  { href: "/app/brand", key: "brand", icon: Palette },
  { href: "/app/settings", key: "settings", icon: Settings },
] as const;

export const MOBILE_PRIMARY = ["dashboard", "calendar", "planner", "ideas"] as const;
