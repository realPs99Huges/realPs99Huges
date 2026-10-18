import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { Bookmark, Lightbulb, Megaphone, Search, Sparkles, Star } from "lucide-react";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages, fmt } from "@/i18n";
import { getDb, schema } from "@/lib/db";
import { listContent } from "@/server/content";
import { listCampaigns } from "@/server/campaigns";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { FormatLabel, PlatformMark, SourceBadge, StatusBadge } from "@/components/content-badges";
import { LockedFeature } from "@/components/locked-feature";
import { HookActions, NewCampaignButton, NewIdeaButton, DeleteCampaignButton } from "@/components/ideas/ideas-actions";
import { FORMATS, INDUSTRIES } from "@/config/options";
import { hasFeature } from "@/config/plans";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Ideen" };

const TABS = ["ideas", "favorites", "hooks", "campaigns", "recent"] as const;
type Tab = (typeof TABS)[number];

export default async function IdeasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const t = getMessages();
  const i = t.ideas;
  const { user, profile } = await requireAppContext();
  if (!hasFeature(user.plan, "ideasLibrary")) {
    return (
      <>
        <PageHeader title={i.title} description={i.subtitle} />
        <LockedFeature />
      </>
    );
  }
  const params = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(params.tab ?? "") ? (params.tab as Tab) : "ideas";
  const q = (params.q ?? "").trim().slice(0, 100);
  const industry = (INDUSTRIES as readonly string[]).includes(params.industry ?? "") ? params.industry! : "";
  const format = (FORMATS as readonly string[]).includes(params.format ?? "") ? params.format! : "";
  const campaignsEnabled = hasFeature(user.plan, "campaigns");
  const tabHref = (next: Tab) => `/app/ideas?${new URLSearchParams({ tab: next, ...(q && { q }), ...(industry && { industry }), ...(format && { format }) })}`;

  const db = await getDb();
  const contentFilter = { q: q || undefined, industry: industry || undefined, format: format || undefined };
  const items =
    tab === "ideas"
      ? await listContent(user.id, profile.id, { ...contentFilter, statuses: ["idea"] })
      : tab === "favorites"
        ? await listContent(user.id, profile.id, { ...contentFilter, favorite: true })
        : tab === "recent"
          ? await listContent(user.id, profile.id, { ...contentFilter, generated: true, limit: 50 })
          : [];
  const hooks =
    tab === "hooks"
      ? await db
          .select()
          .from(schema.savedHooks)
          .where(
            and(
              eq(schema.savedHooks.userId, user.id),
              eq(schema.savedHooks.profileId, profile.id),
              ...(q ? [ilike(schema.savedHooks.text, `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`)] : []),
              ...(format ? [eq(schema.savedHooks.format, format)] : []),
            ),
          )
          .orderBy(desc(schema.savedHooks.createdAt))
      : [];
  const campaigns = tab === "campaigns" && campaignsEnabled ? await listCampaigns(user.id, profile.id) : [];
  const campaignItems =
    campaigns.length > 0
      ? await db
          .select({ id: schema.contentItems.id, title: schema.contentItems.title, campaignId: schema.contentItems.campaignId, status: schema.contentItems.status, scheduledDate: schema.contentItems.scheduledDate })
          .from(schema.contentItems)
          .where(and(eq(schema.contentItems.userId, user.id), eq(schema.contentItems.profileId, profile.id), sql`${schema.contentItems.campaignId} is not null`))
          .orderBy(schema.contentItems.scheduledDate)
      : [];
  const filteredCampaigns = q ? campaigns.filter((c) => `${c.name} ${c.description}`.toLowerCase().includes(q.toLowerCase())) : campaigns;
  const icons: Record<Tab, typeof Lightbulb> = { ideas: Lightbulb, favorites: Star, hooks: Bookmark, campaigns: Megaphone, recent: Sparkles };
  const emptyText: Record<Tab, string> = { ideas: i.emptyIdeas, favorites: i.emptyFavorites, hooks: i.emptyHooks, campaigns: i.emptyCampaigns, recent: i.emptyRecent };
  const filtering = Boolean(q || industry || format);

  return (
    <>
      <PageHeader
        title={i.title}
        description={i.subtitle}
        actions={tab === "campaigns" && campaignsEnabled ? <NewCampaignButton openInitially={params.new === "1"} /> : <NewIdeaButton />}
      />

      <nav className="scrollbar-none -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label={i.title}>
        {TABS.filter((tb) => tb !== "campaigns" || campaignsEnabled).map((tb) => {
          const Icon = icons[tb];
          return (
            <Link key={tb} href={tabHref(tb)} aria-current={tab === tb ? "page" : undefined} className={cn("inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors", tab === tb ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}>
              <Icon className="size-4" /> {i.tabs[tb]}
            </Link>
          );
        })}
      </nav>

      <form method="get" className="mb-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]" role="search">
        <input type="hidden" name="tab" value={tab} />
        <label className="relative">
          <span className="sr-only">{t.common.search}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input name="q" defaultValue={q} placeholder={i.searchPlaceholder} className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-[0.9375rem] shadow-card focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15" />
        </label>
        <select name="industry" defaultValue={industry} aria-label={i.industry} className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm shadow-card focus:border-accent focus:outline-none">
          <option value="">
            {i.industry}: {t.common.all}
          </option>
          {INDUSTRIES.map((id) => (
            <option key={id} value={id}>
              {t.options.industries[id]}
            </option>
          ))}
        </select>
        <select name="format" defaultValue={format} aria-label={i.format} className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm shadow-card focus:border-accent focus:outline-none">
          <option value="">
            {i.format}: {t.common.all}
          </option>
          {FORMATS.map((id) => (
            <option key={id} value={id}>
              {t.options.formats[id]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("secondary", "md", "h-11 flex-1")}>
            {t.common.search}
          </button>
          {filtering && (
            <Link href={tabHref(tab).split("&")[0]} className={buttonClass("ghost", "md", "h-11")}>
              {t.common.reset}
            </Link>
          )}
        </div>
      </form>

      {tab === "hooks" ? (
        hooks.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {hooks.map((hook) => (
              <li key={hook.id}>
                <Card className="flex h-full flex-col p-4">
                  <p className="flex-1 border-l-2 border-accent/40 pl-3 text-[0.9375rem] font-medium leading-relaxed text-ink">{hook.text}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {hook.platform && <PlatformMark platform={hook.platform} />}
                    {hook.format && <FormatLabel format={hook.format} />}
                    <HookActions id={hook.id} text={hook.text} format={hook.format} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Bookmark className="size-5" />} title={filtering ? i.noResults : emptyText.hooks} />
        )
      ) : tab === "campaigns" ? (
        filteredCampaigns.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {filteredCampaigns.map((campaign) => {
              const linked = campaignItems.filter((ci) => ci.campaignId === campaign.id);
              return (
                <li key={campaign.id}>
                  <Card className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{campaign.name}</p>
                        <p className="mt-0.5 text-xs text-ink-3">
                          {t.options.objectives[campaign.goal as keyof typeof t.options.objectives]}
                          {campaign.startDate && ` · ${formatDate(campaign.startDate, "de-DE", { day: "numeric", month: "short" })}`}
                          {campaign.endDate && ` – ${formatDate(campaign.endDate, "de-DE", { day: "numeric", month: "short", year: "numeric" })}`}
                        </p>
                      </div>
                      <DeleteCampaignButton id={campaign.id} />
                    </div>
                    {campaign.description && <p className="mt-3 text-sm text-ink-2">{campaign.description}</p>}
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-3">{fmt(i.campaignItems, { count: linked.length })}</p>
                    <ul className="mt-2 flex flex-1 flex-col gap-1">
                      {linked.slice(0, 6).map((ci) => (
                        <li key={ci.id}>
                          <Link href={`/app/content/${ci.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                            <span className="truncate">{ci.title}</span>
                            <StatusBadge status={ci.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <ButtonLink href={`/app/studio?campaign=${campaign.id}${campaign.startDate ? `&date=${campaign.startDate}` : ""}`} variant="secondary" size="sm" className="mt-4 self-start" icon={<Sparkles className="size-3.5" />}>
                      {i.campaignCreate}
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={<Megaphone className="size-5" />} title={filtering ? i.noResults : emptyText.campaigns} action={!filtering && <NewCampaignButton />} />
        )
      ) : items.length ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="flex h-full flex-col p-4">
                <div className="flex items-center gap-2">
                  <PlatformMark platform={item.platform} />
                  <FormatLabel format={item.format} />
                  <span className="ml-auto flex items-center gap-1.5">
                    {item.isFavorite && <Star className="size-3.5 fill-warning text-warning" />}
                    <SourceBadge source={item.source} />
                  </span>
                </div>
                <Link href={`/app/content/${item.id}`} className="mt-3 font-semibold leading-snug text-ink hover:underline">
                  {item.title}
                </Link>
                {item.hook && <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{item.hook}</p>}
                <div className="mt-auto flex items-center gap-2 pt-4">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-ink-3">{t.options.industries[item.industry as keyof typeof t.options.industries]}</span>
                  <ButtonLink href={`/app/studio?from=${item.id}`} variant="ghost" size="sm" className="ml-auto">
                    {i.reuse}
                  </ButtonLink>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={(() => { const Icon = icons[tab]; return <Icon className="size-5" />; })()} title={filtering ? i.noResults : emptyText[tab]} action={!filtering && tab === "recent" ? <ButtonLink href="/app/studio" variant="secondary" size="sm">{t.nav.studio}</ButtonLink> : undefined} />
      )}
    </>
  );
}
