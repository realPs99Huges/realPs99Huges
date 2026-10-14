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

const capital = (text: string) => {
  const plain = text.replace(/^(deinen|deine|dein) /, '');
  return `Der ${plain.charAt(0).toUpperCase()}${plain.slice(1)}`;
};

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function validatePlace(value: string, required: boolean, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? `Bitte gib ${label} ein.` : undefined;
  if (trimmed.length < 2) return `${capital(label)} ist etwas kurz.`;
  if (trimmed.length > LIMITS.placeMax) return `Bitte höchstens ${LIMITS.placeMax} Zeichen.`;
  if (!HAS_LETTER.test(trimmed)) return `Bitte gib ${label} in Buchstaben ein.`;
  return undefined;
}

export function validateBirthStep(input: ReadingInput, now = new Date()): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.birthDate) {
    errors.birthDate = 'Bitte gib dein Geburtsdatum ein.';
  } else {
    const parsed = parseDate(input.birthDate);
    if (!parsed) errors.birthDate = 'Bitte gib ein gültiges Datum ein (TT.MM.JJJJ).';
    else if (parsed.year < LIMITS.minYear) errors.birthDate = `Bitte wähle ein Datum ab ${LIMITS.minYear}.`;
    else if (input.birthDate > todayIso(now)) errors.birthDate = 'Dein Geburtsdatum kann nicht in der Zukunft liegen.';
  }

  if (!input.birthTimeUnknown) {
    if (!input.birthTime) errors.birthTime = 'Gib eine Uhrzeit ein oder wähle „Uhrzeit unbekannt“.';
    else if (!parseTime(input.birthTime)) errors.birthTime = 'Bitte gib eine gültige Uhrzeit ein (HH:MM).';
  }

  const place = validatePlace(input.birthplace, true, 'deinen Geburtsort');
  if (place) errors.birthplace = place;

  return errors;
}

export function validateIdentityStep(input: ReadingInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!ZODIAC.some((sign) => sign.id === input.sign)) errors.sign = 'Bitte wähle ein Sternzeichen.';
  const residence = validatePlace(input.residence, false, 'deinen Wohnort');
  if (residence) errors.residence = residence;
  if (input.intention.length > LIMITS.intentionMax) {
    errors.intention = `Bitte höchstens ${LIMITS.intentionMax} Zeichen.`;
  }
  return errors;
}

export function validateReadingInput(input: ReadingInput, now = new Date()): ValidationErrors {
  return { ...validateBirthStep(input, now), ...validateIdentityStep(input) };
}
