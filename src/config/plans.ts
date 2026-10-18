/**
 * Subscription plans. Prices are initial proposals, not confirmed market prices —
 * adjust them here. No payment provider is integrated yet: plans are assigned with
 * `npm run admin:set-plan` until billing is connected.
 */

export type PlanId = "starter" | "pro" | "business";

export type Feature = "weeklyPlanner" | "ideasLibrary" | "brandVoice" | "performance" | "campaigns" | "multipleProfiles";

export type PlanConfig = {
  id: PlanId;
  priceMonthlyEur: number;
  limits: {
    /** Full content packages per calendar month. */
    generations: number;
    /** Single-section rewrites per calendar month. */
    sectionRegenerations: number;
    /** Weekly plans (whole plan or single day counts as one) per calendar month. */
    plans: number;
    profiles: number;
  };
  features: Record<Feature, boolean>;
};

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    priceMonthlyEur: 0,
    limits: { generations: 15, sectionRegenerations: 30, plans: 2, profiles: 1 },
    features: {
      weeklyPlanner: false,
      ideasLibrary: false,
      brandVoice: false,
      performance: false,
      campaigns: false,
      multipleProfiles: false,
    },
  },
  pro: {
    id: "pro",
    priceMonthlyEur: 19,
    limits: { generations: 150, sectionRegenerations: 400, plans: 20, profiles: 1 },
    features: {
      weeklyPlanner: true,
      ideasLibrary: true,
      brandVoice: true,
      performance: true,
      campaigns: false,
      multipleProfiles: false,
    },
  },
  business: {
    id: "business",
    priceMonthlyEur: 49,
    limits: { generations: 500, sectionRegenerations: 1500, plans: 80, profiles: 5 },
    features: {
      weeklyPlanner: true,
      ideasLibrary: true,
      brandVoice: true,
      performance: true,
      campaigns: true,
      multipleProfiles: true,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "pro", "business"];

export function getPlan(id: string | null | undefined): PlanConfig {
  return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : "starter"];
}

/**
 * During the beta all features are unlocked for every plan (usage limits still apply).
 * Set POSTPILOT_BETA_ALL_FEATURES=false once billing is live to enforce feature gating.
 */
export function isBetaUnlocked(): boolean {
  return process.env.POSTPILOT_BETA_ALL_FEATURES !== "false";
}

export function hasFeature(planId: string, feature: Feature): boolean {
  return isBetaUnlocked() || getPlan(planId).features[feature];
}
