import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarRange, Check, Circle, Lightbulb, Megaphone, Smartphone, Sparkles, SquarePen, TriangleAlert } from "lucide-react";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages, fmt } from "@/i18n";
import { Card, CardBody, CardHeader, EmptyState, Notice } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { FormatLabel, PlatformMark, STATUS_DOT } from "@/components/content-badges";
import { ContentListItem } from "@/components/content/content-list-item";
import { listContent } from "@/server/content";
import { getDashboardStats, getWeeklyPlan } from "@/server/dashboard";
import { dailyImpulse } from "@/config/idea-bank";
import { currentHour, formatDate, startOfWeek, todayIso, weekDays } from "@/lib/dates";
import { isDemoMode } from "@/lib/ai";

export const metadata: Metadata = { title: "Übersicht" };

function studioLink(params: Record<string, string>) {
  return `/app/studio?${new URLSearchParams(params).toString()}`;
}

export default async function DashboardPage() {
  const t = getMessages();
  const d = t.dashboard;
  const { user, profile } = await requireAppContext();
  const today = todayIso();
  const weekStart = startOfWeek(today);
  const days = weekDays(today);

  const [weekItems, upcoming, stats, plan, recent] = await Promise.all([
    listContent(user.id, profile.id, { from: days[0], to: days[6], order: "schedule" }),
    listContent(user.id, profile.id, { from: today, statuses: ["idea", "draft", "ready", "scheduled"], order: "schedule", limit: 5 }),
    getDashboardStats(user, profile),
    getWeeklyPlan(user.id, profile.id, weekStart),
    listContent(user.id, profile.id, { limit: 10 }),
  ]);

  const hour = currentHour();
  const firstName = user.name.split(" ")[0];
  const greeting = fmt(hour < 11 ? d.greetingMorning : hour < 18 ? d.greetingDay : d.greetingEvening, { name: firstName });
  const todayItems = weekItems.filter((i) => i.scheduledDate === today);
  const planDay = plan?.days.find((day) => day.date === today && !day.rest);
  const impulse = dailyImpulse(profile.industry, today, recent.map((r) => r.topic));
  const checklistItems = Object.entries(stats.checklist) as [keyof typeof d.checklist, boolean][];
  const checklistDone = checklistItems.filter(([, done]) => done).length;
  const checklistHref: Record<keyof typeof d.checklist, string> = {
    profile: "/app/brand",
    firstContent: "/app/studio",
    calendar: "/app/calendar",
    plan: "/app/planner",
    voice: "/app/brand#voice",
    performance: "/app/performance",
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-ink-3">{formatDate(today, "de-DE", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 font-display text-[1.875rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">{greeting}</h1>
        </div>
        <ButtonLink href="/app/studio" size="lg" icon={<Sparkles className="size-4" />}>
          {t.nav.createContent}
        </ButtonLink>
      </header>

      {isDemoMode() && (
        <Notice tone="warning" icon={<TriangleAlert />}>
          <span className="font-semibold">{d.demoModeTitle}.</span> {d.demoModeText}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Today */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/8 blur-2xl" />
          <CardHeader
            title={d.todayTitle}
            description={todayItems.length ? d.todayScheduled : planDay ? d.todayFromPlan : d.todayImpulse}
            icon={<Lightbulb className="size-4 text-accent" />}
          />
          <CardBody>
            {todayItems.length > 0 ? (
              <ul className="-mx-2 flex flex-col">
                {todayItems.map((item) => (
                  <li key={item.id}>
                    <ContentListItem item={item} showDate={false} />
                  </li>
                ))}
              </ul>
            ) : planDay ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformMark platform={planDay.platform} />
                  <FormatLabel format={planDay.format} />
                </div>
                <p className="mt-3 font-display text-xl font-semibold text-ink">{planDay.topic}</p>
                {planDay.hook && <p className="mt-2 border-l-2 border-accent/40 pl-3 text-ink-2">{planDay.hook}</p>}
                <div className="mt-5 flex flex-wrap gap-2">
                  {planDay.savedContentId ? (
                    <ButtonLink href={`/app/content/${planDay.savedContentId}`} variant="secondary">
                      {d.openItem}
                    </ButtonLink>
                  ) : (
                    <ButtonLink href={studioLink({ topic: planDay.topic, format: planDay.format, objective: planDay.goal, platform: planDay.platform, date: today })} icon={<Sparkles className="size-4" />}>
                      {d.createFromThis}
                    </ButtonLink>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <FormatLabel format={impulse.format} />
                <p className="mt-3 font-display text-xl font-semibold text-ink">{impulse.topic}</p>
                <p className="mt-2 text-sm text-ink-2">{impulse.why}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <ButtonLink href={studioLink({ topic: impulse.topic, format: impulse.format, objective: impulse.objective, date: today })} icon={<Sparkles className="size-4" />}>
                    {d.createFromThis}
                  </ButtonLink>
                  <span className="text-xs text-ink-3">{d.todayImpulseNote}</span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Checklist or quick actions */}
        {checklistDone < checklistItems.length ? (
          <Card>
            <CardHeader title={d.checklistTitle} description={d.checklistSub} action={<span className="text-xs font-semibold text-ink-3">{checklistDone}/{checklistItems.length}</span>} />
            <CardBody className="pt-3">
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(checklistDone / checklistItems.length) * 100}%` }} />
              </div>
              <ul className="-mx-2 flex flex-col">
                {checklistItems.map(([key, done]) => (
                  <li key={key}>
                    <Link href={checklistHref[key]} className={cn("flex items-center gap-3 rounded-lg px-2 py-2 text-sm", done ? "text-ink-3" : "text-ink hover:bg-surface-2")}>
                      {done ? (
                        <span className="grid size-5 place-items-center rounded-full bg-success text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      ) : (
                        <Circle className="size-5 text-line-strong" />
                      )}
                      <span className={cn(done && "line-through decoration-ink-3/40")}>{d.checklist[key]}</span>
                      {!done && <ArrowRight className="ml-auto size-3.5 text-ink-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ) : (
          <QuickActions />
        )}
      </div>

      {/* Week */}
      <Card>
        <CardHeader
          title={d.weekTitle}
          icon={<CalendarRange className="size-4" />}
          action={
            <div className="flex gap-1">
              <ButtonLink href="/app/planner" variant="ghost" size="sm">
                {d.planWeek}
              </ButtonLink>
              <ButtonLink href="/app/calendar" variant="ghost" size="sm">
                {d.openCalendar}
              </ButtonLink>
            </div>
          }
        />
        <CardBody>
          <div className="-mx-1 grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, index) => {
              const items = weekItems.filter((i) => i.scheduledDate === day);
              const planned = plan?.days.find((p) => p.date === day && !p.rest && !p.savedContentId);
              const isToday = day === today;
              return (
                <Link
                  key={day}
                  href={`/app/calendar?view=week&date=${day}`}
                  className={cn(
                    "flex min-h-28 flex-col rounded-xl border p-1.5 transition-colors hover:border-line-strong sm:p-2.5",
                    isToday ? "border-accent/40 bg-accent-soft/50" : "border-line bg-surface-2/40",
                    day < today && "opacity-70",
                  )}
                >
                  <span className="flex flex-col items-center sm:flex-row sm:items-baseline sm:justify-between">
                    <span className={cn("text-[0.6875rem] font-semibold uppercase", isToday ? "text-accent-strong" : "text-ink-3")}>{t.calendar.weekdaysShort[index]}</span>
                    <span className={cn("text-sm font-semibold", isToday ? "text-accent-strong" : "text-ink")}>{Number(day.slice(8))}</span>
                  </span>
                  <span className="mt-2 flex flex-col gap-1">
                    {items.slice(0, 3).map((item) => (
                      <span key={item.id} className="flex items-center justify-center gap-1.5 rounded-md bg-surface px-1.5 py-1 shadow-card md:justify-start">
                        <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[item.status])} />
                        <span className="hidden truncate text-[0.6875rem] text-ink-2 md:block">{item.title}</span>
                      </span>
                    ))}
                    {items.length > 3 && <span className="text-[0.625rem] text-ink-3">{fmt(t.calendar.moreItems, { count: items.length - 3 })}</span>}
                    {planned && (
                      <span className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong px-1.5 py-1 md:justify-start">
                        <span className="size-1.5 shrink-0 rounded-full border border-ink-3" />
                        <span className="hidden truncate text-[0.6875rem] text-ink-3 md:block">{planned.topic}</span>
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          {weekItems.length === 0 && !plan && <p className="mt-4 text-sm text-ink-3">{d.weekEmpty}</p>}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title={d.upcomingTitle} />
          <CardBody className="pt-3">
            {upcoming.length ? (
              <ul className="-mx-2 flex flex-col">
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <ContentListItem item={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={d.upcomingEmpty} className="py-8" action={<ButtonLink href="/app/calendar" variant="secondary" size="sm">{d.openCalendar}</ButtonLink>} />
            )}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-6">
          {checklistDone < checklistItems.length && <QuickActions />}
          <Card>
            <CardHeader title={d.statsTitle} />
            <CardBody>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  [d.statGenerated, stats.generatedThisMonth],
                  [d.statDrafts, stats.draftsAndIdeas],
                  [d.statReady, stats.ready],
                  [d.statPublished, stats.published],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-xl bg-surface-2/70 px-4 py-3">
                    <dt className="text-xs text-ink-3">{label}</dt>
                    <dd className="mt-1 font-display text-2xl font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const d = getMessages().dashboard;
  const actions = [
    { href: "/app/studio?format=feed_post", icon: SquarePen, title: d.quickPost, text: d.quickPostText },
    { href: "/app/studio?format=story", icon: Smartphone, title: d.quickStory, text: d.quickStoryText },
    { href: "/app/ideas?tab=campaigns&new=1", icon: Megaphone, title: d.quickCampaign, text: d.quickCampaignText },
  ];
  return (
    <Card>
      <CardHeader title={d.quickTitle} />
      <CardBody className="grid gap-2 pt-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors hover:border-line-strong hover:bg-surface-2/60">
            <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent-strong">
              <a.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{a.title}</span>
              <span className="block truncate text-xs text-ink-3">{a.text}</span>
            </span>
            <ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}
