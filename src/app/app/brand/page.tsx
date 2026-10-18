import type { Metadata } from "next";
import { requireAppContext } from "@/lib/auth/session";
import { listProfiles } from "@/server/content";
import { BrandForm } from "@/components/brand/brand-form";
import { PageHeader } from "@/components/ui/card";
import { getMessages } from "@/i18n";
import { getPlan, hasFeature } from "@/config/plans";

export const metadata: Metadata = { title: "Markenprofil" };

export default async function BrandPage() {
  const t = getMessages();
  const { user, profile } = await requireAppContext();
  const profiles = await listProfiles(user.id);
  const limit = getPlan(user.plan).limits.profiles;
  return (
    <>
      <PageHeader title={t.brandProfile.title} description={t.brandProfile.subtitle} />
      <BrandForm
        key={`${profile.id}-${profile.updatedAt.toISOString()}`}
        profile={{
          name: profile.name,
          industry: profile.industry,
          description: profile.description,
          audience: profile.audience,
          location: profile.location,
          language: profile.language,
          website: profile.website,
          brandColors: profile.brandColors,
          personality: profile.personality,
          formality: profile.formality,
          tone: profile.tone,
          platforms: profile.platforms,
          goals: profile.goals,
          postingFrequency: profile.postingFrequency,
          likedPhrases: profile.likedPhrases,
          dislikedPhrases: profile.dislikedPhrases,
          neverInvent: profile.neverInvent,
        }}
        voiceEnabled={hasFeature(user.plan, "brandVoice")}
        profileCount={profiles.length}
        profileLimit={limit}
        multipleProfiles={hasFeature(user.plan, "multipleProfiles") && limit > 1}
      />
    </>
  );
}
