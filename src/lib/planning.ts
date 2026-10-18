import { addDays } from "./dates";

// Spread posting days sensibly across the week (0 = Monday). Hospitality favours the end of the week.
const SPREAD: Record<number, number[]> = { 2: [1, 4], 3: [0, 2, 4], 4: [0, 2, 3, 5], 5: [0, 1, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
const SPREAD_HOSPITALITY: Record<number, number[]> = { 2: [3, 5], 3: [1, 3, 5], 4: [1, 3, 4, 5], 5: [1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
const HOSPITALITY = ["restaurant", "cafe", "bakery", "bar"];

export function postingDates(weekStart: string, frequency: number, industry: string): string[] {
  const table = HOSPITALITY.includes(industry) ? SPREAD_HOSPITALITY : SPREAD;
  return (table[frequency] ?? SPREAD[3]).map((offset) => addDays(weekStart, offset));
}

