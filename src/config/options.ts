// Stable identifiers for every selectable option. Customer-facing labels live in src/i18n.

export const INDUSTRIES = [
  "restaurant",
  "cafe",
  "bakery",
  "bar",
  "barbershop",
  "salon",
  "gym",
  "yoga",
  "retail",
  "fashion",
  "beauty",
  "craft",
  "health",
  "local_service",
  "brand",
  "other",
] as const;

export const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "pinterest", "google_business"] as const;

export const FORMATS = ["feed_post", "reel", "story", "carousel", "short_video"] as const;

export const OBJECTIVES = ["reach", "engagement", "sales", "awareness", "community"] as const;

export const TONES = ["friendly", "professional", "playful", "inspiring", "bold", "warm", "minimal"] as const;

export const PERSONALITY_TRAITS = [
  "authentic",
  "humorous",
  "premium",
  "down_to_earth",
  "modern",
  "traditional",
  "energetic",
  "calm",
  "expert",
  "sustainable",
] as const;

export const GOALS = ["more_customers", "brand_awareness", "regulars", "new_product", "events", "online_sales", "hiring"] as const;

export const STATUSES = ["idea", "draft", "ready", "scheduled", "published"] as const;

export const CONTENT_LANGUAGES = ["de", "en", "fr", "it", "es", "tr"] as const;

export const FORMALITIES = ["du", "sie"] as const;

export const POSTING_FREQUENCIES = [2, 3, 4, 5, 7] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Format = (typeof FORMATS)[number];
export type Objective = (typeof OBJECTIVES)[number];
export type Tone = (typeof TONES)[number];
export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number];
export type Goal = (typeof GOALS)[number];
export type Status = (typeof STATUSES)[number];
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];
export type Formality = (typeof FORMALITIES)[number];

export const VIDEO_FORMATS: readonly Format[] = ["reel", "short_video", "story"];

export function isVideoFormat(format: string): boolean {
  return (VIDEO_FORMATS as readonly string[]).includes(format);
}

// Platforms where hashtags carry little or no value.
export const LOW_HASHTAG_PLATFORMS: readonly Platform[] = ["google_business", "facebook"];
