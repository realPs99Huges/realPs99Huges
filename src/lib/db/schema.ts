import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    locale: text("locale").notNull().default("de"),
    plan: text("plan").notNull().default("starter"),
    activeProfileId: uuid("active_profile_id"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
    upgradeInterest: text("upgrade_interest"),
    upgradeInterestAt: timestamp("upgrade_interest_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the session token; the raw token only lives in the cookie.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    industry: text("industry").notNull(),
    description: text("description").notNull().default(""),
    audience: text("audience").notNull().default(""),
    location: text("location").notNull().default(""),
    language: text("language").notNull().default("de"),
    personality: jsonb("personality").$type<string[]>().notNull().default([]),
    formality: text("formality").notNull().default("du"),
    tone: text("tone").notNull().default("friendly"),
    platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
    goals: jsonb("goals").$type<string[]>().notNull().default([]),
    website: text("website").notNull().default(""),
    brandColors: jsonb("brand_colors").$type<string[]>().notNull().default([]),
    likedPhrases: jsonb("liked_phrases").$type<string[]>().notNull().default([]),
    dislikedPhrases: jsonb("disliked_phrases").$type<string[]>().notNull().default([]),
    neverInvent: text("never_invent").notNull().default(""),
    postingFrequency: integer("posting_frequency").notNull().default(3),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("brand_profiles_user_idx").on(t.userId)],
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    goal: text("goal").notNull().default("awareness"),
    description: text("description").notNull().default(""),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("campaigns_owner_idx").on(t.userId, t.profileId)],
);

export type ShotListItem = { shot: string; detail: string };

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    platform: text("platform").notNull(),
    format: text("format").notNull(),
    objective: text("objective").notNull(),
    industry: text("industry").notNull().default(""),
    topic: text("topic").notNull().default(""),
    tone: text("tone").notNull().default(""),
    audience: text("audience").notNull().default(""),
    language: text("language").notNull().default("de"),
    status: text("status").notNull().default("draft"),
    scheduledDate: date("scheduled_date"),
    scheduledTime: text("scheduled_time"),
    hook: text("hook").notNull().default(""),
    caption: text("caption").notNull().default(""),
    cta: text("cta").notNull().default(""),
    hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
    visualConcept: text("visual_concept").notNull().default(""),
    shotList: jsonb("shot_list").$type<ShotListItem[]>().notNull().default([]),
    onScreenText: jsonb("on_screen_text").$type<string[]>().notNull().default([]),
    postingTime: text("posting_time").notNull().default(""),
    postingTimeReason: text("posting_time_reason").notNull().default(""),
    // ai | demo | manual — how the content was created. Demo content is always labelled.
    source: text("source").notNull().default("manual"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("content_owner_idx").on(t.userId, t.profileId),
    index("content_schedule_idx").on(t.userId, t.scheduledDate),
  ],
);

export const savedHooks = pgTable(
  "saved_hooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    platform: text("platform").notNull().default(""),
    format: text("format").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("hooks_owner_idx").on(t.userId, t.profileId)],
);

export type PlanDay = {
  date: string;
  rest: boolean;
  topic: string;
  format: string;
  platform: string;
  goal: string;
  hook: string;
  idea: string;
  cta: string;
  savedContentId: string | null;
};

export const weeklyPlans = pgTable(
  "weekly_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(),
    frequency: integer("frequency").notNull(),
    focus: text("focus").notNull().default(""),
    days: jsonb("days").$type<PlanDay[]>().notNull().default([]),
    source: text("source").notNull().default("ai"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("plans_owner_idx").on(t.userId, t.profileId, t.weekStart)],
);

export const performanceEntries = pgTable(
  "performance_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    recordedOn: date("recorded_on").notNull(),
    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    // manual | integration:<provider> — distinguishes self-reported numbers from synced data.
    source: text("source").notNull().default("manual"),
    note: text("note").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("perf_owner_idx").on(t.userId, t.contentItemId)],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    mode: text("mode").notNull(),
    units: integer("units").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [index("usage_user_time_idx").on(t.userId, t.createdAt)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type SavedHook = typeof savedHooks.$inferSelect;
export type WeeklyPlan = typeof weeklyPlans.$inferSelect;
export type PerformanceEntry = typeof performanceEntries.$inferSelect;
