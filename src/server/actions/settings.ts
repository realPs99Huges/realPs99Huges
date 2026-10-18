"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { createSession, destroyAllSessions, destroySession, requireUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getMessages } from "@/i18n";
import { password, requiredText } from "../validation";
import { fail, ok, validationFailure, type ActionResult } from "../result";

const t = getMessages();

export async function updateAccountAction(input: { name: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.object({ name: requiredText(80) }).safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const db = await getDb();
  await db.update(schema.users).set({ name: parsed.data.name }).where(eq(schema.users.id, user.id));
  revalidatePath("/app", "layout");
  return ok();
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.object({ currentPassword: z.string().min(1).max(200), newPassword: password }).safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return fail(t.settings.wrongPassword, { currentPassword: t.settings.wrongPassword });
  }
  const db = await getDb();
  await db.update(schema.users).set({ passwordHash: await hashPassword(parsed.data.newPassword) }).where(eq(schema.users.id, user.id));
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return ok();
}

export async function deleteAccountAction(input: { password: string; confirm: string }): Promise<ActionResult> {
  const user = await requireUser();
  if (input.confirm !== t.settings.confirmWord) return fail(t.settings.confirmMismatch, { confirm: t.settings.confirmMismatch });
  if (!(await verifyPassword(String(input.password ?? ""), user.passwordHash))) {
    return fail(t.settings.wrongPassword, { password: t.settings.wrongPassword });
  }
  await destroySession();
  const db = await getDb();
  // All user data is removed through ON DELETE CASCADE foreign keys.
  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  redirect("/?account=deleted");
}

export async function registerUpgradeInterestAction(plan: string): Promise<ActionResult> {
  const user = await requireUser();
  if (plan !== "pro" && plan !== "business") return fail(t.validation.invalid);
  const db = await getDb();
  await db.update(schema.users).set({ upgradeInterest: plan, upgradeInterestAt: new Date() }).where(eq(schema.users.id, user.id));
  revalidatePath("/app/settings/billing");
  return ok();
}
