import { Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getMessages } from "@/i18n";

export function LockedFeature() {
  const t = getMessages();
  return (
    <EmptyState
      icon={<Lock className="size-5" />}
      title={t.common.upgradeHint}
      action={
        <ButtonLink href="/app/settings/billing" variant="secondary">
          {t.common.seePlans}
        </ButtonLink>
      }
    />
  );
}
