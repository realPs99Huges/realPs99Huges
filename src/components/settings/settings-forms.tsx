"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/i18n-provider";
import { changePasswordAction, deleteAccountAction, updateAccountAction } from "@/server/actions/settings";

export function AccountForm({ name: initialName, email }: { name: string; email: string }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-4 sm:max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateAccountAction({ name });
          if (!res.ok) return toast.error(res.error);
          toast.success(t.common.saved);
          router.refresh();
        });
      }}
    >
      <Field label={t.settings.name} htmlFor="ac-name">
        <Input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoComplete="name" />
      </Field>
      <Field label={t.settings.email} htmlFor="ac-email" help={t.settings.emailNote}>
        <Input id="ac-email" value={email} disabled readOnly />
      </Field>
      <Button type="submit" variant="secondary" className="justify-self-start" loading={pending} disabled={name.trim() === initialName}>
        {t.common.save}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const t = useT();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-4 sm:max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await changePasswordAction(form);
          if (!res.ok) {
            setErrors(res.fieldErrors ?? {});
            return toast.error(res.error);
          }
          setErrors({});
          setForm({ currentPassword: "", newPassword: "" });
          toast.success(t.settings.passwordChanged);
        });
      }}
    >
      <Field label={t.settings.currentPassword} htmlFor="pw-current" error={errors.currentPassword}>
        <Input id="pw-current" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
      </Field>
      <Field label={t.settings.newPassword} htmlFor="pw-new" help={t.auth.passwordHint} error={errors.newPassword}>
        <Input id="pw-new" type="password" autoComplete="new-password" minLength={10} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
      </Field>
      <Button type="submit" variant="secondary" className="justify-self-start" loading={pending}>
        {t.settings.password}
      </Button>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useT();
  const s = t.settings;
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-4 sm:max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await deleteAccountAction(form);
          if (res && !res.ok) {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.error);
          }
        });
      }}
    >
      <Field label={t.auth.password} htmlFor="del-pw" error={errors.password}>
        <Input id="del-pw" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      </Field>
      <Field label={s.confirmLabel} htmlFor="del-confirm" error={errors.confirm}>
        <Input id="del-confirm" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required autoComplete="off" />
      </Field>
      <Button type="submit" variant="danger" className="justify-self-start" loading={pending} disabled={form.confirm !== s.confirmWord || !form.password}>
        {s.deleteAccount}
      </Button>
    </form>
  );
}
