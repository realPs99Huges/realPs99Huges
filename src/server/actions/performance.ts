"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAppContext } from "@/lib/auth/session";
import { hasFeature } from "@/config/plans";
import { getMessages } from "@/i18n";
import { getContent } from "../content";
import { isoDate, text, uuid } from "../validation";
import { fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();
const metric = z.coerce.number().int().min(0).max(1_000_000_000);

const entrySchema = z.object({
  contentItemId: uuid,
  recordedOn: isoDate,
  views: metric,
  likes: metric,
  comments: metric,
  shares: metric,
  clicks: metric,
  note: text(300).default(""),
});

export async function addPerformanceEntryAction(input: z.input<typeof entrySchema>): Promise<ActionResult> {
  const { user } = await requireAppContext();
  if (!hasFeature(user.plan, "performance")) return fail(t.common.upgradeHint);
  const parsed = entrySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const item = await getContent(user.id, parsed.data.contentItemId);
  if (!item) return fail(t.common.notFound);
  const db = await getDb();
  // Entries created here are always self-reported; integrations will write their own source id.
  await db.insert(schema.performanceEntries).values({ ...parsed.data, userId: user.id, source: "manual" });
  revalidatePath("/app", "layout");
  return ok();
}

export async function deletePerformanceEntryAction(id: string): Promise<ActionResult> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(id).success) return fail(t.common.notFound);
  const db = await getDb();
  await db
    .delete(schema.performanceEntries)
    .where(and(eq(schema.performanceEntries.id, id), eq(schema.performanceEntries.userId, user.id)));
  revalidatePath("/app", "layout");
  return ok();
}
