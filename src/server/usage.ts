import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getPlan } from "@/config/plans";
import { monthStartInstant } from "@/lib/dates";
import type { AIMode } from "@/lib/ai/types";
import { AIError } from "@/lib/ai/types";
import type { User } from "@/lib/db/schema";

export type UsageKind = "generations" | "sectionRegenerations" | "plans";

const BURST_WINDOW_MS = 60_000;
const BURST_LIMIT = 10;

export type UsageSummary = Record<UsageKind, { used: number; limit: number }> & { demoUsed: number };

export async function getUsageSummary(user: User): Promise<UsageSummary> {
  const db = await getDb();
  const rows = await db
    .select({ kind: schema.usageEvents.kind, mode: schema.usageEvents.mode, total: sql<number>`coalesce(sum(${schema.usageEvents.units}), 0)` })
    .from(schema.usageEvents)
    .where(and(eq(schema.usageEvents.userId, user.id), gte(schema.usageEvents.createdAt, monthStartInstant())))
    .groupBy(schema.usageEvents.kind, schema.usageEvents.mode);
  const plan = getPlan(user.plan);
  const used = (kind: UsageKind) =>
    rows.filter((r) => r.kind === kind && r.mode === "live").reduce((sum, r) => sum + Number(r.total), 0);
  return {
    generations: { used: used("generations"), limit: plan.limits.generations },
    sectionRegenerations: { used: used("sectionRegenerations"), limit: plan.limits.sectionRegenerations },
    plans: { used: used("plans"), limit: plan.limits.plans },
    demoUsed: rows.filter((r) => r.mode === "demo").reduce((sum, r) => sum + Number(r.total), 0),
  };
}

/** Throws AIError when the user may not start another request of this kind. Demo mode is not metered. */
export async function assertWithinLimits(user: User, kind: UsageKind, mode: AIMode): Promise<void> {
  const db = await getDb();
  const [burst] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.usageEvents)
    .where(and(eq(schema.usageEvents.userId, user.id), gte(schema.usageEvents.createdAt, new Date(Date.now() - BURST_WINDOW_MS))));
  if (Number(burst?.count ?? 0) >= BURST_LIMIT) throw new AIError("rate_limited");
  if (mode === "demo") return;
  const summary = await getUsageSummary(user);
  if (summary[kind].used >= summary[kind].limit) throw new AIError("limit_reached", undefined, { kind });
}

export async function recordUsage(userId: string, kind: UsageKind, mode: AIMode, units = 1): Promise<void> {
  const db = await getDb();
  await db.insert(schema.usageEvents).values({ userId, kind, mode, units });
}
