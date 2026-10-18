import type { BrandProfile, ShotListItem } from "@/lib/db/schema";

export type AIMode = "live" | "demo";

export type ContentRequest = {
  industry: string;
  platform: string;
  format: string;
  objective: string;
  topic: string;
  details: string;
  tone: string;
  audience: string;
  language: string;
  campaignDate: string | null;
  campaignName: string | null;
};

export type ContentPackage = {
  title: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  visualConcept: string;
  shotList: ShotListItem[];
  onScreenText: string[];
  postingTime: string;
  postingTimeReason: string;
};

export const SECTIONS = [
  "hook",
  "caption",
  "cta",
  "hashtags",
  "visualConcept",
  "shotList",
  "onScreenText",
  "postingTime",
] as const;
export type Section = (typeof SECTIONS)[number];

export type SectionPatch = Partial<ContentPackage>;

/** What the model knows about the business and its history. */
export type BrandContext = {
  profile: BrandProfile;
  recentHooks: string[];
  recentTopics: string[];
};

export type PlanRequest = {
  weekStart: string;
  /** ISO dates on which a post is planned; the remaining days are rest days. */
  postingDates: string[];
  focus: string;
  platforms: string[];
};

export type PlanSuggestion = {
  date: string;
  topic: string;
  format: string;
  platform: string;
  goal: string;
  hook: string;
  idea: string;
  cta: string;
};

export type DayRequest = {
  date: string;
  focus: string;
  platforms: string[];
  /** The other days of the plan, so the new suggestion stays distinct. */
  otherDays: PlanSuggestion[];
  previous: PlanSuggestion | null;
};

export interface AIProvider {
  readonly mode: AIMode;
  readonly name: string;
  generateContent(ctx: BrandContext, req: ContentRequest): Promise<ContentPackage>;
  regenerateSection(
    ctx: BrandContext,
    req: ContentRequest,
    current: ContentPackage,
    section: Section,
    hint: string,
  ): Promise<SectionPatch>;
  generatePlan(ctx: BrandContext, req: PlanRequest): Promise<PlanSuggestion[]>;
  regenerateDay(ctx: BrandContext, req: DayRequest): Promise<PlanSuggestion>;
}

export type AIErrorCode =
  | "limit_reached"
  | "rate_limited"
  | "provider_busy"
  | "provider_auth"
  | "invalid_output"
  | "refused"
  | "timeout"
  | "unknown";

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message?: string,
    public readonly detail?: Record<string, string>,
  ) {
    super(message ?? code);
    this.name = "AIError";
  }
}
