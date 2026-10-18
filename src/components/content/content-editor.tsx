"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  ArrowLeft,
  Bookmark,
  CalendarPlus,
  CircleCheck,
  Clock,
  Plus,
  RefreshCw,
  Repeat,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { SourceBadge, StatusBadge } from "@/components/content-badges";
import { fmt } from "@/i18n";
import { CONTENT_LANGUAGES, FORMATS, isVideoFormat, OBJECTIVES, PLATFORMS, STATUSES } from "@/config/options";
import type { ContentItem, ShotListItem } from "@/lib/db/schema";
import type { Section } from "@/lib/ai/types";
import { formatDate } from "@/lib/dates";
import {
  deleteContentAction,
  regenerateSectionAction,
  saveContentAction,
  saveHookAction,
  toggleFavoriteAction,
  type SaveContentInput,
} from "@/server/actions/content";

type SerializedItem = Omit<ContentItem, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

type Draft = {
  title: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  visualConcept: string;
  shotList: ShotListItem[];
  onScreenText: string;
  postingTime: string;
  postingTimeReason: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: string;
  format: string;
  objective: string;
  language: string;
  campaignId: string;
};

function toDraft(item: SerializedItem): Draft {
  return {
    title: item.title,
    hook: item.hook,
    caption: item.caption,
    cta: item.cta,
    hashtags: item.hashtags.join(" "),
    visualConcept: item.visualConcept,
    shotList: item.shotList,
    onScreenText: item.onScreenText.join("\n"),
    postingTime: item.postingTime,
    postingTimeReason: item.postingTimeReason,
    status: item.status,
    scheduledDate: item.scheduledDate ?? "",
    scheduledTime: item.scheduledTime ?? "",
    platform: item.platform,
    format: item.format,
    objective: item.objective,
    language: item.language,
    campaignId: item.campaignId ?? "",
  };
}

const splitTags = (value: string) => value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
const splitLines = (value: string) => value.split("\n").map((s) => s.trim()).filter(Boolean);

function packageOf(d: Draft) {
  return {
    title: d.title,
    hook: d.hook,
    caption: d.caption,
    cta: d.cta,
    hashtags: splitTags(d.hashtags),
    visualConcept: d.visualConcept,
    shotList: d.shotList,
    onScreenText: splitLines(d.onScreenText),
    postingTime: d.postingTime,
    postingTimeReason: d.postingTimeReason,
  };
}

export function ContentEditor({
  item,
  campaigns,
  isNew,
  isFirst,
  today,
  liveAi,
}: {
  item: SerializedItem;
  campaigns: { id: string; name: string }[];
  isNew: boolean;
  isFirst: boolean;
  today: string;
  liveAi: boolean;
}) {
  const t = useT();
  const e = t.editor;
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState<Draft>(() => toDraft(item));
  const [draft, setDraft] = useState<Draft>(() => toDraft(item));
  const [favorite, setFavorite] = useState(item.isFavorite);
  const [regenerating, setRegenerating] = useState<Section | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSave] = useTransition();
  const [busy, startBusy] = useTransition();
  const [showNew, setShowNew] = useState(isNew);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const video = isVideoFormat(draft.format);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (isNew) router.replace(`/app/content/${item.id}`, { scroll: false });
  }, [isNew, item.id, router]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function save(overrides: Partial<Draft> = {}, successMessage: string = t.common.saved) {
    const next = { ...draft, ...overrides };
    startSave(async () => {
      const input: SaveContentInput = {
        id: item.id,
        ...packageOf(next),
        topic: item.topic,
        tone: item.tone as SaveContentInput["tone"],
        audience: item.audience,
        platform: next.platform as SaveContentInput["platform"],
        format: next.format as SaveContentInput["format"],
        objective: next.objective as SaveContentInput["objective"],
        language: next.language as SaveContentInput["language"],
        status: next.status as SaveContentInput["status"],
        scheduledDate: next.scheduledDate || null,
        scheduledTime: next.scheduledTime || null,
        campaignId: next.campaignId || null,
      };
      const res = await saveContentAction(input);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      setDraft(next);
      setSaved(next);
      toast.success(successMessage);
      router.refresh();
    });
  }

  function regenerate(section: Section, hint: string) {
    setRegenerating(section);
    startBusy(async () => {
      const res = await regenerateSectionAction({ id: item.id, section, hint, current: packageOf(draft) });
      setRegenerating(null);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const patch = res.data;
      const mapped: Partial<Draft> = {};
      if (patch.hook !== undefined) mapped.hook = patch.hook;
      if (patch.caption !== undefined) mapped.caption = patch.caption;
      if (patch.cta !== undefined) mapped.cta = patch.cta;
      if (patch.hashtags !== undefined) mapped.hashtags = patch.hashtags.join(" ");
      if (patch.visualConcept !== undefined) mapped.visualConcept = patch.visualConcept;
      if (patch.shotList !== undefined) mapped.shotList = patch.shotList;
      if (patch.onScreenText !== undefined) mapped.onScreenText = patch.onScreenText.join("\n");
      if (patch.postingTime !== undefined) mapped.postingTime = patch.postingTime;
      if (patch.postingTimeReason !== undefined) mapped.postingTimeReason = patch.postingTimeReason;
      // The server already persisted the new section, so it becomes part of the saved baseline.
      setDraft((d) => ({ ...d, ...mapped }));
      setSaved((s) => ({ ...s, ...mapped }));
    });
  }

  const fullText = [draft.caption, splitTags(draft.hashtags).join(" ")].filter(Boolean).join("\n\n");

  return (
    <div className="pb-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/studio" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
          <ArrowLeft className="size-4" /> {e.backToStudio}
        </Link>
        <div className="flex items-center gap-2">
          <SourceBadge source={item.source} />
          <StatusBadge status={saved.status} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {showNew && (
          <Notice tone="success" icon={<CircleCheck />} className="animate-rise">
            <div className="flex items-start justify-between gap-3">
              <span>{e.newBanner}</span>
              <button type="button" onClick={() => setShowNew(false)} aria-label={t.common.close} className="opacity-70 hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          </Notice>
        )}
        {item.source === "demo" && <Notice tone="warning" icon={<TriangleAlert />}>{e.demoBanner}</Notice>}
        {isFirst && !saved.scheduledDate && (
          <Notice tone="accent" icon={<CalendarPlus />}>
            <span className="font-medium">{e.firstStepTitle}</span> {e.firstStepText}
          </Notice>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="ed-title" className="sr-only">
          {e.title}
        </label>
        <input
          id="ed-title"
          value={draft.title}
          onChange={(ev) => set("title", ev.target.value)}
          maxLength={120}
          className="w-full rounded-lg bg-transparent font-display text-[1.6rem] font-semibold leading-tight text-ink outline-none placeholder:text-ink-3 focus:bg-surface-2/60 sm:text-[1.9rem]"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard label={e.sections.hook} help={e.hookHelp} section="hook" copyText={draft.hook} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <Textarea rows={2} value={draft.hook} onChange={(ev) => set("hook", ev.target.value)} maxLength={300} className="text-[1.0625rem] font-medium" aria-label={e.hook} />
          </SectionCard>

          <SectionCard
            label={e.sections.caption}
            section="caption"
            copyText={draft.caption}
            onRegenerate={regenerate}
            regenerating={regenerating}
            canRegenerate={!busy}
            meta={fmt(e.characters, { count: draft.caption.length })}
          >
            <Textarea rows={9} value={draft.caption} onChange={(ev) => set("caption", ev.target.value)} maxLength={2200} aria-label={e.caption} />
          </SectionCard>

          <SectionCard label={e.sections.cta} section="cta" copyText={draft.cta} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <Input value={draft.cta} onChange={(ev) => set("cta", ev.target.value)} maxLength={300} aria-label={e.cta} />
          </SectionCard>

          <SectionCard label={e.sections.hashtags} help={e.hashtagsHelp} section="hashtags" copyText={splitTags(draft.hashtags).join(" ")} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <Textarea rows={2} value={draft.hashtags} onChange={(ev) => set("hashtags", ev.target.value)} aria-label={e.hashtags} className="font-mono text-sm" />
          </SectionCard>

          <SectionCard label={e.sections.visualConcept} section="visualConcept" copyText={draft.visualConcept} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <Textarea rows={4} value={draft.visualConcept} onChange={(ev) => set("visualConcept", ev.target.value)} maxLength={1500} aria-label={e.visualConcept} />
          </SectionCard>

          {(video || draft.shotList.length > 0) && (
            <SectionCard
              label={e.sections.shotList}
              section="shotList"
              copyText={draft.shotList.map((s, i) => `${i + 1}. ${s.shot}: ${s.detail}`).join("\n")}
              onRegenerate={regenerate}
              regenerating={regenerating}
              canRegenerate={!busy && video}
            >
              <ol className="flex flex-col gap-2.5">
                {draft.shotList.map((shot, index) => (
                  <li key={index} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-2">
                    <span className="mt-2.5 text-right text-xs font-semibold text-ink-3">{index + 1}</span>
                    <div className="grid gap-1.5 sm:grid-cols-[11rem_minmax(0,1fr)]">
                      <Input
                        value={shot.shot}
                        aria-label={`${e.shot} ${index + 1}`}
                        placeholder={e.shot}
                        maxLength={120}
                        onChange={(ev) => set("shotList", draft.shotList.map((s, i) => (i === index ? { ...s, shot: ev.target.value } : s)))}
                        className="h-10 text-sm font-medium"
                      />
                      <Input
                        value={shot.detail}
                        aria-label={`${e.shotDetail} ${index + 1}`}
                        placeholder={e.shotDetail}
                        maxLength={400}
                        onChange={(ev) => set("shotList", draft.shotList.map((s, i) => (i === index ? { ...s, detail: ev.target.value } : s)))}
                        className="h-10 text-sm"
                      />
                    </div>
                    <Button variant="ghost" size="icon" aria-label={t.common.remove} onClick={() => set("shotList", draft.shotList.filter((_, i) => i !== index))}>
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ol>
              <Button variant="ghost" size="sm" className="mt-2 self-start" icon={<Plus className="size-4" />} onClick={() => set("shotList", [...draft.shotList, { shot: "", detail: "" }])} disabled={draft.shotList.length >= 12}>
                {e.addShot}
              </Button>
            </SectionCard>
          )}

          <SectionCard label={e.sections.onScreenText} help={e.onScreenTextHelp} section="onScreenText" copyText={draft.onScreenText} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <Textarea rows={3} value={draft.onScreenText} onChange={(ev) => set("onScreenText", ev.target.value)} aria-label={e.onScreenText} />
          </SectionCard>

          <SectionCard label={e.sections.postingTime} section="postingTime" copyText={draft.postingTime} onRegenerate={regenerate} regenerating={regenerating} canRegenerate={!busy}>
            <div className="grid gap-2">
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                <Input value={draft.postingTime} onChange={(ev) => set("postingTime", ev.target.value)} maxLength={80} className="pl-10" aria-label={e.postingTime} />
              </div>
              <Textarea rows={2} value={draft.postingTimeReason} onChange={(ev) => set("postingTimeReason", ev.target.value)} maxLength={300} className="text-sm text-ink-2" aria-label={e.postingTime} />
              <p className="text-xs text-ink-3">{e.postingTimeEstimate}</p>
            </div>
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <div className="flex flex-col gap-4">
              <Field label={e.status} htmlFor="ed-status">
                <Select id="ed-status" value={draft.status} onChange={(ev) => set("status", ev.target.value)}>
                  {STATUSES.map((id) => (
                    <option key={id} value={id}>
                      {t.options.statuses[id]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
                <Field label={e.date} htmlFor="ed-date" error={errors.scheduledDate}>
                  <Input id="ed-date" type="date" value={draft.scheduledDate} onChange={(ev) => set("scheduledDate", ev.target.value)} aria-invalid={!!errors.scheduledDate} />
                </Field>
                <Field label={e.time} htmlFor="ed-time">
                  <Input id="ed-time" type="time" value={draft.scheduledTime} onChange={(ev) => set("scheduledTime", ev.target.value)} />
                </Field>
              </div>
              {saved.status !== "published" && (
                <Button
                  variant="accent-soft"
                  icon={<CalendarPlus className="size-4" />}
                  loading={saving}
                  onClick={() => {
                    const date = draft.scheduledDate || today;
                    save({ scheduledDate: date, status: draft.status === "published" ? "published" : "scheduled" }, `${t.calendar.title}: ${formatDate(date)}`);
                  }}
                >
                  {e.addToCalendar}
                </Button>
              )}
              {saved.status === "published" && item.publishedAt ? (
                <p className="flex items-center gap-2 text-sm text-success">
                  <CircleCheck className="size-4" /> {fmt(e.publishedOn, { date: new Date(item.publishedAt).toLocaleDateString("de-DE") })}
                </p>
              ) : (
                <Button variant="secondary" icon={<CircleCheck className="size-4" />} loading={saving} onClick={() => save({ status: "published", scheduledDate: draft.scheduledDate || today }, e.markPublished)}>
                  {e.markPublished}
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[0.8125rem] font-semibold text-ink">{e.details}</p>
            <div className="flex flex-col gap-3">
              <MiniSelect label={t.studio.platform} value={draft.platform} onChange={(v) => set("platform", v)} options={PLATFORMS.map((id) => [id, t.options.platforms[id]])} />
              <MiniSelect label={t.studio.format} value={draft.format} onChange={(v) => set("format", v)} options={FORMATS.map((id) => [id, t.options.formats[id]])} />
              <MiniSelect label={t.studio.objective} value={draft.objective} onChange={(v) => set("objective", v)} options={OBJECTIVES.map((id) => [id, t.options.objectives[id]])} />
              <MiniSelect label={t.studio.language} value={draft.language} onChange={(v) => set("language", v)} options={CONTENT_LANGUAGES.map((id) => [id, t.options.languages[id]])} />
              {campaigns.length > 0 && (
                <MiniSelect label={t.studio.campaign} value={draft.campaignId} onChange={(v) => set("campaignId", v)} options={[["", t.studio.noCampaign], ...campaigns.map((c) => [c.id, c.name] as [string, string])]} />
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={() => save()} loading={saving} disabled={!dirty && !saving}>
              {dirty ? t.common.save : t.common.saved}
            </Button>
            {dirty && <p className="text-center text-xs text-warning">{e.unsaved}</p>}
            <CopyButton text={fullText} label={e.copyAll} variant="secondary" size="md" />
            <p className="px-1 text-xs leading-relaxed text-ink-3">{e.manualPublishNote}</p>
          </div>

          <Card className="p-2">
            <div className="flex flex-col">
              <ActionRow
                icon={<Star className={cn("size-4", favorite && "fill-warning text-warning")} />}
                label={favorite ? e.unfavorite : e.favorite}
                disabled={busy}
                onClick={() =>
                  startBusy(async () => {
                    const res = await toggleFavoriteAction(item.id);
                    if (res.ok) setFavorite(res.data.isFavorite);
                    else toast.error(res.error);
                  })
                }
              />
              <ActionRow
                icon={<Bookmark className="size-4" />}
                label={e.saveHook}
                disabled={busy || !draft.hook.trim()}
                onClick={() =>
                  startBusy(async () => {
                    const res = await saveHookAction({ text: draft.hook, platform: draft.platform, format: draft.format } as Parameters<typeof saveHookAction>[0]);
                    if (res.ok) toast.success(e.hookSaved);
                    else toast.error(res.error);
                  })
                }
              />
              <Link href={`/app/studio?from=${item.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                <Repeat className="size-4" /> {e.reuse}
              </Link>
              <ActionRow
                icon={<Trash2 className="size-4" />}
                label={e.deleteItem}
                danger
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(t.common.confirmDelete)) return;
                  startBusy(async () => {
                    const res = await deleteContentAction(item.id);
                    if (!res.ok) return toast.error(res.error);
                    setSaved(draft);
                    router.push("/app/calendar");
                  });
                }}
              />
            </div>
          </Card>
          {!liveAi && item.source !== "demo" && (
            <p className="px-1 text-xs text-ink-3">
              <Sparkles className="mr-1 inline size-3" />
              {t.ai.notConfigured}
            </p>
          )}
          <ButtonLink href="/app/calendar" variant="ghost" size="sm" className="self-start">
            {t.calendar.title} →
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}

function MiniSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-3">{label}</span>
      <select value={value} onChange={(ev) => onChange(ev.target.value)} className="max-w-[60%] truncate rounded-lg border border-transparent bg-transparent py-1 pl-2 pr-1 text-right font-medium text-ink hover:border-line-strong focus:border-accent focus:outline-none">
        {options.map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionRow({ icon, label, onClick, disabled, danger }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm disabled:opacity-50", danger ? "text-danger hover:bg-danger-soft" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}
    >
      {icon} {label}
    </button>
  );
}

function SectionCard({
  label,
  help,
  meta,
  section,
  copyText,
  onRegenerate,
  regenerating,
  canRegenerate,
  children,
}: {
  label: string;
  help?: string;
  meta?: string;
  section: Section;
  copyText: string;
  onRegenerate: (section: Section, hint: string) => void;
  regenerating: Section | null;
  canRegenerate: boolean;
  children: ReactNode;
}) {
  const t = useT();
  const [hintOpen, setHintOpen] = useState(false);
  const [hint, setHint] = useState("");
  const active = regenerating === section;
  return (
    <Card className={cn("p-4 transition-shadow sm:p-5", active && "ring-2 ring-accent/30")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[0.8125rem] font-semibold uppercase tracking-wide text-ink-2">{label}</h3>
          {meta && <span className="text-xs text-ink-3">{meta}</span>}
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={copyText} />
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={cn("size-4", active && "animate-spin")} />}
            onClick={() => setHintOpen((o) => !o)}
            disabled={!canRegenerate}
            aria-expanded={hintOpen}
          >
            {active ? t.editor.regenerating : t.editor.regenerate}
          </Button>
        </div>
      </div>
      {hintOpen && (
        <form
          className="mb-3 flex animate-rise flex-col gap-2 rounded-xl bg-surface-2 p-3 sm:flex-row sm:items-center"
          onSubmit={(ev) => {
            ev.preventDefault();
            onRegenerate(section, hint);
            setHintOpen(false);
            setHint("");
          }}
        >
          <Input
            value={hint}
            onChange={(ev) => setHint(ev.target.value)}
            placeholder={t.editor.regenerateHintPlaceholder}
            aria-label={t.editor.regenerateHint}
            maxLength={300}
            className="h-9 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" icon={<Sparkles className="size-3.5" />}>
              {t.editor.regenerate}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setHintOpen(false)}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      )}
      <div className={cn("flex flex-col", active && "pointer-events-none opacity-60")}>{children}</div>
      {help && <p className="mt-2 text-xs text-ink-3">{help}</p>}
    </Card>
  );
}
