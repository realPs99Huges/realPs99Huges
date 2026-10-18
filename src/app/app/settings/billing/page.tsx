import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages } from "@/i18n";
import { Card, CardBody, CardHeader, Notice, PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { InterestButton } from "@/components/settings/interest-button";
import { getUsageSummary } from "@/server/usage";
import { listProfiles } from "@/server/content";
import { getPlan, isBetaUnlocked, PLAN_ORDER, PLANS } from "@/config/plans";
import { planFeatureLines } from "@/lib/plan-lines";
import { isDemoMode } from "@/lib/ai";

export const metadata: Metadata = { title: "Plan & Nutzung" };

function Meter({ label, used, limit, capacity }: { label: string; used: number; limit: number; capacity?: boolean }) {
  const ratio = Math.min(1, limit ? used / limit : 0);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-2">{label}</span>
        <span className="tabular-nums font-medium text-ink">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}>
        <div className={cn("h-full rounded-full", capacity ? "bg-ink-3" : ratio >= 1 ? "bg-danger" : ratio > 0.8 ? "bg-warning" : "bg-accent")} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const t = getMessages();
  const b = t.billing;
  const { user } = await requireAppContext();
  const [usage, profiles] = await Promise.all([getUsageSummary(user), listProfiles(user.id)]);
  const current = getPlan(user.plan);

  return (
    <>
      <Link href="/app/settings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="size-4" /> {t.settings.title}
      </Link>
      <PageHeader title={b.title} description={b.subtitle} />
      <div className="flex flex-col gap-6">
        {isBetaUnlocked() && <Notice tone="accent" icon={<Info />}>{b.betaNotice}</Notice>}

        <Card>
          <CardHeader title={b.usageTitle} description={b.usageReset} action={<Badge tone="accent">{b.plansInfo[current.id].name}</Badge>} />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <Meter label={b.generations} used={usage.generations.used} limit={usage.generations.limit} />
            <Meter label={b.sectionRegenerations} used={usage.sectionRegenerations.used} limit={usage.sectionRegenerations.limit} />
            <Meter label={b.plans} used={usage.plans.used} limit={usage.plans.limit} />
            <Meter label={b.profiles} used={profiles.length} limit={current.limits.profiles} capacity />
            {isDemoMode() && <p className="text-xs text-ink-3 sm:col-span-2">{b.demoNote}</p>}
          </CardBody>
        </Card>

        <Notice tone="neutral" icon={<Info />}>{b.noPayments}</Notice>

        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const info = b.plansInfo[id];
            const isCurrent = id === current.id;
            return (
              <Card key={id} className={cn("flex flex-col p-6", id === "pro" && "border-accent/50 ring-1 ring-accent/20")}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{info.name}</p>
                  {isCurrent && <Badge tone="success">{b.current}</Badge>}
                </div>
                <p className="mt-1 text-sm text-ink-3">{info.tagline}</p>
                <p className="mt-5 font-display text-3xl font-semibold text-ink">
                  {plan.priceMonthlyEur} €<span className="ml-1 text-sm font-normal text-ink-3">{t.common.perMonth}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-2">
                  {planFeatureLines(plan, t).map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.priceMonthlyEur > 0 && <InterestButton plan={id} registered={user.upgradeInterest === id} />}
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-ink-3">{b.pricesNote}</p>
      </div>
    </>
  );
}
