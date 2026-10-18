import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GDPR-style export of everything stored for the signed-in user. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const db = await getDb();
  const [profiles, content, campaigns, hooks, plans, performance, usage] = await Promise.all([
    db.select().from(schema.brandProfiles).where(eq(schema.brandProfiles.userId, user.id)),
    db.select().from(schema.contentItems).where(eq(schema.contentItems.userId, user.id)),
    db.select().from(schema.campaigns).where(eq(schema.campaigns.userId, user.id)),
    db.select().from(schema.savedHooks).where(eq(schema.savedHooks.userId, user.id)),
    db.select().from(schema.weeklyPlans).where(eq(schema.weeklyPlans.userId, user.id)),
    db.select().from(schema.performanceEntries).where(eq(schema.performanceEntries.userId, user.id)),
    db.select().from(schema.usageEvents).where(eq(schema.usageEvents.userId, user.id)),
  ]);
  // Never export credentials.
  const { passwordHash: _passwordHash, ...account } = user;
  void _passwordHash;
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), account, profiles, content, campaigns, hooks, plans, performance, usage },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="postpilot-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
