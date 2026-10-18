"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Check, ChevronDown, LogOut, Menu, Plus, X } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/components/i18n-provider";
import { useToast } from "@/components/ui/toast";
import { logout } from "@/server/actions/auth";
import { switchProfile } from "@/server/actions/profile";
import { MOBILE_PRIMARY, NAV_ITEMS } from "./nav-items";

type ProfileSummary = { id: string; name: string; industry: string };

export function AppShell({
  children,
  userName,
  profiles,
  activeProfileId,
  canAddProfile,
  demoMode,
}: {
  children: ReactNode;
  userName: string;
  profiles: ProfileSummary[];
  activeProfileId: string;
  canAddProfile: boolean;
  demoMode: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Hauptnavigation" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, "exact" in item ? item.exact : false);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-surface text-ink shadow-card ring-1 ring-line" : "text-ink-2 hover:bg-surface/70 hover:text-ink",
            )}
          >
            <Icon className={cn("size-[1.05rem]", active ? "text-accent" : "text-ink-3")} aria-hidden />
            {t.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarBody = (
    <>
      <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} canAddProfile={canAddProfile} />
      <Link href="/app/studio" className={buttonClass("primary", "md", "mt-4 w-full")}>
        <Plus className="size-4" aria-hidden />
        {t.nav.createContent}
      </Link>
      <div className="mt-5 flex-1">{nav}</div>
      {demoMode && (
        <Link href="/app/settings/billing" className="mb-3 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2.5 text-xs leading-snug text-warning">
          <span className="font-semibold">{t.dashboard.demoModeTitle}</span>
          <span className="mt-0.5 block opacity-90">{t.ai.notConfigured}</span>
        </Link>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <Link href="/app/settings" className="min-w-0 truncate rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:text-ink">
          {userName}
        </Link>
        <form action={logout}>
          <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-3 hover:bg-surface hover:text-ink" title={t.nav.logout}>
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">{t.nav.logout}</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Zum Inhalt springen
      </a>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface-2/60 px-4 py-5 lg:flex">
        <Link href="/app" className="mb-6 px-2">
          <Logo />
        </Link>
        {sidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Link href="/app" aria-label="PostPilot">
          <Logo />
        </Link>
        <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label={t.nav.menu} aria-expanded={drawer}>
          <Menu className="size-5" />
        </button>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <button type="button" className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={() => setDrawer(false)} aria-label={t.common.close} />
          <div
            className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] animate-rise flex-col overflow-y-auto bg-bg px-4 py-4 shadow-modal"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setDrawer(false);
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <LogoMark />
              <button type="button" onClick={() => setDrawer(false)} className="rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label={t.common.close}>
                <X className="size-5" />
              </button>
            </div>
            {sidebarBody}
          </div>
        </div>
      )}

      <main id="main" className="min-w-0 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label="Schnellnavigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-bg/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV_ITEMS.filter((i) => (MOBILE_PRIMARY as readonly string[]).includes(i.key))
          .slice(0, 2)
          .map((item) => (
            <MobileTab key={item.href} href={item.href} label={t.nav[item.key]} icon={<item.icon className="size-5" />} active={isActive(item.href, "exact" in item ? item.exact : false)} />
          ))}
        <div className="grid place-items-center">
          <Link href="/app/studio" className="grid size-11 place-items-center rounded-2xl bg-ink text-bg shadow-pop" aria-label={t.nav.createContent}>
            <Plus className="size-5" />
          </Link>
        </div>
        {NAV_ITEMS.filter((i) => (MOBILE_PRIMARY as readonly string[]).includes(i.key))
          .slice(2)
          .map((item) => (
            <MobileTab key={item.href} href={item.href} label={t.nav[item.key]} icon={<item.icon className="size-5" />} active={isActive(item.href)} />
          ))}
      </nav>
    </div>
  );
}

function MobileTab({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium", active ? "text-ink" : "text-ink-3")}>
      <span className={active ? "text-accent" : undefined}>{icon}</span>
      <span className="max-w-full truncate px-1">{label}</span>
    </Link>
  );
}

function ProfileSwitcher({ profiles, activeProfileId, canAddProfile }: { profiles: ProfileSummary[]; activeProfileId: string; canAddProfile: boolean }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
  const multiple = profiles.length > 1 || canAddProfile;

  const summary = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft font-display text-sm font-semibold text-accent-strong">
        {active?.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-ink">{active?.name}</span>
        <span className="block truncate text-xs text-ink-3">{t.options.industries[active?.industry as keyof typeof t.options.industries]}</span>
      </span>
    </>
  );

  if (!multiple) return <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 shadow-card">{summary}</div>;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 shadow-card hover:border-line-strong"
      >
        {summary}
        <ChevronDown className={cn("size-4 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 animate-rise rounded-xl border border-line bg-surface p-1.5 shadow-pop" role="listbox" aria-label={t.nav.profiles}>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              role="option"
              aria-selected={profile.id === activeProfileId}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  if (profile.id !== activeProfileId) {
                    const res = await switchProfile(profile.id);
                    if (!res.ok) toast.error(res.error);
                    router.refresh();
                  }
                  setOpen(false);
                })
              }
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface-2"
            >
              <span className="truncate">{profile.name}</span>
              {profile.id === activeProfileId && <Check className="size-4 text-accent" />}
            </button>
          ))}
          {canAddProfile && (
            <Link href="/app/brand#profiles" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg border-t border-line px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2">
              <Plus className="size-4" /> {t.nav.newProfile}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
