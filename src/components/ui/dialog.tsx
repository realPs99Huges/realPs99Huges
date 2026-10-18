"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

/** Accessible modal built on the native <dialog> element (focus trap, Esc, backdrop). */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-1.5rem)] max-h-[calc(100dvh-2rem)] overflow-visible rounded-2xl border border-line bg-surface p-0 text-ink shadow-modal open:animate-rise",
        size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl",
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-ink-3">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="-mr-1.5 rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Schließen">
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5 sm:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
