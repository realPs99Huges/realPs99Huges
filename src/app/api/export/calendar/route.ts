import type { NextRequest } from "next/server";
import { getActiveProfile, getCurrentUser } from "@/lib/auth/session";
import { listContent } from "@/server/content";
import { getMessages } from "@/i18n";
import { addDays, APP_TIME_ZONE, isIsoDate, todayIso } from "@/lib/dates";
import type { ContentItem } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  // Prefix formula-like values to prevent CSV injection in spreadsheet apps.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function toCsv(items: ContentItem[]): string {
  const t = getMessages();
  const header = ["Datum", "Uhrzeit", "Titel", "Plattform", "Format", "Status", "Hook", "Caption", "Call to Action", "Hashtags"];
  const rows = items.map((i) => [
    i.scheduledDate ?? "",
    i.scheduledTime ?? "",
    i.title,
    t.options.platforms[i.platform as keyof typeof t.options.platforms] ?? i.platform,
    t.options.formats[i.format as keyof typeof t.options.formats] ?? i.format,
    t.options.statuses[i.status as keyof typeof t.options.statuses] ?? i.status,
    i.hook,
    i.caption,
    i.cta,
    i.hashtags.join(" "),
  ]);
  return "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function toIcs(items: ContentItem[], host: string): string {
  const t = getMessages();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = items
    .filter((i) => i.scheduledDate)
    .map((i) => {
      const date = i.scheduledDate!.replace(/-/g, "");
      const timing = i.scheduledTime
        ? `DTSTART;TZID=${APP_TIME_ZONE}:${date}T${i.scheduledTime.replace(":", "")}00\r\nDURATION:PT30M`
        : `DTSTART;VALUE=DATE:${date}\r\nDTEND;VALUE=DATE:${addDays(i.scheduledDate!, 1).replace(/-/g, "")}`;
      const platform = t.options.platforms[i.platform as keyof typeof t.options.platforms] ?? i.platform;
      return [
        "BEGIN:VEVENT",
        `UID:${i.id}@postpilot`,
        `DTSTAMP:${stamp}`,
        timing,
        `SUMMARY:${icsText(`${platform}: ${i.title}`)}`,
        `DESCRIPTION:${icsText([i.hook, i.caption, i.hashtags.join(" ")].filter(Boolean).join("\n\n"))}`,
        `URL:${host}/app/content/${i.id}`,
        "END:VEVENT",
      ].join("\r\n");
    });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PostPilot//Content Plan//DE", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const profile = await getActiveProfile(user);
  if (!profile) return new Response("No profile", { status: 404 });
  const params = request.nextUrl.searchParams;
  const from = isIsoDate(params.get("from")) ? params.get("from")! : todayIso();
  const to = isIsoDate(params.get("to")) ? params.get("to")! : addDays(from, 30);
  const items = await listContent(user.id, profile.id, { from, to, order: "schedule" });
  const format = params.get("format") === "ics" ? "ics" : "csv";
  const body = format === "ics" ? toIcs(items, request.nextUrl.origin) : toCsv(items);
  return new Response(body, {
    headers: {
      "Content-Type": format === "ics" ? "text/calendar; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="postpilot-plan-${from}-bis-${to}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}
