import type { z } from "zod";
import { getMessages, fmt } from "@/i18n";
import { AIError } from "@/lib/ai/types";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T): ActionResult<T>;
export function ok(): ActionResult<undefined>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string>): { ok: false; error: string; fieldErrors?: Record<string, string> } {
  return { ok: false, error, fieldErrors };
}

export function validationFailure(error: z.ZodError) {
  const t = getMessages();
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail(t.validation.invalid, fieldErrors);
}

export function aiFailure(error: unknown) {
  const t = getMessages();
  if (error instanceof AIError) {
    switch (error.code) {
      case "limit_reached": {
        const kind = (error.detail?.kind ?? "generations") as keyof typeof t.ai.kinds;
        return fail(fmt(t.ai.limitReached, { kind: t.ai.kinds[kind] ?? kind }));
      }
      case "rate_limited":
        return fail(t.ai.rateLimited);
      case "provider_busy":
        return fail(t.ai.providerBusy);
      case "provider_auth":
        return fail(t.ai.providerAuth);
      case "invalid_output":
        return fail(t.ai.invalidOutput);
      case "refused":
        return fail(t.ai.refused);
      case "timeout":
        return fail(t.ai.timeout);
      default:
        return fail(t.common.genericError);
    }
  }
  console.error("[action] unexpected error", error);
  return fail(t.common.genericError);
}
