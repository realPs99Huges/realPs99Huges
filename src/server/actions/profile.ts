"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAppContext, requireUser } from "@/lib/auth/session";
import { getPlan, hasFeature } from "@/config/plans";
import { getMessages, fmt } from "@/i18n";
import {
  formality,
  frequency,
  goals,
  hexColors,
  industry,
  language,
  personality,
  phraseList,
  platforms,
  requiredText,
  text,
  tone,
  uuid,
  website,
} from "../validation";
import { fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();

const onboardingSchema = z.object({
  name: requiredText(80),
  industry,
  description: text(600).default(""),
  location: text(120).default(""),
  platforms,
  goals: goals.default([]),
  audience: text(300).default(""),
  tone,
  formality,
  personality: personality.default([]),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;

/** Creates the first brand profile during onboarding (or updates it when the user steps back). */
export async function saveOnboardingProfile(input: OnboardingInput): Promise<ActionResult<{ profileId: string }>> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const db = await getDb();
  const values = { ...parsed.data, language: "de" };
  const [existing] = await db.select({ id: schema.brandProfiles.id }).from(schema.brandProfiles).where(eq(schema.brandProfiles.userId, user.id)).limit(1);
  if (existing) {
    await db.update(schema.brandProfiles).set(values).where(and(eq(schema.brandProfiles.id, existing.id), eq(schema.brandProfiles.userId, user.id)));
    await db.update(schema.users).set({ activeProfileId: existing.id }).where(eq(schema.users.id, user.id));
    return ok({ profileId: existing.id });
  }
  const [profile] = await db.insert(schema.brandProfiles).values({ ...values, userId: user.id }).returning({ id: schema.brandProfiles.id });
  await db.update(schema.users).set({ activeProfileId: profile.id }).where(eq(schema.users.id, user.id));
  return ok({ profileId: profile.id });
}

export async function markOnboardingComplete(): Promise<ActionResult> {
  const user = await requireUser();
  const db = await getDb();
  await db.update(schema.users).set({ onboardingCompletedAt: new Date() }).where(eq(schema.users.id, user.id));
  return ok();
}

export async function completeOnboarding(destination: string = "/app"): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db.update(schema.users).set({ onboardingCompletedAt: new Date() }).where(eq(schema.users.id, user.id));
  redirect(destination.startsWith("/app") ? destination : "/app");
}

const profileSchema = z.object({
  name: requiredText(80),
  industry,
  description: text(1000),
  audience: text(400),
  location: text(120),
  language,
  website,
  brandColors: hexColors,
  personality,
  formality,
  tone,
  platforms,
  goals,
  postingFrequency: frequency,
  likedPhrases: phraseList(20, 120),
  dislikedPhrases: phraseList(30, 120),
  neverInvent: text(1000),
});

export type ProfileInput = z.input<typeof profileSchema>;

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const { user, profile } = await requireAppContext();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const data = { ...parsed.data };
  if (!hasFeature(user.plan, "brandVoice")) {
    data.likedPhrases = profile.likedPhrases;
    data.dislikedPhrases = profile.dislikedPhrases;
  }
  const db = await getDb();
  await db
    .update(schema.brandProfiles)
    .set(data)
    .where(and(eq(schema.brandProfiles.id, profile.id), eq(schema.brandProfiles.userId, user.id)));
  revalidatePath("/app", "layout");
  return ok();
}

export async function switchProfile(profileId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!uuid.safeParse(profileId).success) return fail(t.common.notFound);
  const db = await getDb();
  const [profile] = await db
    .select({ id: schema.brandProfiles.id })
    .from(schema.brandProfiles)
    .where(and(eq(schema.brandProfiles.id, profileId), eq(schema.brandProfiles.userId, user.id)))
    .limit(1);
  if (!profile) return fail(t.common.notFound);
  await db.update(schema.users).set({ activeProfileId: profile.id }).where(eq(schema.users.id, user.id));
  revalidatePath("/app", "layout");
  return ok();
}

const newProfileSchema = z.object({ name: requiredText(80), industry });

export async function createAdditionalProfile(input: z.input<typeof newProfileSchema>): Promise<ActionResult> {
  const { user, profile: current } = await requireAppContext();
  const parsed = newProfileSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.brandProfiles)
    .where(eq(schema.brandProfiles.userId, user.id));
  const limit = getPlan(user.plan).limits.profiles;
  if (Number(count) >= limit) return fail(fmt(t.brandProfile.profileLimit, { limit }));
  const [profile] = await db
    .insert(schema.brandProfiles)
    .values({
      userId: user.id,
      name: parsed.data.name,
      industry: parsed.data.industry,
      platforms: current.platforms,
      tone: current.tone,
      formality: current.formality,
    })
    .returning({ id: schema.brandProfiles.id });
  await db.update(schema.users).set({ activeProfileId: profile.id }).where(eq(schema.users.id, user.id));
  revalidatePath("/app", "layout");
  return ok();
}

export async function deleteActiveProfile(): Promise<ActionResult> {
  const { user, profile } = await requireAppContext();
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.brandProfiles)
    .where(eq(schema.brandProfiles.userId, user.id));
  if (Number(count) <= 1) return fail(t.brandProfile.cannotDeleteLast);
  await db.delete(schema.brandProfiles).where(and(eq(schema.brandProfiles.id, profile.id), eq(schema.brandProfiles.userId, user.id)));
  await db.update(schema.users).set({ activeProfileId: null }).where(eq(schema.users.id, user.id));
  revalidatePath("/app", "layout");
  return ok();
}
