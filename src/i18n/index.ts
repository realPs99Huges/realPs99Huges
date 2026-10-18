import { de, type Messages } from "./de";

export const LOCALES = ["de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

const dictionaries: Record<Locale, Messages> = { de };

export function getMessages(locale?: string | null): Messages {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : DEFAULT_LOCALE];
}

/** Replaces {placeholders} in a message. */
export function fmt(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export const INTL_LOCALE: Record<Locale, string> = { de: "de-DE" };

export type { Messages };
