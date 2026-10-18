import { getMessages } from "@/i18n";
import { isVideoFormat, LOW_HASHTAG_PLATFORMS, type Platform } from "@/config/options";
import { weekdayIndex } from "@/lib/dates";
import type { BrandContext, ContentPackage, ContentRequest, DayRequest, PlanRequest, Section } from "./types";

// Option ids are translated into readable (German) labels so the model sees the same words as the customer.
const labels = getMessages("de").options;
const label = <T extends Record<string, string>>(map: T, key: string) => (map as Record<string, string>)[key] ?? key;
const WEEKDAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SYSTEM_PROMPT = `You are PostPilot, a senior social media editor for small local businesses (restaurants, cafés, barbershops, gyms, shops, small brands). You write content that a busy owner can post today without editing.

How you write:
- Sound like the specific business, never like an agency or an AI. Use the brand voice, formality and phrases provided. Concrete beats generic: name the actual product, place, person, moment.
- The hook must earn attention in the first 1–2 seconds: a specific detail, a tension, a surprising fact the owner supplied, a question the audience really asks. No clickbait.
- Avoid stock marketing phrases and filler, e.g. "Wir freuen uns", "Lass dich verzaubern", "Gönn dir", "unvergesslich", "ein Muss", "Qualität, die man schmeckt", "Du wirst es lieben", "Tauche ein in". Do not open with "Hallo ihr Lieben" or similar.
- Emojis: sparing and purposeful (0–3 in a caption), matched to the tone.
- Write natively in the requested language, with correct spelling, typography and the requested form of address (German: "du" vs. "Sie").
- Captions fit the platform: short and punchy for Stories/TikTok, more depth for feed posts and carousels, scannable line breaks.
- Never invent facts. Prices, discounts, dates, opening hours, awards, product claims, health claims, customer quotes and statistics may only appear if they are in the request or brand profile. When such a detail would help but is missing, use a bracketed placeholder like [Preis] or [Datum] so the owner can fill it in.
- Respect everything listed under "must never be invented" and never use disliked phrases.
- Vary structure and angle from the business's recent content so posts do not repeat.
- Hashtags: 5–12 relevant ones mixing local, niche and topic tags; fewer (0–3) for platforms where hashtags matter little. No banned or spammy tags.
- Visual concept: something a small team can shoot with a phone today. Mention brand colours when provided.
- Shot list only for video formats (Reel, Story, short video): 4–7 shots with duration and framing. For static formats return an empty shot list.
- Posting time: suggest a weekday and time window plausible for this kind of business and audience, and explain it as an estimate based on general patterns — never as a guaranteed optimum.`;

function list(values: string[], map?: Record<string, string>): string {
  if (!values.length) return "—";
  return values.map((v) => (map ? label(map, v) : v)).join(", ");
}

export function brandBlock(ctx: BrandContext): string {
  const p = ctx.profile;
  const lines = [
    `Business name: ${p.name}`,
    `Industry: ${label(labels.industries, p.industry)}`,
    `Offer / description: ${p.description || "—"}`,
    `Target audience: ${p.audience || "—"}`,
    `Location: ${p.location || "—"}`,
    `Website: ${p.website || "—"}`,
    `Brand personality: ${list(p.personality, labels.personality)}`,
    `Default tone: ${label(labels.tones, p.tone)}`,
    `Form of address: ${p.formality === "sie" ? "formal (Sie)" : "informal (du)"}`,
    `Platforms: ${list(p.platforms, labels.platforms)}`,
    `Current marketing goals: ${list(p.goals, labels.goals)}`,
    `Brand colours: ${list(p.brandColors)}`,
    `Phrases the owner likes (use naturally, not all at once): ${list(p.likedPhrases)}`,
    `Phrases the owner dislikes (never use): ${list(p.dislikedPhrases)}`,
    `Must never be invented: ${p.neverInvent || "prices, discounts, dates, opening hours, awards"}`,
  ];
  const recent = [
    ctx.recentHooks.length ? `Recent hooks (do not repeat their angle or wording):\n${ctx.recentHooks.map((h) => `- ${h}`).join("\n")}` : "",
    ctx.recentTopics.length ? `Recent topics: ${ctx.recentTopics.join("; ")}` : "",
  ].filter(Boolean);
  return `<brand_profile>\n${lines.join("\n")}\n</brand_profile>${recent.length ? `\n<recent_content>\n${recent.join("\n")}\n</recent_content>` : ""}`;
}

export function requestBlock(req: ContentRequest): string {
  const video = isVideoFormat(req.format);
  const lowTags = LOW_HASHTAG_PLATFORMS.includes(req.platform as Platform);
  return `<request>
Business type: ${label(labels.industries, req.industry)}
Platform: ${label(labels.platforms, req.platform)}
Format: ${label(labels.formats, req.format)}${video ? " (video – include a shot list)" : " (static – shot list must be empty)"}
Objective: ${label(labels.objectives, req.objective)}
Topic / offer: ${req.topic}
Facts supplied by the owner (the only facts you may state): ${req.details || "none"}
Tone: ${label(labels.tones, req.tone)}
Target audience for this post: ${req.audience || "as in brand profile"}
Language: ${label(labels.languages, req.language)}
Campaign: ${req.campaignName || "—"}
Campaign / publishing date: ${req.campaignDate ? `${req.campaignDate} (${WEEKDAYS_EN[weekdayIndex(req.campaignDate)]})` : "not fixed"}
Hashtags: ${lowTags ? "this platform needs few or no hashtags (0–3)" : "5–12"}
</request>`;
}

export function contentPrompt(ctx: BrandContext, req: ContentRequest): string {
  return `${brandBlock(ctx)}

${requestBlock(req)}

Create the complete content package for this request. Write every customer-facing field in ${label(labels.languages, req.language)}. The postingTime field must be written in German.`;
}

const SECTION_GUIDANCE: Record<Section, string> = {
  hook: "Write a new opening hook with a clearly different angle from the current one.",
  caption: "Rewrite the caption. It must start with the current hook line and end with the current call to action. Keep the facts, improve rhythm and specificity. No hashtags.",
  cta: "Write a new call to action that fits the objective and platform. One clear action.",
  hashtags: "Suggest a fresh, relevant hashtag set.",
  visualConcept: "Propose a different visual concept that a small team can shoot with a phone.",
  shotList: "Write a new shot list (4–7 shots) with framing and durations. Empty array if the format is static.",
  onScreenText: "Write new on-screen text overlays, short and readable on a phone.",
  postingTime: "Suggest a posting time window with a one-sentence reason, framed as an estimate.",
};

export function sectionPrompt(
  ctx: BrandContext,
  req: ContentRequest,
  current: ContentPackage,
  section: Section,
  hint: string,
): string {
  return `${brandBlock(ctx)}

${requestBlock(req)}

<current_package>
${JSON.stringify(current, null, 2)}
</current_package>

Task: ${SECTION_GUIDANCE[section]}${hint ? `\nOwner's instruction for this rewrite: ${hint}` : ""}
Return only the "${section}" field${section === "postingTime" ? ' and "postingTimeReason"' : ""}.`;
}

function weekdayName(iso: string) {
  return WEEKDAYS_EN[weekdayIndex(iso)];
}

export function planPrompt(ctx: BrandContext, req: PlanRequest): string {
  return `${brandBlock(ctx)}

<plan_request>
Week starting: ${req.weekStart}
Posting dates (exactly one suggestion per date): ${req.postingDates.map((d) => `${d} (${weekdayName(d)})`).join(", ")}
Weekly focus from the owner: ${req.focus || "none – choose a sensible mix"}
Platforms to use: ${list(req.platforms, labels.platforms)}
</plan_request>

Propose a balanced content plan for exactly these dates. Requirements:
- Mix formats (Reel, Story, feed post, carousel, short video) and goals (reach, engagement, sales, awareness, community) across the week. Do not use the same format or goal on consecutive posting days unless there are only one or two dates.
- Fit the weekday (e.g. lunch or weekend moments for gastronomy, Monday motivation for gyms) without clichés.
- Include at least one people/behind-the-scenes post and at most one direct sales post per three posts.
- Topics must be specific to this business; do not invent offers, prices or events — use placeholders like [Aktion] if needed.
- Write topic, hook, idea and cta in ${label(labels.languages, ctx.profile.language)}.
- format, platform and goal must use the allowed enum ids.`;
}

export function dayPrompt(ctx: BrandContext, req: DayRequest): string {
  return `${brandBlock(ctx)}

<plan_context>
Date to plan: ${req.date} (${weekdayName(req.date)})
Weekly focus: ${req.focus || "none"}
Platforms to use: ${list(req.platforms, labels.platforms)}
Other days in this plan (stay distinct from them):
${req.otherDays.map((d) => `- ${d.date}: ${d.format} / ${d.goal} – ${d.topic}`).join("\n") || "- none"}
Previous suggestion for this date (replace it with something clearly different): ${req.previous ? `${req.previous.format} / ${req.previous.goal} – ${req.previous.topic}` : "none"}
</plan_context>

Propose one new content idea for ${req.date}. Write topic, hook, idea and cta in ${label(labels.languages, ctx.profile.language)}. Return it as the only element of "days".`;
}
