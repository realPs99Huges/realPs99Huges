import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAppContext } from "@/lib/auth/session";
import { getContent } from "@/server/content";
import { listCampaigns } from "@/server/campaigns";
import { ContentEditor } from "@/components/content/content-editor";
import { hasFeature } from "@/config/plans";
import { isDemoMode } from "@/lib/ai";
import { todayIso } from "@/lib/dates";

export const metadata: Metadata = { title: "Inhalt bearbeiten" };

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requireAppContext();
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const item = await getContent(user.id, id);
  if (!item) notFound();
  const campaigns = hasFeature(user.plan, "campaigns") ? await listCampaigns(user.id, item.profileId) : [];
  return (
    <ContentEditor
      item={{ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), publishedAt: item.publishedAt?.toISOString() ?? null }}
      campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
      isNew={query.new === "1"}
      isFirst={query.first === "1"}
      today={todayIso()}
      liveAi={!isDemoMode()}
    />
  );
}
