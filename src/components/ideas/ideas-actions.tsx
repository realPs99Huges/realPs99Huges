"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { FORMATS, OBJECTIVES, PLATFORMS } from "@/config/options";
import { createManualContentAction, deleteHookAction, type ManualContentInput } from "@/server/actions/content";
import { createCampaignAction, deleteCampaignAction } from "@/server/actions/campaigns";

export function NewIdeaButton() {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ title: "", format: "feed_post", platform: "instagram", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createManualContentAction({ ...form, status: "idea" } as ManualContentInput);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return toast.error(res.error);
      }
      setOpen(false);
      setForm({ title: "", format: "feed_post", platform: "instagram", notes: "" });
      toast.success(t.common.saved);
      router.refresh();
    });
  }

  return (
    <>
      <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
        {t.ideas.newIdea}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t.ideas.newIdeaTitle}
        footer={
          <Button type="submit" form="new-idea" loading={pending}>
            {t.common.save}
          </Button>
        }
      >
        <form id="new-idea" onSubmit={submit} className="grid gap-4">
          <Field label={t.ideas.ideaTitle} htmlFor="ni-title" error={errors.title}>
            <Input id="ni-title" value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={160} autoFocus />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t.studio.format} htmlFor="ni-format">
              <Select id="ni-format" value={form.format} onChange={(e) => set("format", e.target.value)}>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {t.options.formats[f]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.studio.platform} htmlFor="ni-platform">
              <Select id="ni-platform" value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {t.options.platforms[p]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t.ideas.ideaNotes} htmlFor="ni-notes" optional>
            <Textarea id="ni-notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={2200} />
          </Field>
        </form>
      </Dialog>
    </>
  );
}

export function NewCampaignButton({ openInitially = false }: { openInitially?: boolean }) {
  const t = useT();
  const i = t.ideas;
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(openInitially);
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const empty = { name: "", goal: "awareness", description: "", startDate: "", endDate: "" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function close() {
    setOpen(false);
    if (openInitially) router.replace("/app/ideas?tab=campaigns");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createCampaignAction({ ...form, goal: form.goal as (typeof OBJECTIVES)[number] });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return toast.error(res.error);
      }
      setForm(empty);
      toast.success(t.common.saved);
      close();
      router.refresh();
    });
  }

  return (
    <>
      <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
        {i.newCampaign}
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title={i.newCampaign}
        footer={
          <Button type="submit" form="new-campaign" loading={pending}>
            {t.common.save}
          </Button>
        }
      >
        <form id="new-campaign" onSubmit={submit} className="grid gap-4">
          <Field label={i.campaignName} htmlFor="nc-name" error={errors.name}>
            <Input id="nc-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={i.campaignNamePlaceholder} required maxLength={120} autoFocus />
          </Field>
          <Field label={i.campaignGoal} htmlFor="nc-goal">
            <Select id="nc-goal" value={form.goal} onChange={(e) => set("goal", e.target.value)}>
              {OBJECTIVES.map((o) => (
                <option key={o} value={o}>
                  {t.options.objectives[o]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={i.campaignStart} htmlFor="nc-start" optional>
              <Input id="nc-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>
            <Field label={i.campaignEnd} htmlFor="nc-end" optional error={errors.endDate}>
              <Input id="nc-end" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
          </div>
          <Field label={i.campaignDescription} htmlFor="nc-desc" optional>
            <Textarea id="nc-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} />
          </Field>
        </form>
      </Dialog>
    </>
  );
}

export function DeleteCampaignButton({ id }: { id: string }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.ideas.deleteCampaign}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(t.common.confirmDelete)) return;
        start(async () => {
          const res = await deleteCampaignAction(id);
          if (!res.ok) return toast.error(res.error);
          router.refresh();
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function HookActions({ id, text, format }: { id: string; text: string; format: string }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const params = new URLSearchParams({ topic: text, ...(format && { format }) });
  return (
    <span className="ml-auto flex items-center gap-1">
      <CopyButton text={text} size="icon" />
      <Button
        variant="ghost"
        size="icon"
        aria-label={t.common.delete}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await deleteHookAction(id);
            if (!res.ok) return toast.error(res.error);
            router.refresh();
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
      <ButtonLink href={`/app/studio?${params}`} variant="secondary" size="sm">
        {t.ideas.useHook}
      </ButtonLink>
    </span>
  );
}
