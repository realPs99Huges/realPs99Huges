"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarCheck, CalendarPlus, Coffee, Lightbulb, RefreshCw, Sparkles, TriangleAlert, Wand2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, Notice, PageHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { FormatLabel, PlatformMark } from "@/components/content-badges";
import { GeneratingIndicator } from "@/components/studio/generating-indicator";
import { POSTING_FREQUENCIES } from "@/config/options";
import { addDays, formatDate, weekdayIndex } from "@/lib/dates";
import type { PlanDay } from "@/lib/db/schema";
import { generatePlanAction, regenerateDayAction, transferAllAction, transferDayAction } from "@/server/actions/planner";

type Plan = { id: string; frequency: number; focus: string; days: PlanDay[]; source: string };

export function PlannerView({
  weekStart,
  thisWeek,
  nextWeek,
  today,
  plan: initialPlan,
  defaultFrequency,
  demoMode,
  limitReached,
}: {
  weekStart: string;
  thisWeek: string;
  nextWeek: string;
  today: string;
  plan: Plan | null;
  defaultFrequency: number;
  demoMode: boolean;
  limitReached: boolean;
}) {
  const t = useT();
  const p = t.planner;
  const router = useRouter();
  const toast = useToast();
  const [plan, setPlan] = useState(initialPlan);
  const [frequency, setFrequency] = useState(initialPlan?.frequency ?? defaultFrequency);
  const [focus, setFocus] = useState(initialPlan?.focus ?? "");
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, startGenerate] = useTransition();
  const [, startDay] = useTransition();

  function generate() {
    setError(null);
    startGenerate(async () => {
      const res = await generatePlanAction({ weekStart, frequency, focus });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function updateDay(day: PlanDay) {
    setPlan((current) => (current ? { ...current, days: current.days.map((d) => (d.date === day.date ? day : d)) } : current));
  }

  function regenerateDay(date: string) {
    if (!plan) return;
    setBusyDay(date);
    startDay(async () => {
      const res = await regenerateDayAction({ planId: plan.id, date });
      setBusyDay(null);
      if (!res.ok) return toast.error(res.error);
      updateDay(res.data);
    });
  }

  function transfer(day: PlanDay, mode: "idea" | "calendar") {
    if (!plan) return;
    setBusyDay(day.date);
    startDay(async () => {
      const res = await transferDayAction({ planId: plan.id, date: day.date, mode });
      setBusyDay(null);
      if (!res.ok) return toast.error(res.error);
      updateDay({ ...day, savedContentId: res.data.contentId });
      toast.success(mode === "idea" ? p.ideaSaved : `${p.inCalendar}: ${formatDate(day.date)}`);
      router.refresh();
    });
  }

  function transferAll() {
    if (!plan) return;
    startGenerate(async () => {
      const res = await transferAllAction(plan.id);
      if (!res.ok) return toast.error(res.error);
      toast.success(res.data.message);
      router.refresh();
    });
  }

  const openDays = plan?.days.filter((d) => !d.rest && !d.savedContentId).length ?? 0;
  const weekLabel = `${formatDate(weekStart, "de-DE", { day: "numeric", month: "short" })} – ${formatDate(addDays(weekStart, 6), "de-DE", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <PageHeader
        title={p.title}
        description={p.subtitle}
        actions={
          <div className="inline-flex rounded-xl border border-line-strong bg-surface p-0.5 shadow-card">
            {[
              [thisWeek, p.thisWeek],
              [nextWeek, p.nextWeek],
            ].map(([week, label]) => (
              <Link key={week} href={`/app/planner?week=${week}`} className={cn("rounded-[0.6rem] px-3 py-1.5 text-sm font-medium", weekStart === week ? "bg-ink text-bg" : "text-ink-2 hover:text-ink")}>
                {label}
              </Link>
            ))}
          </div>
        }
      />

      <Card className="mb-6 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-end">
          <Field label={p.frequency} help={p.frequencyHelp}>
            <div role="radiogroup" aria-label={p.frequency} className="flex flex-wrap gap-1.5">
              {POSTING_FREQUENCIES.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={frequency === n}
                  onClick={() => setFrequency(n)}
                  className={cn("h-10 min-w-12 rounded-xl border px-3 text-sm font-semibold transition-colors", frequency === n ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface text-ink-2 hover:text-ink")}
                >
                  {n}×
                </button>
              ))}
            </div>
          </Field>
          <Field label={p.focus} htmlFor="pl-focus" optional>
            <Input id="pl-focus" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder={p.focusPlaceholder} maxLength={300} />
          </Field>
          <Button size="lg" onClick={generate} loading={generating} disabled={limitReached} icon={plan ? <RefreshCw className="size-4" /> : <Wand2 className="size-4" />}>
            {plan ? p.regenerateAll : p.generate}
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {demoMode && <Notice tone="warning" icon={<TriangleAlert />}>{t.dashboard.demoModeText}</Notice>}
          {limitReached && (
            <Notice tone="warning" icon={<TriangleAlert />}>
              {t.billing.limitReached} <Link href="/app/settings/billing">{t.common.seePlans}</Link>
            </Notice>
          )}
          {error && <Notice tone="warning" icon={<TriangleAlert />}>{error}</Notice>}
          {generating && <GeneratingIndicator />}
        </div>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold text-ink">
          {p.week}: {weekLabel}
          {plan?.source === "demo" && <Badge tone="warning" className="ml-2 align-middle">{t.common.demoBadge}</Badge>}
        </h2>
        {plan && openDays > 0 && (
          <Button variant="secondary" size="sm" icon={<CalendarPlus className="size-4" />} onClick={transferAll} disabled={generating}>
            {p.allToCalendar}
          </Button>
        )}
      </div>

      {!plan ? (
        <EmptyState icon={<Sparkles className="size-5" />} title={p.empty} text={p.emptyText} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plan.days.map((day) => (
            <DayCard
              key={day.date}
              day={day}
              past={day.date < today}
              isToday={day.date === today}
              busy={busyDay === day.date}
              onRegenerate={() => regenerateDay(day.date)}
              onTransfer={(mode) => transfer(day, mode)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DayCard({
  day,
  past,
  isToday,
  busy,
  onRegenerate,
  onTransfer,
}: {
  day: PlanDay;
  past: boolean;
  isToday: boolean;
  busy: boolean;
  onRegenerate: () => void;
  onTransfer: (mode: "idea" | "calendar") => void;
}) {
  const t = useT();
  const p = t.planner;
  const weekday = t.calendar.weekdaysLong[weekdayIndex(day.date)];
  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className={cn("text-sm font-semibold", isToday ? "text-accent" : "text-ink")}>
        {weekday}
        <span className="ml-1.5 font-normal text-ink-3">{formatDate(day.date, "de-DE", { day: "numeric", month: "short" })}</span>
      </p>
      {!day.rest && (
        <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={busy || !!day.savedContentId} icon={<RefreshCw className={cn("size-3.5", busy && "animate-spin")} />} aria-label={p.regenerateDay}>
          <span className="hidden sm:inline">{p.regenerateDay}</span>
        </Button>
      )}
    </div>
  );

  if (day.rest) {
    return (
      <div className={cn("flex flex-col rounded-card border border-dashed border-line-strong p-4", past && "opacity-60")}>
        {header}
        <div className="mt-6 flex flex-1 flex-col items-center justify-center pb-4 text-center">
          <Coffee className="size-5 text-ink-3" />
          <p className="mt-2 text-sm font-medium text-ink-2">{p.restDay}</p>
          <p className="mt-1 max-w-[16rem] text-xs text-ink-3">{p.restDayText}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("flex flex-col p-4 transition-opacity", busy && "opacity-60", past && "opacity-70", isToday && "ring-1 ring-accent/40")}>
      {header}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PlatformMark platform={day.platform} />
        <FormatLabel format={day.format} />
        <Badge tone="outline">{t.options.objectives[day.goal as keyof typeof t.options.objectives] ?? day.goal}</Badge>
      </div>
      <p className="mt-3 font-semibold leading-snug text-ink">{day.topic}</p>
      <dl className="mt-3 flex flex-1 flex-col gap-2.5 text-sm">
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-3">{p.hook}</dt>
          <dd className="mt-0.5 text-ink">{day.hook}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-3">{p.idea}</dt>
          <dd className="mt-0.5 text-ink-2">{day.idea}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-3">{p.cta}</dt>
          <dd className="mt-0.5 text-ink-2">{day.cta}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
        {day.savedContentId ? (
          <>
            <Badge tone="success" icon={<CalendarCheck className="size-3" />}>
              {p.transferredBadge}
            </Badge>
            <ButtonLink href={`/app/content/${day.savedContentId}`} variant="ghost" size="sm" className="ml-auto">
              {t.common.open}
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink
              href={`/app/studio?${new URLSearchParams({ topic: day.topic, format: day.format, objective: day.goal, platform: day.platform, date: day.date })}`}
              size="sm"
              icon={<Sparkles className="size-3.5" />}
            >
              {p.develop}
            </ButtonLink>
            <Button variant="secondary" size="sm" onClick={() => onTransfer("calendar")} disabled={busy} icon={<CalendarPlus className="size-3.5" />}>
              {p.toCalendar}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onTransfer("idea")} disabled={busy} icon={<Lightbulb className="size-3.5" />}>
              {p.saveIdea}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

