import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Download } from "lucide-react";
import { requireAppContext } from "@/lib/auth/session";
import { getMessages } from "@/i18n";
import { Card, PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { PlatformMark } from "@/components/content-badges";
import { AccountForm, DeleteAccountForm, PasswordForm } from "@/components/settings/settings-forms";
import { INTEGRATIONS } from "@/lib/integrations";
import { getPlan } from "@/config/plans";

export const metadata: Metadata = { title: "Einstellungen" };

function Section({ title, description, children, danger }: { title: string; description?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <Card className={danger ? "border-danger/30 p-5 sm:p-7" : "p-5 sm:p-7"}>
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div>
          <h2 className={danger ? "font-semibold text-danger" : "font-semibold text-ink"}>{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}

export default async function SettingsPage() {
  const t = getMessages();
  const s = t.settings;
  const { user } = await requireAppContext();
  const plan = t.billing.plansInfo[getPlan(user.plan).id];
  return (
    <>
      <PageHeader
        title={s.title}
        actions={
          <Link href="/app/settings/billing" className={buttonClass("secondary")}>
            <CreditCard className="size-4" /> {t.nav.billing}
          </Link>
        }
      />
      <div className="flex flex-col gap-5">
        <Section title={s.account}>
          <AccountForm name={user.name} email={user.email} />
        </Section>
        <Section title={s.password}>
          <PasswordForm />
        </Section>
        <Section title={t.billing.currentPlan}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-ink">{plan.name}</p>
            <Link href="/app/settings/billing" className="text-sm font-medium text-accent hover:underline">
              {t.nav.billing} →
            </Link>
          </div>
        </Section>
        <Section title={s.language}>
          <p className="text-sm font-medium text-ink">
            {s.uiLanguage}: {t.options.languages.de}
          </p>
          <p className="mt-1 text-sm text-ink-3">{s.uiLanguageNote}</p>
        </Section>
        <Section title={s.integrations} description={s.integrationsText}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <PlatformMark platform={i.platform} />
                  {t.options.platforms[i.platform as keyof typeof t.options.platforms]}
                </span>
                <Badge tone="neutral">{s.integrationStatus}</Badge>
              </li>
            ))}
          </ul>
        </Section>
        <Section title={s.export} description={s.exportText}>
          <a href="/api/export" className={buttonClass("secondary")} download>
            <Download className="size-4" /> {s.exportButton}
          </a>
        </Section>
        <Section title={s.danger} description={s.dangerText} danger>
          <DeleteAccountForm />
        </Section>
      </div>
    </>
  );
}
