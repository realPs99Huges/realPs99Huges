import "server-only";
import { desc, and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import {
  AIError,
  type AIProvider,
  type BrandContext,
  type ContentPackage,
  type ContentRequest,
  type PlanSuggestion,
  type Section,
  type SectionPatch,
} from "@/lib/ai/types";
import { FORMATS, OBJECTIVES, PLATFORMS } from "@/config/options";
import type { BrandProfile, ContentItem, PlanDay, User } from "@/lib/db/schema";
import { addDays } from "@/lib/dates";
import { assertWithinLimits, recordUsage, type UsageKind } from "./usage";
import { clip, normalizePackage } from "@/lib/ai/normalize";
import { postingDates } from "@/lib/planning";

function normalizePatch(section: Section, patch: SectionPatch, format: string): SectionPatch {
  const full = normalizePackage(patch, format);
  if (section === "postingTime") return { postingTime: full.postingTime, postingTimeReason: full.postingTimeReason };
  return { [section]: full[section] } as SectionPatch;
}

async function buildContext(userId: string, profile: BrandProfile): Promise<BrandContext> {
  const db = await getDb();
  const recent = await db
    .select({ hook: schema.contentItems.hook, topic: schema.contentItems.topic, title: schema.contentItems.title })
    .from(schema.contentItems)
    .where(and(eq(schema.contentItems.userId, userId), eq(schema.contentItems.profileId, profile.id)))
    .orderBy(desc(schema.contentItems.createdAt))
    .limit(8);
  return {
    profile,
    recentHooks: recent.map((r) => r.hook).filter(Boolean).slice(0, 6),
    recentTopics: [...new Set(recent.map((r) => r.topic || r.title).filter(Boolean))].slice(0, 8),
  };
}

/** Runs a provider call with limit checks, one retry on malformed output, and usage recording. */
async function metered<T>(user: User, kind: UsageKind, call: (provider: AIProvider) => Promise<T>): Promise<{ result: T; provider: AIProvider }> {
  const provider = await getAIProvider();
  await assertWithinLimits(user, kind, provider.mode);
  let result: T;
  try {
    result = await call(provider);
  } catch (error) {
    if (error instanceof AIError && error.code === "invalid_output") {
      result = await call(provider);
    } else {
      throw error;
    }
  }
  await recordUsage(user.id, kind, provider.mode);
  return { result, provider };
}

export async function generatePackage(user: User, profile: BrandProfile, req: ContentRequest) {
  const ctx = await buildContext(user.id, profile);
  const { result, provider } = await metered(user, "generations", (p) => p.generateContent(ctx, req));
  const pkg = normalizePackage(result, req.format);
  if (!pkg.hook || !pkg.caption) throw new AIError("invalid_output");
  return { pkg, source: provider.mode === "live" ? "ai" : "demo" };
}

export function requestFromItem(item: ContentItem, profile: BrandProfile): ContentRequest {
  return {
    industry: item.industry || profile.industry,
    platform: item.platform,
    format: item.format,
    objective: item.objective,
    topic: item.topic || item.title,
    details: "",
    tone: item.tone || profile.tone,
    audience: item.audience,
    language: item.language,
    campaignDate: item.scheduledDate,
    campaignName: null,
  };
}

export async function regenerateSection(
  user: User,
  profile: BrandProfile,
  item: ContentItem,
  current: ContentPackage,
  section: Section,
  hint: string,
) {
  const ctx = await buildContext(user.id, profile);
  const req = requestFromItem(item, profile);
  const { result } = await metered(user, "sectionRegenerations", (p) => p.regenerateSection(ctx, req, current, section, hint));
  const patch = normalizePatch(section, result, item.format);
  const value = patch[section];
  if (value === undefined || (typeof value === "string" && !value && section !== "cta")) throw new AIError("invalid_output");
  return patch;
}

function normalizeSuggestion(raw: Partial<PlanSuggestion>, date: string, platforms: string[]): PlanSuggestion {
  const fallbackPlatform = platforms[0] ?? "instagram";
  return {
    date,
    topic: clip(raw.topic, 160),
    format: (FORMATS as readonly string[]).includes(raw.format ?? "") ? raw.format! : "feed_post",
    platform: (PLATFORMS as readonly string[]).includes(raw.platform ?? "") ? raw.platform! : fallbackPlatform,
    goal: (OBJECTIVES as readonly string[]).includes(raw.goal ?? "") ? raw.goal! : "engagement",
    hook: clip(raw.hook, 300),
    idea: clip(raw.idea, 800),
    cta: clip(raw.cta, 300),
  };
}

export async function generatePlanDays(user: User, profile: BrandProfile, weekStart: string, frequency: number, focus: string): Promise<{ days: PlanDay[]; source: string }> {
  const ctx = await buildContext(user.id, profile);
  const dates = postingDates(weekStart, frequency, profile.industry);
  const platforms = profile.platforms.length ? profile.platforms : ["instagram"];
  const { result, provider } = await metered(user, "plans", (p) => p.generatePlan(ctx, { weekStart, postingDates: dates, focus, platforms }));
  const byDate = new Map<string, PlanSuggestion>();
  for (const raw of result) {
    const date = dates.includes(raw.date) ? raw.date : dates.find((d) => !byDate.has(d));
    if (date && !byDate.has(date)) byDate.set(date, normalizeSuggestion(raw, date, platforms));
  }
  if (byDate.size < dates.length) throw new AIError("invalid_output");
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const s = byDate.get(date);
    return s
      ? { ...s, rest: false, savedContentId: null }
      : { date, rest: true, topic: "", format: "", platform: "", goal: "", hook: "", idea: "", cta: "", savedContentId: null };
  });
  return { days, source: provider.mode === "live" ? "ai" : "demo" };
}

export async function regeneratePlanDay(user: User, profile: BrandProfile, days: PlanDay[], date: string, focus: string): Promise<PlanDay> {
  const ctx = await buildContext(user.id, profile);
  const platforms = profile.platforms.length ? profile.platforms : ["instagram"];
  const current = days.find((d) => d.date === date);
  const otherDays = days.filter((d) => !d.rest && d.date !== date);
  const { result } = await metered(user, "plans", (p) =>
    p.regenerateDay(ctx, { date, focus, platforms, otherDays, previous: current && !current.rest ? current : null }),
  );
  return { ...normalizeSuggestion(result, date, platforms), rest: false, savedContentId: null };
}

