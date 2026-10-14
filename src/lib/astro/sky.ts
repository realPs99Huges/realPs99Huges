/**
 * Small, dependency-free astronomy helpers.
 *
 * Precision is deliberately modest: no ephemeris, no time zones. Birth times are
 * treated as UTC, which can shift results by up to half a day. Everything shown
 * to the visitor that comes from here is labelled as approximate.
 */
import { signByIndex, type ZodiacSign } from './zodiac';

const DEG = Math.PI / 180;
const SYNODIC_MONTH = 29.530588853;
/** A well-documented new moon: 2000-01-06 18:14 UTC (Julian Day). */
const REFERENCE_NEW_MOON_JD = 2451550.1;

export interface BirthMoment {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function julianDay(m: BirthMoment): number {
  return Date.UTC(m.year, m.month - 1, m.day, m.hour, m.minute) / 86400000 + 2440587.5;
}

export function momentFromDate(date: Date): BirthMoment {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/** Apparent ecliptic longitude of the Sun in degrees (low-precision formula, ~0.01°). */
export function solarLongitude(m: BirthMoment): number {
  const n = julianDay(m) - 2451545.0;
  const meanLongitude = (280.46 + 0.9856474 * n) % 360;
  const meanAnomaly = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lambda = meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly);
  return ((lambda % 360) + 360) % 360;
}

export interface SunPosition {
  longitude: number;
  sign: ZodiacSign;
  /** Degree within the sign, 0–30. */
  degree: number;
  decan: 1 | 2 | 3;
  /** Neighbouring sign when the Sun sits within ~1° of a boundary. */
  cuspWith: ZodiacSign | null;
}

export function sunPosition(m: BirthMoment): SunPosition {
  const longitude = solarLongitude(m);
  const index = Math.floor(longitude / 30);
  const degree = longitude - index * 30;
  const sign = signByIndex(index);
  let cuspWith: ZodiacSign | null = null;
  if (degree < 1) cuspWith = signByIndex(index - 1);
  else if (degree > 29) cuspWith = signByIndex(index + 1);
  const decan = (Math.min(2, Math.floor(degree / 10)) + 1) as 1 | 2 | 3;
  return { longitude, sign, degree, decan, cuspWith };
}

export function formatDegree(degree: number): string {
  const whole = Math.floor(degree);
  const minutes = Math.floor((degree - whole) * 60);
  return `${whole}°${String(minutes).padStart(2, '0')}′`;
}

export type MoonPhaseId =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface MoonPhase {
  id: MoonPhaseId;
  name: string;
  /** Days since new moon. */
  age: number;
  /** Illuminated fraction, 0–1. */
  illumination: number;
  /** 0–1 position in the synodic cycle. */
  fraction: number;
}

const PHASE_NAMES: Record<MoonPhaseId, string> = {
  new: 'Neumond',
  'waxing-crescent': 'Zunehmende Sichel',
  'first-quarter': 'Erstes Viertel',
  'waxing-gibbous': 'Zunehmender Mond',
  full: 'Vollmond',
  'waning-gibbous': 'Abnehmender Mond',
  'last-quarter': 'Letztes Viertel',
  'waning-crescent': 'Abnehmende Sichel',
};

export function moonPhase(m: BirthMoment): MoonPhase {
  const days = julianDay(m) - REFERENCE_NEW_MOON_JD;
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  let id: MoonPhaseId;
  if (age < 1.85 || age >= 27.68) id = 'new';
  else if (age < 5.54) id = 'waxing-crescent';
  else if (age < 9.23) id = 'first-quarter';
  else if (age < 12.92) id = 'waxing-gibbous';
  else if (age < 16.61) id = 'full';
  else if (age < 20.3) id = 'waning-gibbous';
  else if (age < 23.99) id = 'last-quarter';
  else id = 'waning-crescent';
  return { id, name: PHASE_NAMES[id], age, illumination, fraction };
}

export type DayPartId =
  | 'deep-night'
  | 'before-dawn'
  | 'dawn'
  | 'morning'
  | 'zenith'
  | 'afternoon'
  | 'dusk'
  | 'evening'
  | 'unknown';

export function dayPart(hour: number | null, minute = 0): DayPartId {
  if (hour === null) return 'unknown';
  const t = hour + minute / 60;
  if (t < 3) return 'deep-night';
  if (t < 5.5) return 'before-dawn';
  if (t < 8) return 'dawn';
  if (t < 11.5) return 'morning';
  if (t < 14) return 'zenith';
  if (t < 17) return 'afternoon';
  if (t < 20) return 'dusk';
  return 'evening';
}

/**
 * Approximate house of the Sun from the clock alone, assuming sunrise around 06:00.
 * The Sun rises on the Ascendant (1st/12th house cusp), culminates in the 10th at
 * noon, sets in the 7th and passes the 4th around midnight.
 */
export function approximateSunHouse(hour: number, minute = 0): number {
  const t = (hour + minute / 60 + 24 - 6) % 24; // hours since ~sunrise
  const sector = Math.floor(t / 2); // 0..11, two hours each
  return ((12 - sector - 1 + 12) % 12) + 1;
}

export const WEEKDAYS = [
  { day: 'Sonntag', planet: 'Sonne', glyph: 'sun', origin: 'dies Solis' },
  { day: 'Montag', planet: 'Mond', glyph: 'moon', origin: 'dies Lunae' },
  { day: 'Dienstag', planet: 'Mars', glyph: 'mars', origin: 'dies Martis' },
  { day: 'Mittwoch', planet: 'Merkur', glyph: 'mercury', origin: 'dies Mercurii' },
  { day: 'Donnerstag', planet: 'Jupiter', glyph: 'jupiter', origin: 'dies Iovis' },
  { day: 'Freitag', planet: 'Venus', glyph: 'venus', origin: 'dies Veneris' },
  { day: 'Samstag', planet: 'Saturn', glyph: 'saturn', origin: 'dies Saturni' },
] as const;

export function weekdayOf(year: number, month: number, day: number) {
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

/** Age in fractional years between a birth date and a reference date. */
export function ageInYears(birth: BirthMoment, now: Date): number {
  const born = Date.UTC(birth.year, birth.month - 1, birth.day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, (today - born) / (365.2422 * 86400000));
}
