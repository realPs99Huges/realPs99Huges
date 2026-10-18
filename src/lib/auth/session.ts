import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { BrandProfile, User } from "@/lib/db/schema";

const COOKIE_NAME = "pp_session";
const SESSION_DAYS = 30;
const RENEW_WHEN_DAYS_LEFT = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY_MS);
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of this user's expired sessions.
  await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), lt(schema.sessions.expiresAt, new Date())));
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  }
  jar.delete(COOKIE_NAME);
}

export async function destroyAllSessions(userId: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

/** Returns the signed-in user or null. Memoised per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({ user: schema.users, expiresAt: schema.sessions.expiresAt, sessionId: schema.sessions.id })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() - Date.now() < RENEW_WHEN_DAYS_LEFT * DAY_MS) {
    // Sliding expiry. The cookie itself is refreshed on the next sign-in; DB expiry is authoritative.
    await db
      .update(schema.sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS) })
      .where(eq(schema.sessions.id, row.sessionId));
  }
  return row.user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export type AppContext = { user: User; profile: BrandProfile };

/** Signed-in user with an active brand profile; otherwise redirects to login or onboarding. */
export const requireAppContext = cache(async (): Promise<AppContext> => {
  const user = await requireUser();
  const profile = await getActiveProfile(user);
  if (!profile) redirect("/onboarding");
  return { user, profile };
});

export async function getActiveProfile(user: User): Promise<BrandProfile | null> {
  const db = await getDb();
  if (user.activeProfileId) {
    const [active] = await db
      .select()
      .from(schema.brandProfiles)
      .where(and(eq(schema.brandProfiles.id, user.activeProfileId), eq(schema.brandProfiles.userId, user.id)))
      .limit(1);
    if (active) return active;
  }
  const [first] = await db
    .select()
    .from(schema.brandProfiles)
    .where(eq(schema.brandProfiles.userId, user.id))
    .orderBy(schema.brandProfiles.createdAt)
    .limit(1);
  return first ?? null;
}
