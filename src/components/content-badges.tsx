"use client";

import { Film, Image as ImageIcon, Images, Smartphone, Video } from "lucide-react";
import { Badge, type BadgeTone } from "./ui/badge";
import { cn } from "./ui/cn";
import { useT } from "./i18n-provider";

const STATUS_TONES: Record<string, BadgeTone> = {
  idea: "neutral",
  draft: "warning",
  ready: "info",
  scheduled: "accent",
  published: "success",
};

export const STATUS_DOT: Record<string, string> = {
  idea: "bg-ink-3",
  draft: "bg-warning",
  ready: "bg-info",
  scheduled: "bg-accent",
  published: "bg-success",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useT();
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{t.options.statuses[status as keyof typeof t.options.statuses] ?? status}</Badge>;
}

const PLATFORM_SHORT: Record<string, string> = {
  instagram: "IG",
  facebook: "FB",
  tiktok: "TT",
  linkedin: "IN",
  youtube: "YT",
  pinterest: "PI",
  google_business: "G",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "bg-[#d6336c]",
  facebook: "bg-[#1f6feb]",
  tiktok: "bg-ink",
  linkedin: "bg-[#0a66c2]",
  youtube: "bg-[#e03131]",
  pinterest: "bg-[#c92a2a]",
  google_business: "bg-[#2f9e44]",
};

export function PlatformMark({ platform, className }: { platform: string; className?: string }) {
  const t = useT();
  const label = t.options.platforms[platform as keyof typeof t.options.platforms] ?? platform;
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-grid size-5 shrink-0 place-items-center rounded-md text-[0.5625rem] font-bold tracking-tight text-white",
        PLATFORM_COLOR[platform] ?? "bg-ink-3",
        platform === "tiktok" && "text-bg",
        className,
      )}
    >
      {PLATFORM_SHORT[platform] ?? "?"}
    </span>
  );
}

export function FormatIcon({ format, className }: { format: string; className?: string }) {
  const Icon = { feed_post: ImageIcon, reel: Film, story: Smartphone, carousel: Images, short_video: Video }[format] ?? ImageIcon;
  return <Icon className={cn("size-4", className)} aria-hidden />;
}

export function FormatLabel({ format }: { format: string }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <FormatIcon format={format} className="size-3.5 text-ink-3" />
      {t.options.formats[format as keyof typeof t.options.formats] ?? format}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const t = useT();
  if (source === "demo") return <Badge tone="warning">{t.common.demoBadge}</Badge>;
  if (source === "ai") return <Badge tone="accent">{t.common.aiBadge}</Badge>;
  return null;
}
