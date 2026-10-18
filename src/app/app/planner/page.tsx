import type { Metadata } from "next";
import { requireAppContext } from "@/lib/auth/session";
import { getWeeklyPlan } from "@/server/dashboard";
import { getUsageSummary } from "@/server/usage";
import { PlannerView } from "@/components/planner/planner-view";
import { addDays, isIsoDate, startOfWeek, todayIso, weekdayIndex } from "@/lib/dates";
import { hasFeature } from "@/config/plans";
import { isDemoMode } from "@/lib/ai";
import { PageHeader } from "@/components/ui/card";
import { LockedFeature } from "@/components/locked-feature";
import { getMessages } from "@/i18n";

export const metadata: Metadata = { title: "Wochenplaner" };

export default async function PlannerPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const t = getMessages();
  const { user, profile } = await requireAppContext();
  if (!hasFeature(user.plan, "weeklyPlanner")) {
    return (
      <>
        <PageHeader title={t.planner.title} description={t.planner.subtitle} />
        <LockedFeature />
      </>
    );
  }
  const params = await searchParams;
  const today = todayIso();
  const thisWeek = startOfWeek(today);
  // From Saturday on, planning the coming week is the more useful default.
  const defaultWeek = weekdayIndex(today) >= 5 ? addDays(thisWeek, 7) : thisWeek;
  const weekStart = isIsoDate(params.week) ? startOfWeek(params.week) : defaultWeek;
  const [plan, usage] = await Promise.all([getWeeklyPlan(user.id, profile.id, weekStart), getUsageSummary(user)]);
  const demo = isDemoMode();
  return (
    <PlannerView
      key={`${weekStart}-${plan?.id ?? "none"}-${plan?.updatedAt.toISOString() ?? ""}`}
      weekStart={weekStart}
      thisWeek={thisWeek}
      nextWeek={addDays(thisWeek, 7)}
      today={today}
      plan={plan ? { id: plan.id, frequency: plan.frequency, focus: plan.focus, days: plan.days, source: plan.source } : null}
      defaultFrequency={profile.postingFrequency}
      demoMode={demo}
      limitReached={!demo && usage.plans.used >= usage.plans.limit}
    />
  );
}
