"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";
import { useT } from "@/components/i18n-provider";

export function CopyButton({ text, label, size = "sm", variant = "ghost" }: { text: string; label?: string; size?: "sm" | "md" | "icon"; variant?: "ghost" | "secondary" }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without async clipboard permission.
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <Button
      size={size}
      variant={variant}
      onClick={copy}
      disabled={!text}
      icon={copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      aria-label={size === "icon" ? (label ?? t.common.copy) : undefined}
    >
      {size === "icon" ? null : copied ? t.common.copied : (label ?? t.common.copy)}
    </Button>
  );
}
