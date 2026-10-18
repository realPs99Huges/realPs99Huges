/**
 * Social platform integrations – architecture placeholder.
 *
 * No platform is connected yet. A future integration implements SocialIntegration,
 * stores OAuth tokens server-side (encrypted, never in the browser), and writes
 * performance entries with source `integration:<id>` so synced numbers stay
 * distinguishable from manual ones. Publishing must only be offered once the
 * official API permissions (e.g. Instagram Graph API content publishing) are granted.
 */

export type IntegrationCapability = "publish" | "schedule" | "insights";
export type IntegrationStatus = "not_available" | "available" | "connected";

export interface SocialIntegration {
  id: string;
  platform: string;
  capabilities: IntegrationCapability[];
  status: IntegrationStatus;
}

export const INTEGRATIONS: SocialIntegration[] = [
  { id: "meta-instagram", platform: "instagram", capabilities: ["publish", "insights"], status: "not_available" },
  { id: "meta-facebook", platform: "facebook", capabilities: ["publish", "insights"], status: "not_available" },
  { id: "tiktok", platform: "tiktok", capabilities: ["publish", "insights"], status: "not_available" },
  { id: "linkedin", platform: "linkedin", capabilities: ["publish", "insights"], status: "not_available" },
];
