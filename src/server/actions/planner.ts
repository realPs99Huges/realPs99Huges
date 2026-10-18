"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAppContext } from "@/lib/auth/session";
import { hasFeature } from "@/config/plans";
import { getMessages, fmt } from "@/i18n";
import { startOfWeek } from "@/lib/dates";
import type { PlanDay, WeeklyPlan } from "@/lib/db/schema";
import { generatePlanDays, regeneratePlanDay } from "../ai-service";
import { createContent, getProfileForUser } from "../content";
import { frequency, isoDate, text, uuid } from "../validation";
import { aiFailure, fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();

async function getOwnedPlan(userId: string, planId: string): Promise<WeeklyPlan | null> {
  const db = await getDb();
  const [plan] = await db
    .select()
    .from(schema.weeklyPlans)
    .where(and(eq(schema.weeklyPlans.id, planId), eq(schema.weeklyPlans.userId, userId)))
    .limit(1);
  return plan ?? null;
}

async function saveDays(userId: string, planId: string, days: PlanDay[]) {
  const db = await getDb();
  await db
    .update(schema.weeklyPlans)
    .set({ days })
    .where(and(eq(schema.weeklyPlans.id, planId), eq(schema.weeklyPlans.userId, userId)));
}

const generateSchema = z.object({ weekStart: isoDate, frequency, focus: text(300).default("") });

export async function generatePlanAction(input: z.input<typeof generateSchema>): Promise<ActionResult<{ id: string }>> {
  const { user, profile } = await requireAppContext();
  if (!hasFeature(user.plan, "weeklyPlanner")) return fail(t.common.upgradeHint);
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const weekStart = startOfWeek(parsed.data.weekStart);
  try {
    const { days, source } = await generatePlanDays(user, profile, weekStart, parsed.data.frequency, parsed.data.focus);
    const db = await getDb();
    const [existing] = await db
      .select({ id: schema.weeklyPlans.id })
      .from(schema.weeklyPlans)
      .where(
        and(
          eq(schema.weeklyPlans.userId, user.id),
          eq(schema.weeklyPlans.profileId, profile.id),
          eq(schema.weeklyPlans.weekStart, weekStart),
        ),
      )
      .limit(1);
    let id: string;
    const values = { frequency: parsed.data.frequency, focus: parsed.data.focus, days, source };
    if (existing) {
      await db.update(schema.weeklyPlans).set(values).where(eq(schema.weeklyPlans.id, existing.id));
      id = existing.id;
    } else {
      const [row] = await db
        .insert(schema.weeklyPlans)
        .values({ ...values, userId: user.id, profileId: profile.id, weekStart })
        .returning({ id: schema.weeklyPlans.id });
      id = row.id;
    }
    if (profile.postingFrequency !== parsed.data.frequency) {
      await db.update(schema.brandProfiles).set({ postingFrequency: parsed.data.frequency }).where(eq(schema.brandProfiles.id, profile.id));
    }
    revalidatePath("/app", "layout");
    return ok({ id });
  } catch (error) {
    return aiFailure(error);
  }
}

const daySchema = z.object({ planId: uuid, date: isoDate });

export async function regenerateDayAction(input: z.input<typeof daySchema>): Promise<ActionResult<PlanDay>> {
  const { user, profile } = await requireAppContext();
  const parsed = daySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const plan = await getOwnedPlan(user.id, parsed.data.planId);
  if (!plan || !plan.days.some((d) => d.date === parsed.data.date)) return fail(t.common.notFound);
  try {
    const day = await regeneratePlanDay(user, profile, plan.days, parsed.data.date, plan.focus);
    await saveDays(user.id, plan.id, plan.days.map((d) => (d.date === day.date ? day : d)));
    revalidatePath("/app", "layout");
    return ok(day);
  } catch (error) {
    return aiFailure(error);
  }
}

const transferSchema = z.object({ planId: uuid, date: isoDate, mode: z.enum(["idea", "calendar"]) });

async function transferDay(userId: string, plan: WeeklyPlan, day: PlanDay, mode: "idea" | "calendar") {
  const profile = await getProfileForUser(userId, plan.profileId);
  if (!profile) throw new Error("Plan profile missing");
  const item = await createContent(userId, profile, {
    title: day.topic,
    topic: day.topic,
    platform: day.platform || "instagram",
    format: day.format || "feed_post",
    objective: day.goal || "engagement",
    hook: day.hook,
    caption: day.idea,
    cta: day.cta,
    tone: profile.tone,
    status: "idea",
    scheduledDate: mode === "calendar" ? day.date : null,
    source: plan.source === "demo" ? "demo" : "ai",
  });
  return item.id;
}

export async function transferDayAction(input: z.input<typeof transferSchema>): Promise<ActionResult<{ contentId: string }>> {
  const { user } = await requireAppContext();
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const plan = await getOwnedPlan(user.id, parsed.data.planId);
  const day = plan?.days.find((d) => d.date === parsed.data.date && !d.rest);
  if (!plan || !day) return fail(t.common.notFound);
  const contentId = await transferDay(user.id, plan, day, parsed.data.mode);
  await saveDays(user.id, plan.id, plan.days.map((d) => (d.date === day.date ? { ...d, savedContentId: contentId } : d)));
  revalidatePath("/app", "layout");
  return ok({ contentId });
}

export async function transferAllAction(planId: string): Promise<ActionResult<{ message: string }>> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(planId).success) return fail(t.common.notFound);
  const plan = await getOwnedPlan(user.id, planId);
  if (!plan) return fail(t.common.notFound);
  let count = 0;
  const days: PlanDay[] = [];
  for (const day of plan.days) {
    if (day.rest || day.savedContentId) {
      days.push(day);
      continue;
    }
    const contentId = await transferDay(user.id, plan, day, "calendar");
    days.push({ ...day, savedContentId: contentId });
    count++;
  }
  await saveDays(user.id, plan.id, days);
  revalidatePath("/app", "layout");
  return ok({ message: fmt(t.planner.transferred, { count }) });
}
