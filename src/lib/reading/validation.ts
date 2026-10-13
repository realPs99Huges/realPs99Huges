import { parseDate, parseTime } from '../astro/sky';
import { ZODIAC } from '../astro/zodiac';
import type { ReadingInput } from './types';

export type ReadingField = keyof ReadingInput;
export type ValidationErrors = Partial<Record<ReadingField, string>>;

export const LIMITS = {
  minYear: 1900,
  placeMax: 80,
  intentionMax: 280,
} as const;

const HAS_LETTER = /\p{L}/u;

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function validatePlace(value: string, required: boolean, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? `Please enter your ${label}.` : undefined;
  if (trimmed.length < 2) return `That ${label} looks a little short.`;
  if (trimmed.length > LIMITS.placeMax) return `Please keep the ${label} under ${LIMITS.placeMax} characters.`;
  if (!HAS_LETTER.test(trimmed)) return `Please enter a ${label} using letters.`;
  return undefined;
}

export function validateBirthStep(input: ReadingInput, now = new Date()): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.birthDate) {
    errors.birthDate = 'Please enter your date of birth.';
  } else {
    const parsed = parseDate(input.birthDate);
    if (!parsed) errors.birthDate = 'Please enter a valid date.';
    else if (parsed.year < LIMITS.minYear) errors.birthDate = `Please choose a date from ${LIMITS.minYear} onwards.`;
    else if (input.birthDate > todayIso(now)) errors.birthDate = 'Your birth date cannot be in the future.';
  }

  if (!input.birthTimeUnknown) {
    if (!input.birthTime) errors.birthTime = 'Enter a time, or tick “I don’t know my birth time”.';
    else if (!parseTime(input.birthTime)) errors.birthTime = 'Please enter a valid time (HH:MM).';
  }

  const place = validatePlace(input.birthplace, true, 'birthplace');
  if (place) errors.birthplace = place;

  return errors;
}

export function validateIdentityStep(input: ReadingInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!ZODIAC.some((sign) => sign.id === input.sign)) errors.sign = 'Please choose a sign.';
  const residence = validatePlace(input.residence, false, 'current city');
  if (residence) errors.residence = residence;
  if (input.intention.length > LIMITS.intentionMax) {
    errors.intention = `Please keep this under ${LIMITS.intentionMax} characters.`;
  }
  return errors;
}

export function validateReadingInput(input: ReadingInput, now = new Date()): ValidationErrors {
  return { ...validateBirthStep(input, now), ...validateIdentityStep(input) };
}
