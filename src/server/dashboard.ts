import "server-only";
import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { BrandProfile, User, WeeklyPlan } from "@/lib/db/schema";
import { monthStartInstant } from "@/lib/dates";

export async function getDashboardStats(user: User, profile: BrandProfile) {
  const db = await getDb();
  const c = schema.contentItems;
  const owner = and(eq(c.userId, user.id), eq(c.profileId, profile.id));
  const [byStatus, generatedThisMonth, scheduledAny, planAny, perfAny] = await Promise.all([
    db.select({ status: c.status, count: sql<number>`count(*)` }).from(c).where(owner).groupBy(c.status),
    db
      .select({ count: sql<number>`count(*)` })
      .from(c)
      .where(and(owner, inArray(c.source, ["ai", "demo"]), gte(c.createdAt, monthStartInstant()))),
    db.select({ id: c.id }).from(c).where(and(owner, isNotNull(c.scheduledDate))).limit(1),
    db
      .select({ id: schema.weeklyPlans.id })
      .from(schema.weeklyPlans)
      .where(and(eq(schema.weeklyPlans.userId, user.id), eq(schema.weeklyPlans.profileId, profile.id)))
      .limit(1),
    db.select({ id: schema.performanceEntries.id }).from(schema.performanceEntries).where(eq(schema.performanceEntries.userId, user.id)).limit(1),
  ]);
  const count = (statuses: string[]) => byStatus.filter((r) => statuses.includes(r.status)).reduce((s, r) => s + Number(r.count), 0);
  const total = count(["idea", "draft", "ready", "scheduled", "published"]);
  return {
    generatedThisMonth: Number(generatedThisMonth[0]?.count ?? 0),
    draftsAndIdeas: count(["idea", "draft"]),
    ready: count(["ready", "scheduled"]),
    published: count(["published"]),
    checklist: {
      profile: true,
      firstContent: total > 0,
      calendar: scheduledAny.length > 0,
      plan: planAny.length > 0,
      voice: profile.likedPhrases.length > 0 || profile.dislikedPhrases.length > 0 || profile.neverInvent.trim().length > 0,
      performance: perfAny.length > 0,
    },
  };
}

export async function getWeeklyPlan(userId: string, profileId: string, weekStart: string): Promise<WeeklyPlan | null> {
  const db = await getDb();
  const [plan] = await db
    .select()
    .from(schema.weeklyPlans)
    .where(and(eq(schema.weeklyPlans.userId, userId), eq(schema.weeklyPlans.profileId, profileId), eq(schema.weeklyPlans.weekStart, weekStart)))
    .limit(1);
  return plan ?? null;
}
