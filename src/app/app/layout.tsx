import { AppShell } from "@/components/shell/app-shell";
import { requireAppContext } from "@/lib/auth/session";
import { listProfiles } from "@/server/content";
import { getPlan, hasFeature } from "@/config/plans";
import { isDemoMode } from "@/lib/ai";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAppContext();
  const profiles = await listProfiles(user.id);
  const canAddProfile = hasFeature(user.plan, "multipleProfiles") && profiles.length < getPlan(user.plan).limits.profiles;
  return (
    <AppShell
      userName={user.name}
      profiles={profiles.map((p) => ({ id: p.id, name: p.name, industry: p.industry }))}
      activeProfileId={profile.id}
      canAddProfile={canAddProfile}
      demoMode={isDemoMode()}
    >
      {children}
    </AppShell>
  );
}
