"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, Info, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipGroup, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/card";
import { useT } from "@/components/i18n-provider";
import { CONTENT_LANGUAGES, FORMATS, INDUSTRIES, OBJECTIVES, PLATFORMS, TONES } from "@/config/options";
import { generateContentAction, type GenerateInput } from "@/server/actions/content";
import { GeneratingIndicator } from "./generating-indicator";

export type StudioDefaults = {
  industry: string;
  platform: string;
  format: string;
  objective: string;
  topic: string;
  details: string;
  tone: string;
  audience: string;
  language: string;
  campaignDate: string;
  campaignId: string;
};

export function StudioForm({
  defaults,
  campaigns,
  prefilled,
  demoMode,
  usageLabel,
  limitReached,
}: {
  defaults: StudioDefaults;
  campaigns: { id: string; name: string }[];
  prefilled: boolean;
  demoMode: boolean;
  usageLabel: string;
  limitReached: boolean;
}) {
  const t = useT();
  const s = t.studio;
  const router = useRouter();
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof StudioDefaults>(key: K, value: StudioDefaults[K]) => setForm((f) => ({ ...f, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.topic.trim()) {
      setErrors({ topic: t.validation.required });
      return;
    }
    setErrors({});
    setError(null);
    start(async () => {
      const res = await generateContentAction({ ...form, campaignId: form.campaignId || null, campaignDate: form.campaignDate || null } as GenerateInput);
      if (!res.ok) {
        setError(res.error);
        setErrors(res.fieldErrors ?? {});
        return;
      }
      router.push(`/app/content/${res.data.id}?new=1`);
    });
  }

  return (
    <Card className="p-5 sm:p-7">
      <form onSubmit={submit} className="grid gap-6" aria-busy={pending}>
        {prefilled && <Notice tone="accent" icon={<Info />}>{s.prefilledFrom}</Notice>}
        {demoMode && <Notice tone="warning" icon={<TriangleAlert />}>{t.dashboard.demoModeText}</Notice>}

        <Field label={s.topic} htmlFor="st-topic" error={errors.topic}>
          <Input
            id="st-topic"
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder={s.topicPlaceholder}
            maxLength={200}
            className="h-12 text-base"
            aria-invalid={!!errors.topic}
            autoFocus={!prefilled}
          />
        </Field>

        <Field label={s.format}>
          <ChipGroup label={s.format} options={FORMATS.map((id) => ({ value: id, label: t.options.formats[id] }))} value={[form.format]} onChange={(v) => set("format", v[0])} />
        </Field>

        <Field label={s.objective}>
          <ChipGroup label={s.objective} options={OBJECTIVES.map((id) => ({ value: id, label: t.options.objectives[id] }))} value={[form.objective]} onChange={(v) => set("objective", v[0])} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={s.platform} htmlFor="st-platform">
            <Select id="st-platform" value={form.platform} onChange={(e) => set("platform", e.target.value)}>
              {PLATFORMS.map((id) => (
                <option key={id} value={id}>
                  {t.options.platforms[id]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={s.tone} htmlFor="st-tone">
            <Select id="st-tone" value={form.tone} onChange={(e) => set("tone", e.target.value)}>
              {TONES.map((id) => (
                <option key={id} value={id}>
                  {t.options.tones[id]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={s.topicDetails} htmlFor="st-details" optional error={errors.details}>
          <Textarea id="st-details" rows={3} value={form.details} onChange={(e) => set("details", e.target.value)} placeholder={s.topicDetailsPlaceholder} maxLength={1200} />
        </Field>

        <details className="group rounded-xl border border-line bg-surface-2/50 px-4 py-3 open:pb-5">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink-2 marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
              {s.moreSettings}
              <span className="text-xs font-normal text-ink-3">
                {t.options.industries[form.industry as keyof typeof t.options.industries]} · {t.options.languages[form.language as keyof typeof t.options.languages]}
              </span>
            </span>
          </summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={s.businessType} htmlFor="st-industry">
              <Select id="st-industry" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                {INDUSTRIES.map((id) => (
                  <option key={id} value={id}>
                    {t.options.industries[id]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={s.language} htmlFor="st-lang">
              <Select id="st-lang" value={form.language} onChange={(e) => set("language", e.target.value)}>
                {CONTENT_LANGUAGES.map((id) => (
                  <option key={id} value={id}>
                    {t.options.languages[id]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={s.audience} htmlFor="st-aud" className="sm:col-span-2">
              <Input id="st-aud" value={form.audience} onChange={(e) => set("audience", e.target.value)} maxLength={300} />
            </Field>
            <Field label={s.campaignDate} htmlFor="st-date" optional error={errors.campaignDate}>
              <Input id="st-date" type="date" value={form.campaignDate} onChange={(e) => set("campaignDate", e.target.value)} />
            </Field>
            {campaigns.length > 0 && (
              <Field label={s.campaign} htmlFor="st-campaign" optional>
                <Select id="st-campaign" value={form.campaignId} onChange={(e) => set("campaignId", e.target.value)}>
                  <option value="">{s.noCampaign}</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </details>

        {error && (
          <Notice tone="warning" icon={<TriangleAlert />}>
            {error}
            {limitReached && (
              <>
                {" "}
                <Link href="/app/settings/billing">{t.common.seePlans}</Link>
              </>
            )}
          </Notice>
        )}
        {pending && <GeneratingIndicator />}

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-3">{usageLabel}</p>
          <Button type="submit" size="lg" loading={pending} disabled={limitReached} icon={<Sparkles className="size-4" />}>
            {pending ? s.generating : s.generate}
          </Button>
        </div>
        {limitReached && (
          <Notice tone="warning" icon={<TriangleAlert />}>
            {t.billing.limitReached} <Link href="/app/settings/billing">{t.common.seePlans}</Link>
          </Notice>
        )}
      </form>
    </Card>
  );
}
