import { cn } from "./ui/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" className="fill-ink" />
      <path
        d="M11 23.5V10.5h6a4.5 4.5 0 0 1 0 9h-6"
        fill="none"
        className="stroke-bg"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23.6" cy="8.4" r="2.4" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.2rem] font-semibold leading-none text-ink">PostPilot</span>
    </span>
  );
}
