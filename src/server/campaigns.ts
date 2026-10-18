import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { Campaign } from "@/lib/db/schema";

export async function listCampaigns(userId: string, profileId: string): Promise<Campaign[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.campaigns)
    .where(and(eq(schema.campaigns.userId, userId), eq(schema.campaigns.profileId, profileId)))
    .orderBy(desc(schema.campaigns.createdAt));
}
