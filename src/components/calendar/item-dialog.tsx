"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { FORMATS, PLATFORMS, STATUSES } from "@/config/options";
import { createManualContentAction, deleteContentAction, quickUpdateContentAction, type ManualContentInput } from "@/server/actions/content";

export type CalendarItem = {
  id: string;
  title: string;
  platform: string;
  format: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  source: string;
};

export function CalendarItemDialog({
  item,
  initialDate,
  defaultPlatform,
  onClose,
  onSaved,
}: {
  item: CalendarItem | null;
  initialDate: string | null;
  defaultPlatform: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const c = t.calendar;
  const toast = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: item?.title ?? "",
    scheduledDate: item?.scheduledDate ?? initialDate ?? "",
    scheduledTime: item?.scheduledTime ?? "",
    platform: item?.platform ?? defaultPlatform,
    format: item?.format ?? "feed_post",
    status: item?.status ?? (initialDate ? "scheduled" : "idea"),
    notes: "",
  });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    start(async () => {
      const payload = {
        title: form.title,
        platform: form.platform,
        format: form.format,
        status: form.status,
        scheduledDate: form.scheduledDate || null,
        scheduledTime: form.scheduledTime || null,
      };
      const res = item
        ? await quickUpdateContentAction({ id: item.id, ...payload } as Parameters<typeof quickUpdateContentAction>[0])
        : await createManualContentAction({ ...payload, notes: form.notes } as ManualContentInput);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(t.common.saved);
      onSaved();
    });
  }

  function remove() {
    if (!item || !window.confirm(t.common.confirmDelete)) return;
    start(async () => {
      const res = await deleteContentAction(item.id);
      if (!res.ok) return toast.error(res.error);
      onSaved();
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={item ? c.dialogEdit : c.dialogNew}
      footer={
        <>
          {item && (
            <>
              <Button variant="ghost" className="mr-auto text-danger hover:bg-danger-soft hover:text-danger" icon={<Trash2 className="size-4" />} onClick={remove} disabled={pending}>
                {t.common.delete}
              </Button>
              <ButtonLink href={`/app/content/${item.id}`} variant="secondary" icon={<ExternalLink className="size-4" />}>
                {c.openFull}
              </ButtonLink>
            </>
          )}
          <Button type="submit" form="calendar-item-form" loading={pending}>
            {t.common.save}
          </Button>
        </>
      }
    >
      <form id="calendar-item-form" onSubmit={submit} className="grid gap-4">
        <Field label={t.editor.title} htmlFor="ci-title" error={errors.title}>
          <Input id="ci-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={c.titlePlaceholder} maxLength={160} required autoFocus aria-invalid={!!errors.title} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
          <Field label={t.editor.date} htmlFor="ci-date" error={errors.scheduledDate}>
            <Input id="ci-date" type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} aria-invalid={!!errors.scheduledDate} />
          </Field>
          <Field label={t.editor.time} htmlFor="ci-time">
            <Input id="ci-time" type="time" value={form.scheduledTime} onChange={(e) => set("scheduledTime", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t.studio.platform} htmlFor="ci-platform">
            <Select id="ci-platform" value={form.platform} onChange={(e) => set("platform", e.target.value)}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {t.options.platforms[p]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.studio.format} htmlFor="ci-format">
            <Select id="ci-format" value={form.format} onChange={(e) => set("format", e.target.value)}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {t.options.formats[f]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.editor.status} htmlFor="ci-status">
            <Select id="ci-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.options.statuses[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {!item && (
          <Field label={t.ideas.ideaNotes} htmlFor="ci-notes" optional>
            <Textarea id="ci-notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={2200} />
          </Field>
        )}
      </form>
    </Dialog>
  );
}
