import Link from "next/link";
import { ArrowRight, CalendarRange, Check, PenLine, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { getMessages } from "@/i18n";
import { planFeatureLines } from "@/lib/plan-lines";
import { getCurrentUser } from "@/lib/auth/session";
import { PLAN_ORDER, PLANS } from "@/config/plans";

export default async function LandingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const t = getMessages();
  const l = t.landing;
  const user = await getCurrentUser();
  const params = await searchParams;
  const icons = [Sparkles, PenLine, CalendarRange];

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <ButtonLink href="/app" size="sm">
              {t.nav.dashboard} <ArrowRight className="size-3.5" />
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                {l.navLogin}
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                {l.navSignup}
              </ButtonLink>
            </>
          )}
        </nav>
      </header>

      <main>
        {params.account === "deleted" && (
          <p className="mx-auto max-w-6xl px-5 text-sm text-success sm:px-8" role="status">
            {l.accountDeleted}
          </p>
        )}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
          <p className="text-sm font-medium text-accent">{l.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.05] text-ink sm:text-[3.75rem]">{l.headline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{l.sub}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={user ? "/app" : "/signup"} size="lg">
              {user ? t.nav.dashboard : l.ctaPrimary} <ArrowRight className="size-4" />
            </ButtonLink>
            {!user && (
              <ButtonLink href="/login" variant="secondary" size="lg">
                {l.ctaSecondary}
              </ButtonLink>
            )}
          </div>
          <p className="mt-6 text-sm text-ink-3">{l.forWho}</p>
        </section>

        <section className="border-y border-line bg-surface-2/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-3">
            {l.features.map((feature, i) => {
              const Icon = icons[i];
              return (
                <div key={feature.title}>
                  <span className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-accent shadow-card">
                    <Icon className="size-[1.1rem]" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h2>
                  <p className="mt-2 leading-relaxed text-ink-2">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink">{l.howTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {l.how.map((step, i) => (
              <li key={step} className="rounded-card border border-line bg-surface p-5 shadow-card">
                <span className="font-display text-3xl font-semibold text-accent">{i + 1}</span>
                <p className="mt-2 font-medium text-ink">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-3">{l.honesty}</p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink">{l.pricingTitle}</h2>
          <p className="mt-2 text-sm text-ink-3">{l.pricingNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PLAN_ORDER.map((id) => {
              const plan = PLANS[id];
              const info = t.billing.plansInfo[id];
              return (
                <div key={id} className={`rounded-card border bg-surface p-6 shadow-card ${id === "pro" ? "border-accent/50 ring-1 ring-accent/20" : "border-line"}`}>
                  <p className="font-semibold text-ink">{info.name}</p>
                  <p className="mt-1 text-sm text-ink-3">{info.tagline}</p>
                  <p className="mt-5 font-display text-3xl font-semibold text-ink">
                    {plan.priceMonthlyEur} €<span className="ml-1 text-sm font-normal text-ink-3">{t.common.perMonth}</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-2">
                    {planFeatureLines(plan, t).map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm text-ink-3 sm:px-8">
          <span>{l.footer}</span>
          <Link href="/login" className="hover:text-ink">
            {l.navLogin}
          </Link>
        </div>
      </footer>
    </div>
  );
}
