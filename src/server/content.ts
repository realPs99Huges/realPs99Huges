import "server-only";
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, or, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { BrandProfile, ContentItem } from "@/lib/db/schema";

// All queries are scoped by userId (and profileId where relevant). Never query content without them.

export type ContentFilter = {
  from?: string;
  to?: string;
  unscheduled?: boolean;
  statuses?: string[];
  platform?: string;
  format?: string;
  industry?: string;
  q?: string;
  favorite?: boolean;
  generated?: boolean;
  campaignId?: string;
  limit?: number;
  order?: "schedule" | "recent";
};

export async function listContent(userId: string, profileId: string, filter: ContentFilter = {}): Promise<ContentItem[]> {
  const db = await getDb();
  const c = schema.contentItems;
  const where: SQL[] = [eq(c.userId, userId), eq(c.profileId, profileId)];
  if (filter.from) where.push(gte(c.scheduledDate, filter.from));
  if (filter.to) where.push(lte(c.scheduledDate, filter.to));
  if (filter.unscheduled) where.push(isNull(c.scheduledDate));
  if (filter.statuses?.length) where.push(inArray(c.status, filter.statuses));
  if (filter.platform) where.push(eq(c.platform, filter.platform));
  if (filter.format) where.push(eq(c.format, filter.format));
  if (filter.industry) where.push(eq(c.industry, filter.industry));
  if (filter.favorite) where.push(eq(c.isFavorite, true));
  if (filter.generated) where.push(inArray(c.source, ["ai", "demo"]));
  if (filter.campaignId) where.push(eq(c.campaignId, filter.campaignId));
  if (filter.q) {
    const pattern = `%${filter.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    where.push(or(ilike(c.title, pattern), ilike(c.topic, pattern), ilike(c.hook, pattern), ilike(c.caption, pattern))!);
  }
  const order =
    filter.order === "schedule" ? [asc(c.scheduledDate), asc(c.scheduledTime), asc(c.createdAt)] : [desc(c.createdAt)];
  return db
    .select()
    .from(c)
    .where(and(...where))
    .orderBy(...order)
    .limit(filter.limit ?? 500);
}

export async function getContent(userId: string, id: string): Promise<ContentItem | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.contentItems)
    .where(and(eq(schema.contentItems.id, id), eq(schema.contentItems.userId, userId)))
    .limit(1);
  return row ?? null;
}

export type ContentInsert = Omit<typeof schema.contentItems.$inferInsert, "id" | "userId" | "profileId" | "createdAt" | "updatedAt">;

export async function createContent(userId: string, profile: BrandProfile, data: ContentInsert): Promise<ContentItem> {
  const db = await getDb();
  const [row] = await db
    .insert(schema.contentItems)
    .values({ industry: profile.industry, language: profile.language, ...data, userId, profileId: profile.id })
    .returning();
  return row;
}

export async function updateContent(userId: string, id: string, patch: Partial<ContentInsert>): Promise<ContentItem | null> {
  const db = await getDb();
  const [row] = await db
    .update(schema.contentItems)
    .set(patch)
    .where(and(eq(schema.contentItems.id, id), eq(schema.contentItems.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteContent(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .delete(schema.contentItems)
    .where(and(eq(schema.contentItems.id, id), eq(schema.contentItems.userId, userId)))
    .returning({ id: schema.contentItems.id });
  return rows.length > 0;
}

export async function getProfileForUser(userId: string, profileId: string): Promise<BrandProfile | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.brandProfiles)
    .where(and(eq(schema.brandProfiles.id, profileId), eq(schema.brandProfiles.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function listProfiles(userId: string): Promise<BrandProfile[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.brandProfiles)
    .where(eq(schema.brandProfiles.userId, userId))
    .orderBy(asc(schema.brandProfiles.createdAt));
}
