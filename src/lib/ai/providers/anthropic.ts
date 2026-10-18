import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { contentPackageSchema, planSchema, sectionSchemas } from "../schemas";
import { contentPrompt, dayPrompt, planPrompt, sectionPrompt, SYSTEM_PROMPT } from "../prompts";
import { AIError, type AIProvider, type BrandContext, type ContentPackage, type ContentRequest, type DayRequest, type PlanRequest, type PlanSuggestion, type Section, type SectionPatch } from "../types";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export class AnthropicProvider implements AIProvider {
  readonly mode = "live" as const;
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;
  private effort: Effort;

  constructor(apiKey: string) {
    // Keep well below typical serverless limits; one SDK retry handles transient 429/5xx.
    this.client = new Anthropic({ apiKey, timeout: 55_000, maxRetries: 1 });
    this.model = process.env.AI_MODEL || "claude-opus-5-5";
    this.effort = (process.env.AI_EFFORT as Effort) || "low";
  }

  private async run<T extends z.ZodType>(schema: T, prompt: string, maxTokens: number): Promise<z.infer<T>> {
    try {
      const response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: maxTokens,
        // Server-side fallback re-runs a declined request on a suitable model within the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        output_config: { effort: this.effort, format: betaZodOutputFormat(schema) },
        messages: [{ role: "user", content: prompt }],
      });
      if (response.stop_reason === "refusal") throw new AIError("refused");
      if (response.stop_reason === "max_tokens") throw new AIError("invalid_output", "Output truncated");
      if (!response.parsed_output) throw new AIError("invalid_output");
      return response.parsed_output as z.infer<T>;
    } catch (error) {
      throw mapError(error);
    }
  }

  generateContent(ctx: BrandContext, req: ContentRequest): Promise<ContentPackage> {
    return this.run(contentPackageSchema, contentPrompt(ctx, req), 8000);
  }

  async regenerateSection(
    ctx: BrandContext,
    req: ContentRequest,
    current: ContentPackage,
    section: Section,
    hint: string,
  ): Promise<SectionPatch> {
    return this.run(sectionSchemas[section], sectionPrompt(ctx, req, current, section, hint), 4000);
  }

  async generatePlan(ctx: BrandContext, req: PlanRequest): Promise<PlanSuggestion[]> {
    const result = await this.run(planSchema, planPrompt(ctx, req), 8000);
    return result.days;
  }

  async regenerateDay(ctx: BrandContext, req: DayRequest): Promise<PlanSuggestion> {
    const result = await this.run(planSchema, dayPrompt(ctx, req), 3000);
    const day = result.days[0];
    if (!day) throw new AIError("invalid_output");
    return { ...day, date: req.date };
  }
}

function mapError(error: unknown): AIError {
  if (error instanceof AIError) return error;
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new AIError("provider_auth");
  }
  if (error instanceof Anthropic.RateLimitError) return new AIError("provider_busy");
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new AIError("timeout");
  if (error instanceof Anthropic.APIConnectionError) return new AIError("provider_busy");
  if (error instanceof Anthropic.InternalServerError) return new AIError("provider_busy");
  if (error instanceof Anthropic.APIError) {
    if (error.status === 529) return new AIError("provider_busy");
    console.error("[ai] API error", error.status, error.message);
    return new AIError("unknown");
  }
  // Schema validation failures from the parse helper surface as plain errors.
  console.error("[ai] unexpected error", error);
  return new AIError("invalid_output");
}
