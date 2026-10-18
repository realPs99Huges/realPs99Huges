"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { registerUpgradeInterestAction } from "@/server/actions/settings";

/** Records upgrade interest. Does not start a subscription – no payment provider is connected. */
export function InterestButton({ plan, registered: initial }: { plan: string; registered: boolean }) {
  const t = useT();
  const toast = useToast();
  const [registered, setRegistered] = useState(initial);
  const [pending, start] = useTransition();
  if (registered) {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm font-medium text-success">
        <Check className="size-4" /> {t.billing.interestSaved}
      </p>
    );
  }
  return (
    <Button
      variant="secondary"
      className="mt-6"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await registerUpgradeInterestAction(plan);
          if (!res.ok) return toast.error(res.error);
          setRegistered(true);
          toast.success(t.billing.interestSaved);
        })
      }
    >
      {t.billing.interest}
    </Button>
  );
}
