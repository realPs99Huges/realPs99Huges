"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { BarChart3, ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Notice, PageHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { FormatLabel, PlatformMark } from "@/components/content-badges";
import { fmt } from "@/i18n";
import { formatDate } from "@/lib/dates";
import { addPerformanceEntryAction, deletePerformanceEntryAction } from "@/server/actions/performance";

type Entry = { id: string; recordedOn: string; views: number; likes: number; comments: number; shares: number; clicks: number; source: string; note: string };
export type PerformanceRow = { contentId: string; title: string; format: string; platform: string; publishedAt: string | null; entries: Entry[] };

const METRICS = ["views", "likes", "comments", "shares", "clicks"] as const;
type Metric = (typeof METRICS)[number];

const number = new Intl.NumberFormat("de-DE");
const percent = new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 });
const interactions = (e: Entry) => e.likes + e.comments + e.shares;
const rate = (e: Entry) => (e.views > 0 ? interactions(e) / e.views : null);

export function PerformanceView({ rows, contentOptions, today }: { rows: PerformanceRow[]; contentOptions: { id: string; title: string; published: boolean }[]; today: string }) {
  const t = useT();
  const p = t.performance;
  const [dialogFor, setDialogFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Entries are snapshots; the newest one per content item represents its current numbers.
  const latest = useMemo(() => rows.map((r) => ({ ...r, latest: r.entries[0] })), [rows]);

  const byFormat = useMemo(() => {
    const groups = new Map<string, { total: number; count: number }>();
    for (const r of latest) {
      const g = groups.get(r.format) ?? { total: 0, count: 0 };
      g.total += interactions(r.latest);
      g.count += 1;
      groups.set(r.format, g);
    }
    return [...groups.entries()].map(([format, g]) => ({ format, avg: g.total / g.count, count: g.count })).sort((a, b) => b.avg - a.avg);
  }, [latest]);

  const best = latest.length >= 2 && byFormat.length >= 2 ? byFormat[0] : null;
  const maxAvg = Math.max(1, ...byFormat.map((f) => f.avg));
  const compared = latest.filter((r) => selected.includes(r.contentId));
  const totals = latest.reduce((acc, r) => ({ views: acc.views + r.latest.views, interactions: acc.interactions + interactions(r.latest) }), { views: 0, interactions: 0 });

  return (
    <>
      <PageHeader
        title={p.title}
        description={p.subtitle}
        actions={
          contentOptions.length > 0 && (
            <Button icon={<Plus className="size-4" />} onClick={() => setDialogFor("")}>
              {p.addEntry}
            </Button>
          )
        }
      />

      <Notice tone="neutral" icon={<Info />} className="mb-6">
        {p.manualNotice}
      </Notice>

      {rows.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="size-5" />}
          title={p.empty}
          text={contentOptions.length ? p.emptyText : p.noContent}
          action={
            contentOptions.length ? (
              <Button onClick={() => setDialogFor("")} icon={<Plus className="size-4" />}>
                {p.addEntry}
              </Button>
            ) : (
              <ButtonLink href="/app/studio" variant="secondary">
                {t.nav.studio}
              </ButtonLink>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [p.tableTitle, number.format(latest.length)],
              [p.views, number.format(totals.views)],
              [p.interactions, number.format(totals.interactions)],
              [p.engagementRate, totals.views ? percent.format(totals.interactions / totals.views) : "–"],
            ].map(([label, value]) => (
              <Card key={label} className="px-4 py-3.5">
                <dt className="text-xs text-ink-3">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-ink">{value}</dd>
              </Card>
            ))}
          </dl>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title={p.bestFormats} description={p.bestFormatsText} />
              <CardBody>
                {best ? (
                  <p className="mb-4 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm text-accent-strong">
                    {fmt(p.bestFormatHighlight, { format: t.options.formats[best.format as keyof typeof t.options.formats], value: number.format(Math.round(best.avg)) })}
                  </p>
                ) : (
                  <p className="mb-4 text-sm text-ink-3">{p.tooFewData}</p>
                )}
                <ul className="flex flex-col gap-3" aria-label={p.bestFormats}>
                  {byFormat.map((f) => (
                    <li key={f.format} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3.5rem] items-center gap-3" title={`${t.options.formats[f.format as keyof typeof t.options.formats]}: Ø ${number.format(Math.round(f.avg))} ${p.interactions} (n = ${f.count})`}>
                      <FormatLabel format={f.format} />
                      <span className="h-3 rounded-r bg-surface-2">
                        <span className="block h-full rounded-r-[4px] bg-accent transition-all" style={{ width: `${Math.max(2, (f.avg / maxAvg) * 100)}%` }} />
                      </span>
                      <span className="text-right text-sm font-medium tabular-nums text-ink">{number.format(Math.round(f.avg))}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-3">{p.latestSnapshot}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={p.compare} description={p.compareText} />
              <CardBody>
                {compared.length === 0 ? (
                  <p className="text-sm text-ink-3">{p.compareEmpty}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(["views", "likes", "comments", "shares", "clicks"] as Metric[]).map((metric) => {
                      const max = Math.max(1, ...compared.map((r) => r.latest[metric]));
                      return (
                        <div key={metric}>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">{p[metric]}</p>
                          <ul className="flex flex-col gap-1.5">
                            {compared.map((r) => (
                              <li key={r.contentId} className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_3.5rem] items-center gap-2" title={`${r.title}: ${number.format(r.latest[metric])}`}>
                                <span className="truncate text-xs text-ink-2">{r.title}</span>
                                <span className="h-2.5 rounded-r bg-surface-2">
                                  <span className="block h-full rounded-r-[4px] bg-ink-2" style={{ width: `${Math.max(1.5, (r.latest[metric] / max) * 100)}%` }} />
                                </span>
                                <span className="text-right text-xs font-medium tabular-nums text-ink">{number.format(r.latest[metric])}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader title={p.tableTitle} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[46rem] text-sm">
                <thead className="border-y border-line bg-surface-2/60 text-left text-xs text-ink-3">
                  <tr>
                    <th className="w-10 px-4 py-2.5 font-medium">
                      <span className="sr-only">{p.compare}</span>
                    </th>
                    <th className="px-2 py-2.5 font-medium">{p.selectContent}</th>
                    {METRICS.map((m) => (
                      <th key={m} className="px-2 py-2.5 text-right font-medium">
                        {p[m]}
                      </th>
                    ))}
                    <th className="px-2 py-2.5 text-right font-medium">{p.engagementRate}</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {latest.map((r) => {
                    const checked = selected.includes(r.contentId);
                    const r8 = rate(r.latest);
                    return (
                      <FragmentRow key={r.contentId}>
                        <tr className="border-b border-line">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="size-4 accent-[var(--accent)]"
                              checked={checked}
                              disabled={!checked && selected.length >= 4}
                              onChange={() => setSelected((s) => (checked ? s.filter((id) => id !== r.contentId) : [...s, r.contentId]))}
                              aria-label={`${p.compare}: ${r.title}`}
                            />
                          </td>
                          <td className="max-w-[16rem] px-2 py-3">
                            <Link href={`/app/content/${r.contentId}`} className="block truncate font-medium text-ink hover:underline">
                              {r.title}
                            </Link>
                            <span className="mt-1 flex items-center gap-2 text-xs text-ink-3">
                              <PlatformMark platform={r.platform} className="size-4 text-[0.5rem]" />
                              {p.recordedOn} {formatDate(r.latest.recordedOn, "de-DE", { day: "numeric", month: "short" })}
                              <Badge tone={r.latest.source === "manual" ? "neutral" : "info"}>{r.latest.source === "manual" ? p.sourceManual : p.sourceIntegration}</Badge>
                            </span>
                          </td>
                          {METRICS.map((m) => (
                            <td key={m} className="px-2 py-3 text-right tabular-nums">
                              {number.format(r.latest[m])}
                            </td>
                          ))}
                          <td className="px-2 py-3 text-right tabular-nums">{r8 === null ? "–" : percent.format(r8)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setDialogFor(r.contentId)} aria-label={p.addEntry} icon={<Plus className="size-3.5" />} />
                              <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === r.contentId ? null : r.contentId)} aria-expanded={expanded === r.contentId} icon={<ChevronDown className={cn("size-3.5 transition-transform", expanded === r.contentId && "rotate-180")} />}>
                                {p.history} ({r.entries.length})
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded === r.contentId && (
                          <tr className="border-b border-line bg-surface-2/40">
                            <td />
                            <td colSpan={8} className="px-2 py-2">
                              <HistoryList entries={r.entries} />
                            </td>
                          </tr>
                        )}
                      </FragmentRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {dialogFor !== null && <EntryDialog contentOptions={contentOptions} initialContentId={dialogFor} today={today} onClose={() => setDialogFor(null)} />}
    </>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function HistoryList({ entries }: { entries: Entry[] }) {
  const t = useT();
  const p = t.performance;
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <ul className="flex flex-col gap-1 text-xs text-ink-2">
      {entries.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1">
          <span className="font-medium text-ink">{formatDate(e.recordedOn, "de-DE", { day: "numeric", month: "short", year: "numeric" })}</span>
          {METRICS.map((m) => (
            <span key={m}>
              {p[m]}: <span className="tabular-nums text-ink">{number.format(e[m])}</span>
            </span>
          ))}
          {e.note && <span className="italic">{e.note}</span>}
          <button
            type="button"
            className="ml-auto rounded p-1 text-ink-3 hover:bg-danger-soft hover:text-danger"
            aria-label={p.deleteEntry}
            disabled={pending}
            onClick={() => {
              if (!window.confirm(t.common.confirmDelete)) return;
              start(async () => {
                const res = await deletePerformanceEntryAction(e.id);
                if (!res.ok) return toast.error(res.error);
                router.refresh();
              });
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function EntryDialog({ contentOptions, initialContentId, today, onClose }: { contentOptions: { id: string; title: string; published: boolean }[]; initialContentId: string; today: string; onClose: () => void }) {
  const t = useT();
  const p = t.performance;
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ contentItemId: initialContentId || contentOptions[0]?.id || "", recordedOn: today, views: "", likes: "", comments: "", shares: "", clicks: "", note: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const title = contentOptions.find((c) => c.id === form.contentItemId)?.title ?? "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addPerformanceEntryAction({
        ...form,
        views: form.views || 0,
        likes: form.likes || 0,
        comments: form.comments || 0,
        shares: form.shares || 0,
        clicks: form.clicks || 0,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return toast.error(res.error);
      }
      toast.success(t.common.saved);
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={title ? fmt(p.entryFor, { title }) : p.addEntry}
      description={p.sourceManual}
      footer={
        <Button type="submit" form="perf-entry" loading={pending}>
          {t.common.save}
        </Button>
      }
    >
      <form id="perf-entry" onSubmit={submit} className="grid gap-4">
        <Field label={p.selectContent} htmlFor="pe-content">
          <Select id="pe-content" value={form.contentItemId} onChange={(e) => set("contentItemId", e.target.value)}>
            {contentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.published ? "● " : ""}
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={p.recordedOn} htmlFor="pe-date" error={errors.recordedOn}>
          <Input id="pe-date" type="date" value={form.recordedOn} max={today} onChange={(e) => set("recordedOn", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {METRICS.map((m) => (
            <Field key={m} label={p[m]} htmlFor={`pe-${m}`} error={errors[m]}>
              <Input id={`pe-${m}`} type="number" inputMode="numeric" min={0} step={1} value={form[m]} onChange={(e) => set(m, e.target.value)} placeholder="0" />
            </Field>
          ))}
        </div>
        <Field label={p.note} htmlFor="pe-note" optional>
          <Input id="pe-note" value={form.note} onChange={(e) => set("note", e.target.value)} maxLength={300} />
        </Field>
      </form>
    </Dialog>
  );
}
