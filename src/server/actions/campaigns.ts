"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAppContext } from "@/lib/auth/session";
import { hasFeature } from "@/config/plans";
import { getMessages } from "@/i18n";
import { objective, optionalIsoDate, requiredText, text, uuid } from "../validation";
import { fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();

const campaignSchema = z
  .object({
    name: requiredText(120),
    goal: objective,
    description: text(1000).default(""),
    startDate: optionalIsoDate,
    endDate: optionalIsoDate,
  })
  .refine((c) => !c.startDate || !c.endDate || c.startDate <= c.endDate, {
    message: t.validation.date,
    path: ["endDate"],
  });

export async function createCampaignAction(input: z.input<typeof campaignSchema>): Promise<ActionResult<{ id: string }>> {
  const { user, profile } = await requireAppContext();
  if (!hasFeature(user.plan, "campaigns")) return fail(t.common.upgradeHint);
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const db = await getDb();
  const [row] = await db
    .insert(schema.campaigns)
    .values({ ...parsed.data, userId: user.id, profileId: profile.id })
    .returning({ id: schema.campaigns.id });
  revalidatePath("/app", "layout");
  return ok({ id: row.id });
}

export async function deleteCampaignAction(id: string): Promise<ActionResult> {
  const { user } = await requireAppContext();
  if (!uuid.safeParse(id).success) return fail(t.common.notFound);
  const db = await getDb();
  await db.delete(schema.campaigns).where(and(eq(schema.campaigns.id, id), eq(schema.campaigns.userId, user.id)));
  revalidatePath("/app", "layout");
  return ok();
}
