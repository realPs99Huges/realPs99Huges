import { parseDate } from '../../../lib/astro/sky';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatLongDate(iso: string): string {
  const date = parseDate(iso);
  if (!date) return iso;
  return `${date.day} ${MONTHS[date.month - 1]} ${date.year}`;
}
