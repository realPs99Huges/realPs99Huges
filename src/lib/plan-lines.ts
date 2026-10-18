import { fmt, type Messages } from "@/i18n";
import type { Feature, PlanConfig } from "@/config/plans";

const FEATURE_ORDER: Feature[] = ["weeklyPlanner", "ideasLibrary", "brandVoice", "performance", "campaigns", "multipleProfiles"];

/** Customer-facing feature list derived from the plan configuration, so copy never drifts from limits. */
export function planFeatureLines(plan: PlanConfig, t: Messages): string[] {
  const lines = t.billing.featureLines;
  return [
    fmt(lines.generations, { count: plan.limits.generations }),
    fmt(lines.plans, { count: plan.limits.plans }),
    lines.calendar,
    fmt(lines.profiles, { count: plan.limits.profiles }),
    ...FEATURE_ORDER.filter((f) => plan.features[f] && f !== "multipleProfiles").map((f) => lines[f]),
  ];
}
