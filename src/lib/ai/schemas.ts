import { z } from "zod";
import { FORMATS, OBJECTIVES, PLATFORMS } from "@/config/options";

// Schemas sent to the model as structured-output formats. Length limits are enforced
// afterwards in normalize*, because JSON-schema constraints are not all supported upstream.

export const shotSchema = z.object({
  shot: z.string().describe("Short name of the shot, e.g. 'Close-up: Crema'"),
  detail: z.string().describe("Concrete filming instruction: framing, movement, duration"),
});

export const contentPackageSchema = z.object({
  title: z.string().describe("Internal working title, max ~60 characters"),
  hook: z.string().describe("Opening line that stops the scroll"),
  caption: z.string().describe("Full caption ready to paste: starts with the hook line, ends with the call to action, uses line breaks; no hashtags"),
  cta: z.string().describe("One clear call to action"),
  hashtags: z.array(z.string()).describe("Hashtags without spaces, each starting with #"),
  visualConcept: z.string().describe("What the image/video shows, composition, mood, colours"),
  shotList: z.array(shotSchema).describe("Shots for video formats; empty array for static posts"),
  onScreenText: z.array(z.string()).describe("Short text overlays in order"),
  postingTime: z.string().describe("Suggested weekday and time window, e.g. 'Donnerstag, 11:30–12:30'"),
  postingTimeReason: z.string().describe("One sentence why, phrased as an estimate"),
});

export const sectionSchemas = {
  hook: z.object({ hook: z.string() }),
  caption: z.object({ caption: z.string() }),
  cta: z.object({ cta: z.string() }),
  hashtags: z.object({ hashtags: z.array(z.string()) }),
  visualConcept: z.object({ visualConcept: z.string() }),
  shotList: z.object({ shotList: z.array(shotSchema) }),
  onScreenText: z.object({ onScreenText: z.array(z.string()) }),
  postingTime: z.object({ postingTime: z.string(), postingTimeReason: z.string() }),
} as const;

export const planSuggestionSchema = z.object({
  date: z.string().describe("ISO date YYYY-MM-DD, must be one of the requested posting dates"),
  topic: z.string(),
  format: z.enum(FORMATS),
  platform: z.enum(PLATFORMS),
  goal: z.enum(OBJECTIVES),
  hook: z.string(),
  idea: z.string().describe("2-3 sentences describing the content"),
  cta: z.string(),
});

export const planSchema = z.object({ days: z.array(planSuggestionSchema) });
