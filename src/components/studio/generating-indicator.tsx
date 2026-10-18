"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useT } from "@/components/i18n-provider";

/** Progress copy shown while a request is running. Purely presentational – it does not claim real progress. */
export function GeneratingIndicator() {
  const t = useT();
  const steps = t.studio.generatingSteps;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent-strong">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      <span className="font-medium">{t.studio.generating}</span>
      <span key={index} className="animate-fade-in text-accent-strong/75">{steps[index]}</span>
    </div>
  );
}
