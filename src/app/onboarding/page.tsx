import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getActiveProfile, requireUser } from "@/lib/auth/session";
import { impulsesFor } from "@/config/idea-bank";
import { isDemoMode } from "@/lib/ai";

export const metadata: Metadata = { title: "Einrichtung" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompletedAt) redirect("/app");
  const profile = await getActiveProfile(user);
  const suggestions = Object.fromEntries(
    ["restaurant", "cafe", "bakery", "bar", "barbershop", "salon", "gym", "yoga", "retail", "fashion", "other"].map((industry) => [
      industry,
      impulsesFor(industry)
        .slice(0, 3)
        .map((i) => i.topic),
    ]),
  );
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" aria-label="PostPilot">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16">
        <OnboardingWizard
          firstName={user.name.split(" ")[0]}
          demoMode={isDemoMode()}
          suggestions={suggestions}
          initial={
            profile
              ? {
                  name: profile.name,
                  industry: profile.industry,
                  description: profile.description,
                  location: profile.location,
                  platforms: profile.platforms,
                  goals: profile.goals,
                  audience: profile.audience,
                  tone: profile.tone,
                  formality: profile.formality,
                  personality: profile.personality,
                }
              : null
          }
        />
      </main>
    </div>
  );
}
