import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { requireAppContext } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { listContent } from "@/server/content";
import { PageHeader } from "@/components/ui/card";
import { LockedFeature } from "@/components/locked-feature";
import { PerformanceView, type PerformanceRow } from "@/components/performance/performance-view";
import { hasFeature } from "@/config/plans";
import { getMessages } from "@/i18n";
import { todayIso } from "@/lib/dates";

export const metadata: Metadata = { title: "Performance" };

export default async function PerformancePage() {
  const t = getMessages();
  const { user, profile } = await requireAppContext();
  if (!hasFeature(user.plan, "performance")) {
    return (
      <>
        <PageHeader title={t.performance.title} description={t.performance.subtitle} />
        <LockedFeature />
      </>
    );
  }
  const db = await getDb();
  const [content, entries] = await Promise.all([
    listContent(user.id, profile.id, { limit: 300 }),
    db
      .select()
      .from(schema.performanceEntries)
      .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.performanceEntries.contentItemId))
      .where(and(eq(schema.performanceEntries.userId, user.id), eq(schema.contentItems.profileId, profile.id)))
      .orderBy(desc(schema.performanceEntries.recordedOn), desc(schema.performanceEntries.createdAt)),
  ]);

  const rows: PerformanceRow[] = [];
  for (const { performance_entries: entry, content_items: item } of entries) {
    let row = rows.find((r) => r.contentId === item.id);
    if (!row) {
      row = { contentId: item.id, title: item.title, format: item.format, platform: item.platform, publishedAt: item.publishedAt?.toISOString() ?? null, entries: [] };
      rows.push(row);
    }
    row.entries.push({
      id: entry.id,
      recordedOn: entry.recordedOn,
      views: entry.views,
      likes: entry.likes,
      comments: entry.comments,
      shares: entry.shares,
      clicks: entry.clicks,
      source: entry.source,
      note: entry.note,
    });
  }

  const options = [...content]
    .sort((a, b) => Number(b.status === "published") - Number(a.status === "published"))
    .map((c) => ({ id: c.id, title: c.title, published: c.status === "published" }));

  return <PerformanceView rows={rows} contentOptions={options} today={todayIso()} />;
}
