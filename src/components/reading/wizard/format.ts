import { parseDate } from '../../../lib/astro/sky';

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export function formatLongDate(iso: string): string {
  const date = parseDate(iso);
  if (!date) return iso;
  return `${date.day}. ${MONTHS[date.month - 1]} ${date.year}`;
}
