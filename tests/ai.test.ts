import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeHashtags, normalizePackage } from "../src/lib/ai/normalize";
import { postingDates } from "../src/lib/planning";
import { DemoProvider } from "../src/lib/ai/providers/demo";
import { contentPrompt } from "../src/lib/ai/prompts";
import type { BrandContext, ContentRequest } from "../src/lib/ai/types";
import type { BrandProfile } from "../src/lib/db/schema";

const profile: BrandProfile = {
  id: "p1", userId: "u1", name: "Café Lindenblatt", industry: "cafe", description: "Specialty Coffee", audience: "Studierende",
  location: "Leipzig", language: "de", personality: ["authentic"], formality: "sie", tone: "warm", platforms: ["instagram"],
  goals: ["regulars"], website: "", brandColors: ["#2F5D50"], likedPhrases: ["Bis gleich"], dislikedPhrases: ["Gönn dir"],
  neverInvent: "Preise", postingFrequency: 3, createdAt: new Date(), updatedAt: new Date(),
};
const ctx: BrandContext = { profile, recentHooks: ["Alter Hook"], recentTopics: ["Kuchen"] };
const req: ContentRequest = { industry: "cafe", platform: "instagram", format: "reel", objective: "engagement", topic: "Herbstkuchen", details: "", tone: "warm", audience: "", language: "de", campaignDate: "2026-10-23", campaignName: null };

test("hashtags are cleaned, prefixed and de-duplicated", () => {
  assert.deepEqual(normalizeHashtags(["#Kaffee", "kaffee", "##Leipzig City", "", 42]), ["#Kaffee", "#Leipzig", "#City"]);
});

test("static formats never carry a shot list", () => {
  const pkg = normalizePackage({ hook: " Hi ", caption: "x", shotList: [{ shot: "a", detail: "b" }] }, "feed_post");
  assert.equal(pkg.hook, "Hi");
  assert.deepEqual(pkg.shotList, []);
});

test("posting dates honour the requested frequency", () => {
  for (const n of [2, 3, 4, 5, 7]) {
    const dates = postingDates("2026-10-19", n, "gym");
    assert.equal(dates.length, n);
    assert.equal(new Set(dates).size, n);
  }
  assert.deepEqual(postingDates("2026-10-19", 2, "restaurant"), ["2026-10-22", "2026-10-24"]);
});

test("prompt includes brand voice guardrails and the weekday", () => {
  const prompt = contentPrompt(ctx, req);
  assert.match(prompt, /Gönn dir/);
  assert.match(prompt, /formal \(Sie\)/);
  assert.match(prompt, /Must never be invented: Preise/);
  assert.match(prompt, /2026-10-23 \(Friday\)/);
  assert.match(prompt, /Alter Hook/);
});

test("demo provider produces a complete package with formal address", async () => {
  const demo = new DemoProvider();
  const pkg = await demo.generateContent(ctx, req);
  assert.ok(pkg.hook && pkg.caption && pkg.cta);
  assert.ok(pkg.shotList.length > 0, "reel has shots");
  assert.doesNotMatch(pkg.caption + pkg.cta, /\b(du|dich|dir|dein)\b/);
  assert.match(pkg.postingTimeReason, /Schätzung/);
});

test("demo plan returns one suggestion per date with varied formats", async () => {
  const demo = new DemoProvider();
  const dates = postingDates("2026-10-19", 5, "cafe");
  const plan = await demo.generatePlan(ctx, { weekStart: "2026-10-19", postingDates: dates, focus: "", platforms: ["instagram"] });
  assert.deepEqual(plan.map((d) => d.date), dates);
  assert.ok(new Set(plan.map((d) => d.format)).size >= 3);
});
