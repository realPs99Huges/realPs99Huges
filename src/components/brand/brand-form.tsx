"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/card";
import { ChipGroup, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { fmt } from "@/i18n";
import { CONTENT_LANGUAGES, FORMALITIES, GOALS, INDUSTRIES, PERSONALITY_TRAITS, PLATFORMS, POSTING_FREQUENCIES, TONES } from "@/config/options";
import { createAdditionalProfile, deleteActiveProfile, updateProfile, type ProfileInput } from "@/server/actions/profile";

type Profile = {
  name: string;
  industry: string;
  description: string;
  audience: string;
  location: string;
  language: string;
  website: string;
  brandColors: string[];
  personality: string[];
  formality: string;
  tone: string;
  platforms: string[];
  goals: string[];
  postingFrequency: number;
  likedPhrases: string[];
  dislikedPhrases: string[];
  neverInvent: string;
};

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24 p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        </div>
        <div className="grid gap-5">{children}</div>
      </div>
    </Card>
  );
}

export function BrandForm({
  profile,
  voiceEnabled,
  profileCount,
  profileLimit,
  multipleProfiles,
}: {
  profile: Profile;
  voiceEnabled: boolean;
  profileCount: number;
  profileLimit: number;
  multipleProfiles: boolean;
}) {
  const t = useT();
  const b = t.brandProfile;
  const router = useRouter();
  const toast = useToast();
  const initial = useMemo(
    () => ({
      ...profile,
      brandColors: profile.brandColors.join(", "),
      likedPhrases: profile.likedPhrases.join("\n"),
      dislikedPhrases: profile.dislikedPhrases.join("\n"),
    }),
    [profile],
  );
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const opts = <T extends string>(ids: readonly T[], labels: Record<string, string>) => ids.map((id) => ({ value: id, label: labels[id] }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfile(form as unknown as ProfileInput);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      toast.success(b.saved);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 pb-24">
      <Section title={b.basics}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={b.name} htmlFor="bp-name" error={errors.name}>
            <Input id="bp-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} required />
          </Field>
          <Field label={b.industry} htmlFor="bp-industry">
            <Select id="bp-industry" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
              {INDUSTRIES.map((id) => (
                <option key={id} value={id}>
                  {t.options.industries[id]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={b.description} htmlFor="bp-desc" error={errors.description}>
          <Textarea id="bp-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} />
        </Field>
        <Field label={b.audience} htmlFor="bp-aud" error={errors.audience}>
          <Textarea id="bp-aud" rows={2} value={form.audience} onChange={(e) => set("audience", e.target.value)} maxLength={400} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={b.location} htmlFor="bp-loc" optional>
            <Input id="bp-loc" value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={120} />
          </Field>
          <Field label={b.website} htmlFor="bp-web" optional error={errors.website}>
            <Input id="bp-web" value={form.website} onChange={(e) => set("website", e.target.value)} maxLength={200} placeholder="www.beispiel.de" inputMode="url" />
          </Field>
          <Field label={b.language} htmlFor="bp-lang">
            <Select id="bp-lang" value={form.language} onChange={(e) => set("language", e.target.value)}>
              {CONTENT_LANGUAGES.map((id) => (
                <option key={id} value={id}>
                  {t.options.languages[id]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={b.colors} htmlFor="bp-colors" optional help={b.colorsHelp} error={errors.brandColors}>
            <div className="flex items-center gap-2">
              <Input id="bp-colors" value={form.brandColors} onChange={(e) => set("brandColors", e.target.value)} placeholder="#2F5D50, #F2E8DA" />
              <span className="flex shrink-0 gap-1" aria-hidden>
                {form.brandColors
                  .split(/[\s,]+/)
                  .filter((c) => /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(c))
                  .slice(0, 4)
                  .map((c) => (
                    <span key={c} className="size-6 rounded-md border border-line" style={{ background: c }} />
                  ))}
              </span>
            </div>
          </Field>
        </div>
      </Section>

      <Section id="voice" title={b.voice}>
        <Field label={b.tone}>
          <ChipGroup label={b.tone} options={opts(TONES, t.options.tones)} value={[form.tone]} onChange={(v) => set("tone", v[0])} />
        </Field>
        <Field label={b.formality}>
          <ChipGroup label={b.formality} options={opts(FORMALITIES, t.options.formalities)} value={[form.formality]} onChange={(v) => set("formality", v[0])} />
        </Field>
        <Field label={b.personality} error={errors.personality}>
          <ChipGroup label={b.personality} multiple max={5} options={opts(PERSONALITY_TRAITS, t.options.personality)} value={form.personality} onChange={(v) => set("personality", v)} />
        </Field>
        {!voiceEnabled && <Notice tone="neutral" icon={<Lock />}>{b.voiceLocked}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={b.liked} htmlFor="bp-liked" help={b.likedHelp} error={errors.likedPhrases}>
            <Textarea id="bp-liked" rows={4} value={form.likedPhrases} onChange={(e) => set("likedPhrases", e.target.value)} disabled={!voiceEnabled} placeholder={b.likedPlaceholder} />
          </Field>
          <Field label={b.disliked} htmlFor="bp-disliked" help={b.dislikedHelp} error={errors.dislikedPhrases}>
            <Textarea id="bp-disliked" rows={4} value={form.dislikedPhrases} onChange={(e) => set("dislikedPhrases", e.target.value)} disabled={!voiceEnabled} placeholder={b.dislikedPlaceholder} />
          </Field>
        </div>
        <Field label={b.neverInvent} htmlFor="bp-never" help={b.neverInventHelp} error={errors.neverInvent}>
          <Textarea id="bp-never" rows={3} value={form.neverInvent} onChange={(e) => set("neverInvent", e.target.value)} maxLength={1000} />
        </Field>
      </Section>

      <Section title={b.channels}>
        <Field label={b.platforms} error={errors.platforms}>
          <ChipGroup label={b.platforms} multiple options={opts(PLATFORMS, t.options.platforms)} value={form.platforms} onChange={(v) => set("platforms", v)} />
        </Field>
        <Field label={b.goals}>
          <ChipGroup label={b.goals} multiple options={opts(GOALS, t.options.goals)} value={form.goals} onChange={(v) => set("goals", v)} />
        </Field>
        <Field label={b.frequency} help={t.planner.frequencyHelp}>
          <ChipGroup
            label={b.frequency}
            options={POSTING_FREQUENCIES.map((n) => ({ value: String(n), label: fmt(t.planner.frequencyOption, { count: n }) }))}
            value={[String(form.postingFrequency)]}
            onChange={(v) => set("postingFrequency", Number(v[0]))}
          />
        </Field>
      </Section>

      <ProfilesSection profileCount={profileCount} profileLimit={profileLimit} multipleProfiles={multipleProfiles} />

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:left-[16.5rem]">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 lg:px-6">
          {dirty && <span className="text-xs text-warning">{t.editor.unsaved}</span>}
          <Button type="button" variant="ghost" disabled={!dirty || pending} onClick={() => setForm(initial)}>
            {t.common.reset}
          </Button>
          <Button type="submit" loading={pending} disabled={!dirty}>
            {t.common.save}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ProfilesSection({ profileCount, profileLimit, multipleProfiles }: { profileCount: number; profileLimit: number; multipleProfiles: boolean }) {
  const t = useT();
  const b = t.brandProfile;
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("other");
  const [pending, start] = useTransition();
  const canAdd = multipleProfiles && profileCount < profileLimit;

  return (
    <Section id="profiles" title={t.nav.profiles} description={b.newProfileText}>
      <p className="text-sm text-ink-2">{fmt(b.profileLimit, { limit: profileLimit })}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" icon={<Plus className="size-4" />} disabled={!canAdd} onClick={() => setOpen(true)}>
          {b.newProfileTitle}
        </Button>
        {profileCount > 1 && (
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:bg-danger-soft hover:text-danger"
            icon={<Trash2 className="size-4" />}
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`${b.deleteProfileText}\n\n${t.common.confirmDelete}`)) return;
              start(async () => {
                const res = await deleteActiveProfile();
                if (!res.ok) return toast.error(res.error);
                router.push("/app");
                router.refresh();
              });
            }}
          >
            {b.deleteProfile}
          </Button>
        )}
      </div>
      {!canAdd && profileLimit <= 1 && (
        <p className="text-xs text-ink-3">
          {t.common.upgradeHint} <a href="/app/settings/billing" className="text-accent underline">{t.common.seePlans}</a>
        </p>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={b.newProfileTitle}
        footer={
          <Button
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await createAdditionalProfile({ name, industry } as Parameters<typeof createAdditionalProfile>[0]);
                if (!res.ok) return toast.error(res.error);
                setOpen(false);
                router.refresh();
              })
            }
          >
            {b.createProfile}
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label={b.name} htmlFor="np-name">
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </Field>
          <Field label={b.industry} htmlFor="np-industry">
            <Select id="np-industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((id) => (
                <option key={id} value={id}>
                  {t.options.industries[id]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Dialog>
    </Section>
  );
}
