"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { useT } from "@/components/i18n-provider";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <EmptyState
      icon={<TriangleAlert className="size-5" />}
      title={t.common.errorTitle}
      text={t.common.errorText}
      action={<Button onClick={reset}>{t.common.retry}</Button>}
      className="mt-10"
    />
  );
}
