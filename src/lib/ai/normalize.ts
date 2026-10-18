import { isVideoFormat } from "@/config/options";
import type { ContentPackage } from "./types";

// Model output is untrusted: trim, cap lengths and normalise before anything is stored.

export const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
export const clipList = (values: unknown, maxItems: number, maxLength: number) =>
  (Array.isArray(values) ? values : [])
    .map((v) => clip(v, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);

export function normalizeHashtags(values: unknown): string[] {
  const tags = clipList(values, 30, 60)
    .flatMap((tag) => tag.split(/[\s,]+/))
    .map((tag) => tag.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, ""))
    .filter(Boolean)
    .map((tag) => `#${tag}`);
  const seen = new Set<string>();
  // Keep the first spelling of each tag (case-insensitive duplicates are dropped).
  return tags.filter((tag) => !seen.has(tag.toLowerCase()) && seen.add(tag.toLowerCase())).slice(0, 20);
}

export function normalizePackage(raw: Partial<ContentPackage>, format: string): ContentPackage {
  return {
    title: clip(raw.title, 120),
    hook: clip(raw.hook, 300),
    caption: clip(raw.caption, 2200),
    cta: clip(raw.cta, 300),
    hashtags: normalizeHashtags(raw.hashtags),
    visualConcept: clip(raw.visualConcept, 1500),
    shotList: isVideoFormat(format)
      ? (Array.isArray(raw.shotList) ? raw.shotList : [])
          .map((s) => ({ shot: clip(s?.shot, 120), detail: clip(s?.detail, 400) }))
          .filter((s) => s.shot || s.detail)
          .slice(0, 10)
      : [],
    onScreenText: clipList(raw.onScreenText, 10, 160),
    postingTime: clip(raw.postingTime, 80),
    postingTimeReason: clip(raw.postingTimeReason, 300),
  };
}

