import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "info" | "danger" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
  outline: "border border-line-strong text-ink-2",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
