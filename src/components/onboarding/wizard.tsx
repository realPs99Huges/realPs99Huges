"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChipGroup, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card, Notice } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { useT } from "@/components/i18n-provider";
import { useToast } from "@/components/ui/toast";
import { fmt } from "@/i18n";
import { FORMALITIES, GOALS, INDUSTRIES, PERSONALITY_TRAITS, PLATFORMS, TONES } from "@/config/options";
import { completeOnboarding, markOnboardingComplete, saveOnboardingProfile, type OnboardingInput } from "@/server/actions/profile";
import { generateContentAction, type GenerateInput } from "@/server/actions/content";
import { GeneratingIndicator } from "@/components/studio/generating-indicator";

type State = {
  name: string;
  industry: string;
  description: string;
  location: string;
  platforms: string[];
  goals: string[];
  audience: string;
  tone: string;
  formality: string;
  personality: string[];
};

const DEFAULTS: State = {
  name: "",
  industry: "",
  description: "",
  location: "",
  platforms: ["instagram"],
  goals: ["more_customers"],
  audience: "",
  tone: "friendly",
  formality: "du",
  personality: [],
};

export function OnboardingWizard({
  initial,
  firstName,
  demoMode,
  suggestions,
}: {
  initial: State | null;
  firstName: string;
  demoMode: boolean;
  suggestions: Record<string, string[]>;
}) {
  const t = useT();
  const o = t.onboarding;
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(initial ? 3 : 0);
  const [data, setData] = useState<State>(initial ?? DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("feed_post");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof State>(key: K, value: State[K]) => setData((d) => ({ ...d, [key]: value }));
  const opts = <T extends string>(ids: readonly T[], labels: Record<string, string>) => ids.map((id) => ({ value: id, label: labels[id] }));

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!data.name.trim()) next.name = t.validation.required;
      if (!data.industry) next.industry = t.validation.required;
    }
    if (step === 1 && !data.platforms.length) next.platforms = t.validation.selectOne;
    setErrors(next);
    return !Object.keys(next).length;
  }

  function nextStep() {
    if (!validateStep()) return;
    if (step < 2) return setStep(step + 1);
    start(async () => {
      const res = await saveOnboardingProfile(data as OnboardingInput);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        if (res.fieldErrors?.name || res.fieldErrors?.industry) setStep(0);
        return;
      }
      setStep(3);
    });
  }

  function generate() {
    if (!topic.trim()) {
      setErrors({ topic: t.validation.required });
      return;
    }
    setErrors({});
    setGenerateError(null);
    start(async () => {
      const res = await generateContentAction({
        industry: data.industry,
        platform: data.platforms[0] ?? "instagram",
        format,
        objective: data.goals.includes("brand_awareness") ? "awareness" : "engagement",
        topic,
        details: "",
        tone: data.tone,
        audience: data.audience,
        language: "de",
        campaignDate: null,
        campaignId: null,
      } as GenerateInput);
      if (!res.ok) {
        setGenerateError(res.error);
        return;
      }
      await markOnboardingComplete();
      router.push(`/app/content/${res.data.id}?new=1&first=1`);
    });
  }

  const ideas = suggestions[data.industry] ?? suggestions.other ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">{fmt(o.stepOf, { current: step + 1, total: 4 })}</p>
        <h1 className="mt-1 font-display text-[1.75rem] font-semibold text-ink sm:text-[2.125rem]">
          {step === 0 ? `${o.title}, ${firstName}` : [o.businessTitle, o.platformsTitle, o.toneTitle, o.firstTitle][step]}
        </h1>
        <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Fortschritt">
          {o.steps.map((label, i) => (
            <li key={label} className="flex flex-col gap-1.5">
              <span className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-line-strong")} />
              <span className={cn("hidden text-xs sm:block", i === step ? "font-medium text-ink" : "text-ink-3")}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <Card className="animate-rise p-5 sm:p-8" key={step}>
        {step === 0 && (
          <div className="grid gap-5">
            <p className="text-ink-2">{o.businessSub}</p>
            <Field label={o.businessName} htmlFor="ob-name" error={errors.name}>
              <Input id="ob-name" value={data.name} onChange={(e) => set("name", e.target.value)} placeholder={o.businessNamePlaceholder} maxLength={80} autoFocus aria-invalid={!!errors.name} />
            </Field>
            <Field label={o.industry} htmlFor="ob-industry" error={errors.industry}>
              <Select id="ob-industry" value={data.industry} onChange={(e) => set("industry", e.target.value)} aria-invalid={!!errors.industry}>
                <option value="" disabled>
                  —
                </option>
                {INDUSTRIES.map((id) => (
                  <option key={id} value={id}>
                    {t.options.industries[id]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={o.description} htmlFor="ob-desc" optional>
              <Textarea id="ob-desc" rows={3} value={data.description} onChange={(e) => set("description", e.target.value)} placeholder={o.descriptionPlaceholder} maxLength={600} />
            </Field>
            <Field label={o.location} htmlFor="ob-loc" optional>
              <Input id="ob-loc" value={data.location} onChange={(e) => set("location", e.target.value)} placeholder={o.locationPlaceholder} maxLength={120} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-7">
            <Field label={o.platformsSub} error={errors.platforms}>
              <ChipGroup label={o.platformsTitle} multiple options={opts(PLATFORMS, t.options.platforms)} value={data.platforms} onChange={(v) => set("platforms", v)} />
              {data.platforms[0] && (
                <p className="text-xs text-ink-3">
                  {o.mainPlatform}: <span className="font-medium text-ink-2">{t.options.platforms[data.platforms[0] as keyof typeof t.options.platforms]}</span>
                </p>
              )}
            </Field>
            <Field label={o.goalTitle}>
              <ChipGroup label={o.goalTitle} options={opts(GOALS, t.options.goals)} value={data.goals.slice(0, 1)} onChange={(v) => set("goals", v)} />
            </Field>
            <Field label={o.audience} htmlFor="ob-aud" optional>
              <Input id="ob-aud" value={data.audience} onChange={(e) => set("audience", e.target.value)} placeholder={o.audiencePlaceholder} maxLength={300} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-7">
            <p className="text-ink-2">{o.toneSub}</p>
            <Field label={t.studio.tone}>
              <ChipGroup label={t.studio.tone} options={opts(TONES, t.options.tones)} value={[data.tone]} onChange={(v) => set("tone", v[0])} />
            </Field>
            <Field label={o.formality}>
              <ChipGroup label={o.formality} options={opts(FORMALITIES, t.options.formalities)} value={[data.formality]} onChange={(v) => set("formality", v[0])} />
            </Field>
            <Field label={o.personality} optional help={o.personalityHelp}>
              <ChipGroup label={o.personality} multiple max={3} options={opts(PERSONALITY_TRAITS, t.options.personality)} value={data.personality} onChange={(v) => set("personality", v)} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6">
            <p className="text-ink-2">{o.firstSub}</p>
            {demoMode && <Notice tone="warning" icon={<TriangleAlert />}>{t.dashboard.demoModeText}</Notice>}
            <Field label={o.firstTopic} htmlFor="ob-topic" error={errors.topic}>
              <Input id="ob-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={o.firstTopicPlaceholder} maxLength={200} autoFocus aria-invalid={!!errors.topic} />
            </Field>
            {ideas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ideas.map((idea) => (
                  <button key={idea} type="button" onClick={() => setTopic(idea)} className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3 hover:text-ink">
                    {idea}
                  </button>
                ))}
              </div>
            )}
            <Field label={t.studio.format}>
              <ChipGroup
                label={t.studio.format}
                options={(["feed_post", "reel", "story", "carousel"] as const).map((id) => ({ value: id, label: t.options.formats[id] }))}
                value={[format]}
                onChange={(v) => setFormat(v[0])}
              />
            </Field>
            {generateError && <Notice tone="warning" icon={<TriangleAlert />}>{generateError}</Notice>}
            {pending && <GeneratingIndicator />}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={pending} icon={<ArrowLeft className="size-4" />}>
              {t.common.back}
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {step === 2 && (
                <Button variant="ghost" onClick={nextStep} disabled={pending}>
                  {t.common.skip}
                </Button>
              )}
              <Button size="lg" onClick={nextStep} loading={pending}>
                {pending ? o.creatingProfile : t.common.next}
                {!pending && <ArrowRight className="size-4" />}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="ghost" disabled={pending} onClick={() => start(() => completeOnboarding("/app"))}>
                {o.skipToDashboard}
              </Button>
              <Button size="lg" onClick={generate} loading={pending} icon={<Sparkles className="size-4" />}>
                {o.generate}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
