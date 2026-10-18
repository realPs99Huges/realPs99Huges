import "server-only";
import type { AIProvider } from "./types";
import { DemoProvider } from "./providers/demo";

let cached: AIProvider | null = null;

/**
 * Resolves the configured AI provider. Add a provider by implementing AIProvider and
 * registering it here – nothing else in the application depends on a specific vendor.
 *
 *   AI_PROVIDER=anthropic (default when ANTHROPIC_API_KEY is set) | demo
 */
export async function getAIProvider(): Promise<AIProvider> {
  if (cached) return cached;
  const requested = (process.env.AI_PROVIDER || "").toLowerCase();
  const key = process.env.ANTHROPIC_API_KEY;
  if (requested !== "demo" && key) {
    const { AnthropicProvider } = await import("./providers/anthropic");
    cached = new AnthropicProvider(key);
  } else {
    cached = new DemoProvider();
  }
  return cached;
}

export function isDemoMode(): boolean {
  return (process.env.AI_PROVIDER || "").toLowerCase() === "demo" || !process.env.ANTHROPIC_API_KEY;
}
