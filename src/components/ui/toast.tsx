"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "./cn";

type Toast = { id: number; message: string; tone: "success" | "error" };
type ToastApi = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"]) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === "error" ? 6000 : 3200);
  }, []);
  const region = useRef<HTMLDivElement>(null);
  // Render toasts in the browser top layer so they stay visible above modal <dialog>s.
  useEffect(() => {
    const el = region.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      if (toasts.length) {
        if (el.matches(":popover-open")) el.hidePopover();
        el.showPopover();
      } else if (el.matches(":popover-open")) {
        el.hidePopover();
      }
    } catch {
      // Popover API unsupported – the fixed-position fallback still applies.
    }
  }, [toasts]);
  const api = useMemo<ToastApi>(() => ({ success: (m) => push(m, "success"), error: (m) => push(m, "error") }), [push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        ref={region}
        popover="manual"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 top-auto z-[60] m-0 flex w-full flex-col items-center gap-2 overflow-visible border-0 bg-transparent p-0 px-4 lg:bottom-6 [&:not(:popover-open)]:flex"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-md animate-rise items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-modal",
              toast.tone === "error" ? "bg-danger text-white" : "bg-ink text-bg",
            )}
          >
            {toast.tone === "error" ? <TriangleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
