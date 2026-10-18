"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

const control =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-3 shadow-card transition-colors hover:border-ink-3/60 focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Field({
  label,
  htmlFor,
  help,
  error,
  optional,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[0.8125rem] font-medium text-ink-2">
          <span>{label}</span>
          {optional && <span className="text-xs font-normal text-ink-3">optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="text-xs text-ink-3">{help}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(control, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(control, "resize-y py-2.5 leading-relaxed", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-11 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
    </div>
  );
});

export function useFieldId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}

/** Toggle chips for single or multi select. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple,
  label,
  max,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (next: T[]) => void;
  multiple?: boolean;
  label: string;
  max?: number;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!multiple) return onChange([option.value]);
              if (active) return onChange(value.filter((v) => v !== option.value));
              if (max && value.length >= max) return;
              onChange([...value, option.value]);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
              active
                ? "border-ink bg-ink text-bg"
                : "border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
