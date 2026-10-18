"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { getMessages } from "@/i18n";
import { email, password, requiredText } from "../validation";
import { fail, validationFailure, type ActionResult } from "../result";

const t = getMessages();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

async function clientIp() {
  const h = await headers();
  return h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

async function clientKey(mail: string) {
  return `${mail}|${await clientIp()}`;
}

async function tooManyAttempts(key: string): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - WINDOW_MS);
  await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.createdAt, since));
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.loginAttempts)
    .where(and(eq(schema.loginAttempts.key, key), gte(schema.loginAttempts.createdAt, since)));
  return Number(row?.count ?? 0) >= MAX_ATTEMPTS;
}

const signupSchema = z.object({ name: requiredText(80), email, password });

export async function signup(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  // Throttle account creation per IP (counts every attempt, successful or not).
  const signupKey = `signup|${await clientIp()}`;
  if (await tooManyAttempts(signupKey)) return fail(t.auth.tooManyAttempts);
  const db = await getDb();
  await db.insert(schema.loginAttempts).values({ key: signupKey });
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${parsed.data.email}`)
    .limit(1);
  if (existing) return fail(t.auth.emailTaken, { email: t.auth.emailTaken });
  const [user] = await db
    .insert(schema.users)
    .values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) })
    .returning({ id: schema.users.id });
  await createSession(user.id);
  redirect("/onboarding");
}

const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(t.auth.invalidCredentials);
  const key = await clientKey(parsed.data.email);
  if (await tooManyAttempts(key)) return fail(t.auth.tooManyAttempts);
  const db = await getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${parsed.data.email}`)
    .limit(1);
  // Always run a hash comparison so response time does not reveal whether the account exists.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  if (!user || !valid) {
    await db.insert(schema.loginAttempts).values({ key });
    return fail(t.auth.invalidCredentials);
  }
  await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.key, key));
  await createSession(user.id);
  redirect(user.onboardingCompletedAt ? "/app" : "/onboarding");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
