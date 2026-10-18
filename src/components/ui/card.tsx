import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-surface shadow-card", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 text-ink-3">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      {icon && <div className="mb-3 grid size-11 place-items-center rounded-xl bg-surface-2 text-ink-2">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-ink-3">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = "info",
  icon,
  children,
  className,
}: {
  tone?: "info" | "warning" | "success" | "accent" | "neutral";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
    accent: "bg-accent-soft text-accent-strong",
    neutral: "bg-surface-2 text-ink-2",
  };
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-relaxed", tones[tone], className)}>
      {icon && <span className="mt-0.5 shrink-0 [&>svg]:size-4">{icon}</span>}
      <div className="min-w-0 [&_a]:font-medium [&_a]:underline">{children}</div>
    </div>
  );
}
