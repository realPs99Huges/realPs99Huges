import type { Metadata } from "next";
import { requireAppContext } from "@/lib/auth/session";
import { listContent } from "@/server/content";
import { CalendarView } from "@/components/calendar/calendar-view";
import { endOfMonth, isIsoDate, monthGrid, startOfMonth, todayIso, weekDays } from "@/lib/dates";
import { PLATFORMS, STATUSES } from "@/config/options";

export const metadata: Metadata = { title: "Kalender" };

type Search = Record<string, string | undefined>;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { user, profile } = await requireAppContext();
  const params = await searchParams;
  const today = todayIso();
  const view = params.view === "month" ? "month" : "week";
  const anchor = isIsoDate(params.date) ? params.date : today;
  const platform = (PLATFORMS as readonly string[]).includes(params.platform ?? "") ? params.platform! : "";
  const status = (STATUSES as readonly string[]).includes(params.status ?? "") ? params.status! : "";
  const days = view === "month" ? monthGrid(anchor) : weekDays(anchor);
  const filter = { platform: platform || undefined, statuses: status ? [status] : undefined };

  const [items, unscheduled] = await Promise.all([
    listContent(user.id, profile.id, { ...filter, from: days[0], to: days[days.length - 1], order: "schedule" }),
    listContent(user.id, profile.id, { ...filter, unscheduled: true, statuses: status ? [status] : ["idea", "draft", "ready"], limit: 40 }),
  ]);

  const toClient = (i: (typeof items)[number]) => ({
    id: i.id,
    title: i.title,
    platform: i.platform,
    format: i.format,
    status: i.status,
    scheduledDate: i.scheduledDate,
    scheduledTime: i.scheduledTime,
    source: i.source,
  });

  return (
    <CalendarView
      view={view}
      anchor={anchor}
      today={today}
      days={days}
      monthStart={startOfMonth(anchor)}
      monthEnd={endOfMonth(anchor)}
      platform={platform}
      status={status}
      items={items.map(toClient)}
      unscheduled={unscheduled.map(toClient)}
      defaultPlatform={profile.platforms[0] ?? "instagram"}
    />
  );
}
