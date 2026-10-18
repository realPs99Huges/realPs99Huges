"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getMessages, type Messages } from "@/i18n";

const I18nContext = createContext<{ locale: string; messages: Messages }>({ locale: "de", messages: getMessages("de") });

export function I18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  // Dictionaries are bundled client-side; only the locale crosses the server/client boundary.
  return <I18nContext.Provider value={{ locale, messages: getMessages(locale) }}>{children}</I18nContext.Provider>;
}

export function useT(): Messages {
  return useContext(I18nContext).messages;
}

export function useLocale(): string {
  return useContext(I18nContext).locale;
}
