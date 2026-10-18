"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages } from "@/i18n";
import { SECTIONS, type ContentPackage, type SectionPatch } from "@/lib/ai/types";
import type { ContentItem } from "@/lib/db/schema";
import { generatePackage, regenerateSection } from "../ai-service";
import { normalizeHashtags } from "@/lib/ai/normalize";
import { createContent, deleteContent, getContent, getProfileForUser, updateContent } from "../content";
import {
  format,
  industry,
  language,
  objective,
  optionalIsoDate,
  platform,
  requiredText,
  status,
  text,
  time,
  tone,
  uuid,
} from "../validation";
import { aiFailure, fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();

function revalidateContent() {
  revalidatePath("/app", "layout");
}

async function ownedCampaignId(userId: string, campaignId: string | null | undefined): Promise<string | null> {
  if (!campaignId) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: schema.campaigns.id })
    .from(schema.campaigns)
    .where(and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

const optionalUuid = z
  .union([z.literal(""), z.null(), uuid])
  .optional()
  .transform((value) => (value ? value : null));

const generateSchema = z.object({
  industry,
  platform,
  format,
  objective,
  topic: requiredText(200),
  details: text(1200).default(""),
  tone,
  audience: text(300).default(""),
  language,
  campaignDate: optionalIsoDate,
  campaignId: optionalUuid,
});

export type GenerateInput = z.input<typeof generateSchema>;

export async function generateContentAction(input: GenerateInput): Promise<ActionResult<{ id: string }>> {
  const { user, profile } = await requireAppContext();
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const data = parsed.data;
  const campaignId = await ownedCampaignId(user.id, data.campaignId);
  let campaignName: string | null = null;
  if (campaignId) {
    const db = await getDb();
    const [campaign] = await db.select({ name: schema.campaigns.name }).from(schema.campaigns).where(eq(schema.campaigns.id, campaignId));
    campaignName = campaign?.name ?? null;
  }
  try {
    const { pkg, source } = await generatePackage(user, profile, { ...data, campaignName });
    const item = await createContent(user.id, profile, {
      ...pkg,
      title: pkg.title || data.topic,
      platform: data.platform,
      format: data.format,
      objective: data.objective,
      industry: data.industry,
      topic: data.topic,
      tone: data.tone,
      audience: data.audience,
      language: data.language,
      status: "draft",
      scheduledDate: data.campaignDate,
      campaignId,
      source,
    });
    revalidateContent();
    return ok({ id: item.id });
  } catch (error) {
    return aiFailure(error);
  }
}

const shotSchema = z.object({ shot: text(120), detail: text(400) });

const packageSchema = z.object({
  title: text(120),
  hook: text(300),
  caption: text(2200),
  cta: text(300),
  hashtags: z.array(z.string().max(60)).max(30),
  visualConcept: text(1500),
  shotList: z.array(shotSchema).max(12),
  onScreenText: z.array(text(160)).max(12),
  postingTime: text(80),
  postingTimeReason: text(300),
});

const regenerateSchema = z.object({
  id: uuid,
  section: z.enum(SECTIONS),
  hint: text(300).default(""),
  current: packageSchema,
});

export async function regenerateSectionAction(input: z.input<typeof regenerateSchema>): Promise<ActionResult<SectionPatch>> {
  const { user } = await requireAppContext();
  const parsed = regenerateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const item = await getContent(user.id, parsed.data.id);
  if (!item) return fail(t.common.notFound);
  const profile = await getProfileForUser(user.id, item.profileId);
  if (!profile) return fail(t.common.notFound);
  try {
    const current: ContentPackage = { ...parsed.data.current, hashtags: normalizeHashtags(parsed.data.current.hashtags) };
    const patch = await regenerateSection(user, profile, item, current, parsed.data.section, parsed.data.hint);
    await updateContent(user.id, item.id, patch);
    revalidateContent();
    return ok(patch);
  } catch (error) {
    return aiFailure(error);
  }
}

const saveSchema = packageSchema.extend({
  id: uuid,
  topic: text(200),
  platform,
  format,
  objective,
  tone: z.union([tone, z.literal("")]),
  audience: text(300),
  language,
  status,
  scheduledDate: optionalIsoDate,
  scheduledTime: time,
  campaignId: optionalUuid,
});

export type SaveContentInput = z.input<typeof saveSchema>;

function withPublishState(item: ContentItem | null, nextStatus: string) {
  if (nextStatus === "published") return { publishedAt: item?.publishedAt ?? new Date() };
  return { publishedAt: null };
}

export async function saveContentAction(input: SaveContentInput): Promise<ActionResult<{ updatedAt: string }>> {
  const { user } = await requireAppContext();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { id, ...data } = parsed.data;
  if (data.status === "scheduled" && !data.scheduledDate) {
    return fail(t.validation.date, { scheduledDate: t.validation.date });
  }
  const existing = await getContent(user.id, id);
  if (!existing) return fail(t.common.notFound);
  const updated = await updateContent(user.id, id, {
    ...data,
    title: data.title || existing.title,
    hashtags: normalizeHashtags(data.hashtags),
    shotList: data.shotList.filter((s) => s.shot || s.detail),
    onScreenText: data.onScreenText.filter(Boolean),
    campaignId: await ownedCampaignId(user.id, data.campaignId),
    ...withPublishState(existing, data.status),
  });
  if (!updated) return fail(t.common.notFound);
  revalidateContent();
  return ok({ updatedAt: updated.updatedAt.toISOString() });
}

const manualSchema = z.object({
  title: requiredText(160),
  platform,
  format,
  objective: objective.default("engagement"),
  status: status.default("idea"),
  scheduledDate: optionalIsoDate,
  scheduledTime: time,
  notes: text(2200).default(""),
  industry: industry.optional(),
  campaignId: optionalUuid,
});

export type ManualContentInput = z.input<typeof manualSchema>;

/** Creates a calendar entry or idea without AI generation. */
export async function createManualContentAction(input: ManualContentInput): Promise<ActionResult<{ id: string }>> {
  const { user, profile } = await requireAppContext();
  const parsed = manualSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { notes, ...data } = parsed.data;
  if (data.status === "scheduled" && !data.scheduledDate) return fail(t.validation.date, { scheduledDate: t.validation.date });
  const item = await createContent(user.id, profile, {
    ...data,
    industry: data.industry ?? profile.industry,
    topic: data.title,
    caption: notes,
    tone: profile.tone,
    campaignId: await ownedCampaignId(user.id, data.campaignId),
    source: "manual",
    ...(data.status === "published" ? { publishedAt: new Date() } : {}),
  });
  revalidateContent();
  return ok({ id: item.id });
}

const quickUpdateSchema = z.object({
  id: uuid,
  title: requiredText(160).optional(),
  platform: platform.optional(),
  format: format.optional(),
  status: status.optional(),
  scheduledDate: optionalIsoDate.optional(),
  scheduledTime: time.optional(),
});

/** Partial update used by the calendar (move, status, quick edit). */
export async function quickUpdateContentAction(input: z.input<typeof quickUpdateSchema>): Promise<ActionResult> {
  const { user } = await requireAppContext();
  const parsed = quickUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { id, ...patch } = parsed.data;
  const existing = await getContent(user.id, id);
  if (!existing) return fail(t.common.notFound);
  const nextStatus = patch.status ?? existing.status;
  const nextDate = patch.scheduledDate === undefined ? existing.scheduledDate : patch.scheduledDate;
  if (nextStatus === "scheduled" && !nextDate) return fail(t.validation.date, { scheduledDate: t.validation.date });
  const clean = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
  await updateContent(user.id, id, {
    ...clean,
    ...(patch.status ? withPublishState(existing, patch.status) : {}),
  });
  revalidateContent();
  return ok();
}

export async function toggleFavoriteAction(id: string): Promise<ActionResult<{ isFavorite: boolean }>> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(id).success) return fail(t.common.notFound);
  const item = await getContent(user.id, id);
  if (!item) return fail(t.common.notFound);
  await updateContent(user.id, id, { isFavorite: !item.isFavorite });
  revalidateContent();
  return ok({ isFavorite: !item.isFavorite });
}

export async function deleteContentAction(id: string): Promise<ActionResult> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(id).success) return fail(t.common.notFound);
  const deleted = await deleteContent(user.id, id);
  if (!deleted) return fail(t.common.notFound);
  revalidateContent();
  return ok();
}

const hookSchema = z.object({ text: requiredText(300), platform: z.union([platform, z.literal("")]).default(""), format: z.union([format, z.literal("")]).default("") });

export async function saveHookAction(input: z.input<typeof hookSchema>): Promise<ActionResult> {
  const { user, profile } = await requireAppContext();
  const parsed = hookSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const db = await getDb();
  await db.insert(schema.savedHooks).values({ ...parsed.data, userId: user.id, profileId: profile.id });
  revalidatePath("/app/ideas");
  return ok();
}

export async function deleteHookAction(id: string): Promise<ActionResult> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(id).success) return fail(t.common.notFound);
  const db = await getDb();
  await db.delete(schema.savedHooks).where(and(eq(schema.savedHooks.id, id), eq(schema.savedHooks.userId, user.id)));
  revalidatePath("/app/ideas");
  return ok();
}
