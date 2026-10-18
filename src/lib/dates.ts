// Calendar dates are handled as ISO "YYYY-MM-DD" strings to avoid timezone drift.

export const APP_TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Europe/Berlin";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Today's date in the app time zone. */
export function todayIso(timeZone = APP_TIME_ZONE, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function currentHour(timeZone = APP_TIME_ZONE, now = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(now)) % 24;
}

function toUtc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(iso: string): number {
  return (toUtc(iso).getUTCDay() + 6) % 7;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function addMonths(iso: string, months: number): string {
  const d = toUtc(startOfMonth(iso));
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function daysInMonth(iso: string): number {
  const d = toUtc(startOfMonth(iso));
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return d.getUTCDate();
}

export function endOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-${String(daysInMonth(iso)).padStart(2, "0")}`;
}

/** Monday-based grid covering the whole month (5 or 6 weeks). */
export function monthGrid(iso: string): string[] {
  const first = startOfWeek(startOfMonth(iso));
  const last = addDays(startOfWeek(endOfMonth(iso)), 6);
  const days: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  return days;
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isoWeekNumber(iso: string): number {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + 3 - weekdayIndex(iso));
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

export function formatDate(iso: string, locale = "de-DE", options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "long", ...options }).format(toUtc(iso));
}

export function formatDateShort(iso: string, locale = "de-DE"): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit" }).format(
    toUtc(iso),
  );
}

/** First instant of the current month in the app time zone, as a UTC Date (approximation at day granularity). */
export function monthStartInstant(timeZone = APP_TIME_ZONE, now = new Date()): Date {
  const first = startOfMonth(todayIso(timeZone, now));
  return new Date(`${first}T00:00:00Z`);
}
