"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { ContentItem } from "@/lib/db/schema";
import { FormatIcon, PlatformMark, SourceBadge, StatusBadge } from "@/components/content-badges";
import { formatDate } from "@/lib/dates";
import { useT } from "@/components/i18n-provider";

export function ContentListItem({ item, compact, showDate = true }: { item: Pick<ContentItem, "id" | "title" | "platform" | "format" | "status" | "scheduledDate" | "scheduledTime" | "source" | "isFavorite" | "hook">; compact?: boolean; showDate?: boolean }) {
  const t = useT();
  return (
    <Link href={`/app/content/${item.id}`} className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2 group-hover:bg-surface">
        <FormatIcon format={item.format} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-ink">{item.title}</span>
          {item.isFavorite && <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label={t.editor.favorite} />}
        </span>
        {!compact && item.hook && <span className="mt-0.5 line-clamp-1 block text-xs text-ink-3">{item.hook}</span>}
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <PlatformMark platform={item.platform} className="size-4 text-[0.5rem]" />
          <StatusBadge status={item.status} />
          <SourceBadge source={item.source} />
          {showDate && item.scheduledDate && (
            <span className="text-xs text-ink-3">
              {formatDate(item.scheduledDate, "de-DE", { weekday: "short", day: "numeric", month: "short" })}
              {item.scheduledTime ? `, ${item.scheduledTime}` : ""}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
