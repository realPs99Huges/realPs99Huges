import { z } from "zod";
import { getMessages } from "@/i18n";
import {
  CONTENT_LANGUAGES,
  FORMALITIES,
  FORMATS,
  GOALS,
  INDUSTRIES,
  OBJECTIVES,
  PERSONALITY_TRAITS,
  PLATFORMS,
  POSTING_FREQUENCIES,
  STATUSES,
  TONES,
} from "@/config/options";
import { isIsoDate } from "@/lib/dates";

const v = getMessages().validation;

export const text = (max: number) => z.string().trim().max(max, v.tooLong);
export const requiredText = (max: number) => text(max).min(1, v.required);
export const isoDate = z.string().refine(isIsoDate, v.date);
export const optionalIsoDate = z
  .union([z.literal(""), z.null(), isoDate])
  .optional()
  .transform((value) => (value ? value : null));
export const time = z
  .union([z.literal(""), z.null(), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, v.invalid)])
  .optional()
  .transform((value) => (value ? value : null));

export const industry = z.enum(INDUSTRIES);
export const platform = z.enum(PLATFORMS);
export const format = z.enum(FORMATS);
export const objective = z.enum(OBJECTIVES);
export const tone = z.enum(TONES);
export const status = z.enum(STATUSES);
export const language = z.enum(CONTENT_LANGUAGES);
export const formality = z.enum(FORMALITIES);
export const personality = z.array(z.enum(PERSONALITY_TRAITS)).max(5);
export const goals = z.array(z.enum(GOALS)).max(7);
export const platforms = z.array(platform).min(1, v.selectOne).max(PLATFORMS.length);
export const frequency = z.coerce
  .number()
  .int()
  .refine((n) => (POSTING_FREQUENCIES as readonly number[]).includes(n), v.invalid);
export const uuid = z.string().uuid();

/** Lines/commas → trimmed unique list. */
export const phraseList = (maxItems: number, maxLength: number) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : value.split(/\n/)))
    .transform((items) => [...new Set(items.map((s) => s.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(maxLength, v.tooLong)).max(maxItems, v.tooLong));

export const hexColors = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : value.split(/[\s,]+/)))
  .transform((items) => [...new Set(items.map((s) => s.trim()).filter(Boolean))])
  .pipe(z.array(z.string().regex(/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/, v.invalid)).max(6));

export const website = z
  .string()
  .trim()
  .max(200, v.tooLong)
  .refine((s) => s === "" || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(s) || /^[^\s]+\.[^\s]+$/.test(s), v.invalid)
  .transform((s) => (s && !/^https?:\/\//i.test(s) ? `https://${s}` : s));

export const email = z.string().trim().toLowerCase().max(254).email(v.email);
export const password = z.string().min(10, v.passwordLength).max(200, v.tooLong);
