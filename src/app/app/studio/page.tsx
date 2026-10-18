import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages, fmt } from "@/i18n";
import { PageHeader, Card, CardHeader, CardBody, EmptyState } from "@/components/ui/card";
import { StudioForm, type StudioDefaults } from "@/components/studio/studio-form";
import { ContentListItem } from "@/components/content/content-list-item";
import { getContent, listContent } from "@/server/content";
import { listCampaigns } from "@/server/campaigns";
import { getUsageSummary } from "@/server/usage";
import { isDemoMode } from "@/lib/ai";
import { FORMATS, OBJECTIVES, PLATFORMS } from "@/config/options";
import { isIsoDate } from "@/lib/dates";
import { hasFeature } from "@/config/plans";

export const metadata: Metadata = { title: "Content Studio" };

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const oneOf = <T extends string>(list: readonly T[], value: string, fallback: T): T => ((list as readonly string[]).includes(value) ? (value as T) : fallback);

export default async function StudioPage({ searchParams }: { searchParams: Promise<Search> }) {
  const t = getMessages();
  const { user, profile } = await requireAppContext();
  const params = await searchParams;
  const [recent, campaigns, usage] = await Promise.all([
    listContent(user.id, profile.id, { generated: true, limit: 6 }),
    hasFeature(user.plan, "campaigns") ? listCampaigns(user.id, profile.id) : Promise.resolve([]),
    getUsageSummary(user),
  ]);

  const source = one(params.from) ? await getContent(user.id, one(params.from)) : null;
  const defaults: StudioDefaults = {
    industry: source?.industry || profile.industry,
    platform: oneOf(PLATFORMS, one(params.platform) || source?.platform || "", (profile.platforms[0] as (typeof PLATFORMS)[number]) ?? "instagram"),
    format: oneOf(FORMATS, one(params.format) || source?.format || "", "feed_post"),
    objective: oneOf(OBJECTIVES, one(params.objective) || source?.objective || "", "engagement"),
    topic: one(params.topic) || source?.topic || source?.title || "",
    details: source && source.source === "manual" ? source.caption : "",
    tone: source?.tone || profile.tone,
    audience: source?.audience || profile.audience,
    language: source?.language || profile.language,
    campaignDate: isIsoDate(one(params.date)) ? one(params.date) : "",
    campaignId: one(params.campaign) || source?.campaignId || "",
  };
  const prefilled = Boolean(source || one(params.topic));
  const demo = isDemoMode();

  return (
    <>
      <PageHeader title={t.studio.title} description={t.studio.subtitle} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <StudioForm
          defaults={defaults}
          campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
          prefilled={prefilled}
          demoMode={demo}
          usageLabel={demo ? t.studio.usageDemo : fmt(t.studio.usage, { used: usage.generations.used, limit: usage.generations.limit })}
          limitReached={!demo && usage.generations.used >= usage.generations.limit}
        />
        <Card className="h-fit">
          <CardHeader title={t.studio.recentTitle} action={recent.length ? <Link href="/app/ideas?tab=recent" className="text-xs font-medium text-accent hover:underline">{t.common.all}</Link> : undefined} />
          <CardBody className="pt-3">
            {recent.length ? (
              <ul className="-mx-2 flex flex-col">
                {recent.map((item) => (
                  <li key={item.id}>
                    <ContentListItem item={item} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<Sparkles className="size-5" />} title={t.studio.recentEmpty} className="py-8" />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
