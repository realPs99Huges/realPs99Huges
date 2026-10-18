"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Download, GripVertical, Plus } from "lucide-react";
import { Button, ButtonLink, buttonClass } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { FormatIcon, PlatformMark, STATUS_DOT } from "@/components/content-badges";
import { fmt } from "@/i18n";
import { PLATFORMS, STATUSES } from "@/config/options";
import { addDays, addMonths, formatDate, isoWeekNumber } from "@/lib/dates";
import { quickUpdateContentAction } from "@/server/actions/content";
import { CalendarItemDialog, type CalendarItem } from "./item-dialog";

type Props = {
  view: "week" | "month";
  anchor: string;
  today: string;
  days: string[];
  monthStart: string;
  monthEnd: string;
  platform: string;
  status: string;
  items: CalendarItem[];
  unscheduled: CalendarItem[];
  defaultPlatform: string;
};

export function CalendarView(props: Props) {
  const t = useT();
  const c = t.calendar;
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(props.items);
  const [unscheduled, setUnscheduled] = useState(props.unscheduled);
  const [dialog, setDialog] = useState<{ item: CalendarItem | null; date: string | null } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [, start] = useTransition();

  // Re-sync local (optimistic) state when the server sends fresh data.
  const [source, setSource] = useState({ items: props.items, unscheduled: props.unscheduled });
  if (source.items !== props.items || source.unscheduled !== props.unscheduled) {
    setSource({ items: props.items, unscheduled: props.unscheduled });
    setItems(props.items);
    setUnscheduled(props.unscheduled);
  }

  const href = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({ view: props.view, date: props.anchor, ...(props.platform && { platform: props.platform }), ...(props.status && { status: props.status }), ...overrides });
    for (const [k, v] of [...params.entries()]) if (!v) params.delete(k);
    return `/app/calendar?${params.toString()}`;
  };

  const step = (direction: 1 | -1) => (props.view === "month" ? addMonths(props.anchor, direction) : addDays(props.anchor, 7 * direction));

  const label =
    props.view === "month"
      ? `${c.months[Number(props.monthStart.slice(5, 7)) - 1]} ${props.monthStart.slice(0, 4)}`
      : `${formatDate(props.days[0], "de-DE", { day: "numeric", month: "short" })} – ${formatDate(props.days[6], "de-DE", { day: "numeric", month: "short", year: "numeric" })}`;

  function move(id: string, date: string | null) {
    const all = [...items, ...unscheduled];
    const item = all.find((i) => i.id === id);
    if (!item || item.scheduledDate === date) return;
    const moved = { ...item, scheduledDate: date, status: !date && item.status === "scheduled" ? "draft" : item.status };
    const previous = { items, unscheduled };
    setItems((list) => (date ? [...list.filter((i) => i.id !== id), moved] : list.filter((i) => i.id !== id)));
    setUnscheduled((list) => (date ? list.filter((i) => i.id !== id) : [moved, ...list.filter((i) => i.id !== id)]));
    start(async () => {
      const res = await quickUpdateContentAction({ id, scheduledDate: date, ...(moved.status !== item.status ? { status: moved.status as "draft" } : {}) });
      if (!res.ok) {
        setItems(previous.items);
        setUnscheduled(previous.unscheduled);
        toast.error(res.error);
        return;
      }
      toast.success(date ? `${c.moved}: ${formatDate(date, "de-DE", { weekday: "short", day: "numeric", month: "short" })}` : c.moved);
      router.refresh();
    });
  }

  const dropProps = (date: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("application/x-postpilot-item")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOver(date ?? "none");
    },
    onDragLeave: () => setDragOver(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(null);
      const id = e.dataTransfer.getData("application/x-postpilot-item");
      if (id) move(id, date);
    },
  });

  const byDate = (date: string) => items.filter((i) => i.scheduledDate === date).sort((a, b) => (a.scheduledTime ?? "99").localeCompare(b.scheduledTime ?? "99"));

  return (
    <>
      <PageHeader
        title={c.title}
        description={c.subtitle}
        actions={
          <>
            <details className="relative">
              <summary className={buttonClass("secondary", "md", "list-none marker:hidden")}>
                <Download className="size-4" /> {c.export}
              </summary>
              <div className="absolute right-0 z-20 mt-1.5 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-pop">
                <a className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href={`/api/export/calendar?format=csv&from=${props.days[0]}&to=${props.days[props.days.length - 1]}`}>
                  {c.exportCsv}
                </a>
                <a className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href={`/api/export/calendar?format=ics&from=${props.days[0]}&to=${props.days[props.days.length - 1]}`}>
                  {c.exportIcs}
                </a>
              </div>
            </details>
            <Button icon={<Plus className="size-4" />} onClick={() => setDialog({ item: null, date: props.view === "week" && props.days.includes(props.today) ? props.today : props.days.find((d) => d >= props.today) ?? props.days[0] })}>
              {c.newItem}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-line-strong bg-surface p-0.5 shadow-card" role="tablist" aria-label="Ansicht">
            {(["week", "month"] as const).map((v) => (
              <Link key={v} href={href({ view: v })} role="tab" aria-selected={props.view === v} className={cn("rounded-[0.6rem] px-3 py-1.5 text-sm font-medium", props.view === v ? "bg-ink text-bg" : "text-ink-2 hover:text-ink")}>
                {c[v]}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <ButtonLink href={href({ date: step(-1) })} variant="ghost" size="icon" aria-label={c.prev}>
              <ChevronLeft className="size-4" />
            </ButtonLink>
            <ButtonLink href={href({ date: props.today })} variant="secondary" size="sm">
              {c.today}
            </ButtonLink>
            <ButtonLink href={href({ date: step(1) })} variant="ghost" size="icon" aria-label={c.next}>
              <ChevronRight className="size-4" />
            </ButtonLink>
          </div>
          <h2 className="text-[0.9375rem] font-semibold text-ink">
            {label}
            {props.view === "week" && <span className="ml-2 text-sm font-normal text-ink-3">{fmt(c.weekLabel, { week: isoWeekNumber(props.days[0]) })}</span>}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select aria-label={t.studio.platform} value={props.platform} onChange={(e) => router.push(href({ platform: e.target.value }))} className="h-9 text-sm sm:w-48">
            <option value="">{c.allPlatforms}</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {t.options.platforms[p]}
              </option>
            ))}
          </Select>
          <Select aria-label={t.editor.status} value={props.status} onChange={(e) => router.push(href({ status: e.target.value }))} className="h-9 text-sm sm:w-40">
            <option value="">{c.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.options.statuses[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_15rem]">
        {props.view === "week" ? (
          <div className="grid gap-2 md:grid-cols-7">
            {props.days.map((day, index) => {
              const list = byDate(day);
              return (
                <section
                  key={day}
                  aria-label={formatDate(day, "de-DE", { weekday: "long", day: "numeric", month: "long" })}
                  {...dropProps(day)}
                  className={cn(
                    "group flex flex-col rounded-card border bg-surface p-2.5 transition-colors md:min-h-[26rem]",
                    day === props.today ? "border-accent/40" : "border-line",
                    dragOver === day && "border-accent bg-accent-soft/50",
                    day < props.today && "bg-surface/60",
                  )}
                >
                  <header className="mb-2 flex items-center justify-between px-0.5">
                    <span className="flex items-baseline gap-1.5">
                      <span className={cn("text-xs font-semibold uppercase", day === props.today ? "text-accent" : "text-ink-3")}>
                        <span className="md:hidden">{c.weekdaysLong[index]}</span>
                        <span className="hidden md:inline">{c.weekdaysShort[index]}</span>
                      </span>
                      <span className={cn("grid size-6 place-items-center rounded-full text-sm font-semibold", day === props.today ? "bg-accent text-accent-ink" : "text-ink")}>{Number(day.slice(8))}</span>
                    </span>
                    <button type="button" onClick={() => setDialog({ item: null, date: day })} className="rounded-md p-1 text-ink-3 opacity-100 hover:bg-surface-2 hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100" aria-label={`${c.newItem} ${formatDate(day)}`}>
                      <Plus className="size-4" />
                    </button>
                  </header>
                  <div className="flex flex-col gap-1.5">
                    {list.map((item) => (
                      <ItemChip key={item.id} item={item} onOpen={() => setDialog({ item, date: null })} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-line bg-surface-2/60">
              {c.weekdaysShort.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase text-ink-3">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {props.days.map((day) => {
                const list = byDate(day);
                const inMonth = day >= props.monthStart && day <= props.monthEnd;
                return (
                  <div
                    key={day}
                    {...dropProps(day)}
                    className={cn("group min-h-20 border-b border-r border-line p-1 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0", !inMonth && "bg-surface-2/40", dragOver === day && "bg-accent-soft/60")}
                  >
                    <div className="flex items-center justify-between">
                      <Link href={href({ view: "week", date: day })} className={cn("grid size-6 place-items-center rounded-full text-xs font-semibold", day === props.today ? "bg-accent text-accent-ink" : inMonth ? "text-ink hover:bg-surface-2" : "text-ink-3")}>
                        {Number(day.slice(8))}
                      </Link>
                      <button type="button" onClick={() => setDialog({ item: null, date: day })} className="hidden rounded p-0.5 text-ink-3 opacity-0 hover:text-ink group-hover:opacity-100 focus:opacity-100 sm:block" aria-label={`${c.newItem} ${formatDate(day)}`}>
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 hidden flex-col gap-1 sm:flex">
                      {list.slice(0, 3).map((item) => (
                        <ItemChip key={item.id} item={item} compact onOpen={() => setDialog({ item, date: null })} />
                      ))}
                      {list.length > 3 && (
                        <Link href={href({ view: "week", date: day })} className="px-1 text-[0.6875rem] text-ink-3 hover:text-ink">
                          {fmt(c.moreItems, { count: list.length - 3 })}
                        </Link>
                      )}
                    </div>
                    {list.length > 0 && (
                      <Link href={href({ view: "week", date: day })} className="mt-1 flex flex-wrap gap-0.5 sm:hidden" aria-label={`${list.length}`}>
                        {list.slice(0, 4).map((item) => (
                          <span key={item.id} className={cn("size-1.5 rounded-full", STATUS_DOT[item.status])} />
                        ))}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <aside {...dropProps(null)} className={cn("h-fit rounded-card border border-dashed border-line-strong p-3 transition-colors", dragOver === "none" && "border-accent bg-accent-soft/40")}>
          <p className="px-1 text-[0.8125rem] font-semibold text-ink">{c.unscheduled}</p>
          <p className="mb-3 mt-0.5 px-1 text-xs text-ink-3">{c.unscheduledHint}</p>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-1">
            {unscheduled.map((item) => (
              <ItemChip key={item.id} item={item} onOpen={() => setDialog({ item, date: null })} />
            ))}
            {!unscheduled.length && <p className="px-1 py-3 text-xs text-ink-3">—</p>}
          </div>
        </aside>
      </div>
      <p className="mt-4 hidden text-xs text-ink-3 md:block">{c.dragHint}</p>

      {dialog && (
        <CalendarItemDialog
          item={dialog.item}
          initialDate={dialog.date}
          defaultPlatform={props.defaultPlatform}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function ItemChip({ item, onOpen, compact }: { item: CalendarItem; onOpen: () => void; compact?: boolean }) {
  const t = useT();
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-postpilot-item", item.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
      className={cn(
        "group/item flex w-full items-start gap-1.5 rounded-lg border border-line bg-surface text-left shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-pop active:cursor-grabbing",
        compact ? "px-1.5 py-1" : "px-2 py-2",
      )}
      title={`${item.title} · ${t.options.statuses[item.status as keyof typeof t.options.statuses]}`}
    >
      {!compact && <GripVertical className="mt-0.5 hidden size-3.5 shrink-0 text-ink-3 opacity-0 group-hover/item:opacity-100 md:block" aria-hidden />}
      <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", STATUS_DOT[item.status])} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className={cn("block font-medium text-ink", compact ? "truncate text-[0.6875rem]" : "line-clamp-2 text-xs leading-snug")}>{item.title}</span>
        {!compact && (
          <span className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
            <PlatformMark platform={item.platform} className="size-4 text-[0.5rem]" />
            <FormatIcon format={item.format} className="size-3" />
            {item.scheduledTime && <span>{item.scheduledTime}</span>}

          </span>
        )}
      </span>
    </button>
  );
}
