// Exercises the real Anthropic SDK code path against a local mock of the Messages API (no network, no cost).
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import type { BrandContext, ContentRequest } from "../src/lib/ai/types";
import type { BrandProfile } from "../src/lib/db/schema";

type Captured = { headers: http.IncomingHttpHeaders; body: Record<string, unknown> };
const captured: Captured[] = [];
let nextResponse: { status: number; body: unknown } = { status: 200, body: {} };

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    captured.push({ headers: req.headers, body: JSON.parse(raw || "{}") });
    res.writeHead(nextResponse.status, { "content-type": "application/json" });
    res.end(JSON.stringify(nextResponse.body));
  });
});

function message(payload: unknown, stop_reason = "end_turn") {
  return {
    id: "msg_test", type: "message", role: "assistant", model: "claude-opus-5-5", stop_reason, stop_sequence: null,
    content: [{ type: "text", text: JSON.stringify(payload) }],
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

const profile = {
  id: "p", userId: "u", name: "Studio Nord", industry: "gym", description: "", audience: "", location: "", language: "de",
  personality: [], formality: "du", tone: "bold", platforms: ["instagram"], goals: [], website: "", brandColors: [],
  likedPhrases: [], dislikedPhrases: [], neverInvent: "", postingFrequency: 3, createdAt: new Date(), updatedAt: new Date(),
} as BrandProfile;
const ctx: BrandContext = { profile, recentHooks: [], recentTopics: [] };
const req: ContentRequest = { industry: "gym", platform: "instagram", format: "reel", objective: "reach", topic: "Kniebeugen", details: "", tone: "bold", audience: "", language: "de", campaignDate: null, campaignName: null };
const pkg = { title: "Reel", hook: "Hook", caption: "Caption", cta: "CTA", hashtags: ["#gym"], visualConcept: "V", shotList: [{ shot: "1", detail: "d" }], onScreenText: ["T"], postingTime: "Mo 7:00", postingTimeReason: "Schätzung" };

let Provider: typeof import("../src/lib/ai/providers/anthropic").AnthropicProvider;
let AIError: typeof import("../src/lib/ai/types").AIError;

before(async () => {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  ({ AnthropicProvider: Provider } = await import("../src/lib/ai/providers/anthropic"));
  ({ AIError } = await import("../src/lib/ai/types"));
});
after(() => server.close());

test("sends a structured-output request and parses the package", async () => {
  nextResponse = { status: 200, body: message(pkg) };
  const result = await new Provider("sk-test").generateContent(ctx, req);
  assert.equal(result.hook, "Hook");
  const { headers, body } = captured.at(-1)!;
  assert.equal(body.model, "claude-opus-5-5");
  assert.equal(body.fallbacks, "default");
  assert.match(String(headers["anthropic-beta"]), /server-side-fallback-2026-07-01/);
  const outputConfig = body.output_config as { effort: string; format: { type: string } };
  assert.equal(outputConfig.format.type, "json_schema");
  assert.equal(outputConfig.effort, "low");
  assert.equal(headers["x-api-key"], "sk-test");
});

test("maps refusals, truncation and auth errors to AIError codes", async () => {
  const provider = new Provider("sk-test");
  nextResponse = { status: 200, body: message(pkg, "refusal") };
  await assert.rejects(provider.generateContent(ctx, req), (e) => e instanceof AIError && e.code === "refused");
  nextResponse = { status: 200, body: message(pkg, "max_tokens") };
  await assert.rejects(provider.generateContent(ctx, req), (e) => e instanceof AIError && e.code === "invalid_output");
  nextResponse = { status: 401, body: { type: "error", error: { type: "authentication_error", message: "bad key" } } };
  await assert.rejects(provider.generateContent(ctx, req), (e) => e instanceof AIError && e.code === "provider_auth");
});

test("rejects output that does not match the schema", async () => {
  nextResponse = { status: 200, body: message({ hook: 5 }) };
  await assert.rejects(new Provider("sk-test").generateContent(ctx, req), (e) => e instanceof AIError && e.code === "invalid_output");
});
