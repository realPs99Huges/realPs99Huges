import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, PenLine, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/i18n";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardingCompletedAt ? "/app" : "/onboarding");
  const t = getMessages();
  const icons = [Sparkles, PenLine, CalendarDays];
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,34rem)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/" className="self-start" aria-label="PostPilot Startseite">
          <Logo />
        </Link>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-rise">{children}</div>
        </main>
      </div>
      <aside className="relative hidden overflow-hidden border-l border-line bg-surface-2 lg:flex lg:flex-col lg:justify-center lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/10 blur-3xl" />
        <p className="font-display text-3xl font-semibold leading-tight text-ink">{t.brand.promise}</p>
        <ul className="mt-10 space-y-6">
          {t.landing.features.map((feature, i) => {
            const Icon = icons[i];
            return (
              <li key={feature.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-accent shadow-card">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-ink">{feature.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{feature.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
