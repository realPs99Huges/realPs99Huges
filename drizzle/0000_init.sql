CREATE TABLE "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"audience" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"personality" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"formality" text DEFAULT 'du' NOT NULL,
	"tone" text DEFAULT 'friendly' NOT NULL,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"brand_colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"liked_phrases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disliked_phrases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"never_invent" text DEFAULT '' NOT NULL,
	"posting_frequency" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"goal" text DEFAULT 'awareness' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"campaign_id" uuid,
	"title" text NOT NULL,
	"platform" text NOT NULL,
	"format" text NOT NULL,
	"objective" text NOT NULL,
	"industry" text DEFAULT '' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"tone" text DEFAULT '' NOT NULL,
	"audience" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_date" date,
	"scheduled_time" text,
	"hook" text DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"cta" text DEFAULT '' NOT NULL,
	"hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visual_concept" text DEFAULT '' NOT NULL,
	"shot_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"on_screen_text" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"posting_time" text DEFAULT '' NOT NULL,
	"posting_time_reason" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"recorded_on" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_hooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"text" text NOT NULL,
	"platform" text DEFAULT '' NOT NULL,
	"format" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"mode" text NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"locale" text DEFAULT 'de' NOT NULL,
	"plan" text DEFAULT 'starter' NOT NULL,
	"active_profile_id" uuid,
	"onboarding_completed_at" timestamp with time zone,
	"upgrade_interest" text,
	"upgrade_interest_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"frequency" integer NOT NULL,
	"focus" text DEFAULT '' NOT NULL,
	"days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" text DEFAULT 'ai' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_profile_id_brand_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_profile_id_brand_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_entries" ADD CONSTRAINT "performance_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_entries" ADD CONSTRAINT "performance_entries_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_hooks" ADD CONSTRAINT "saved_hooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_hooks" ADD CONSTRAINT "saved_hooks_profile_id_brand_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_profile_id_brand_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_profiles_user_idx" ON "brand_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_owner_idx" ON "campaigns" USING btree ("user_id","profile_id");--> statement-breakpoint
CREATE INDEX "content_owner_idx" ON "content_items" USING btree ("user_id","profile_id");--> statement-breakpoint
CREATE INDEX "content_schedule_idx" ON "content_items" USING btree ("user_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "login_attempts_key_idx" ON "login_attempts" USING btree ("key","created_at");--> statement-breakpoint
CREATE INDEX "perf_owner_idx" ON "performance_entries" USING btree ("user_id","content_item_id");--> statement-breakpoint
CREATE INDEX "hooks_owner_idx" ON "saved_hooks" USING btree ("user_id","profile_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_user_time_idx" ON "usage_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "plans_owner_idx" ON "weekly_plans" USING btree ("user_id","profile_id","week_start");