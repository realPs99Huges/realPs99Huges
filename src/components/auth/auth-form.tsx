"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/card";
import { useT } from "@/components/i18n-provider";
import { login, signup } from "@/server/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const t = useT();
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <div>
      <h1 className="font-display text-[1.75rem] font-semibold text-ink">{mode === "login" ? t.auth.loginTitle : t.auth.signupTitle}</h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink-2">{mode === "login" ? t.auth.loginSubtitle : t.auth.signupSubtitle}</p>
      <form action={action} className="mt-8 flex flex-col gap-4" noValidate={false}>
        {state && !state.ok && !Object.keys(errors).length && (
          <Notice tone="warning">{state.error}</Notice>
        )}
        {mode === "signup" && (
          <Field label={t.auth.name} htmlFor="name" error={errors.name}>
            <Input id="name" name="name" autoComplete="name" required maxLength={80} aria-invalid={!!errors.name} />
          </Field>
        )}
        <Field label={t.auth.email} htmlFor="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
        </Field>
        <Field label={t.auth.password} htmlFor="password" help={mode === "signup" ? t.auth.passwordHint : undefined} error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 10 : undefined}
            required
            aria-invalid={!!errors.password}
          />
        </Field>
        <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
          {mode === "login" ? t.auth.login : t.auth.signup}
        </Button>
        {mode === "signup" && <p className="text-xs leading-relaxed text-ink-3">{t.auth.terms}</p>}
        {mode === "login" && <p className="text-xs leading-relaxed text-ink-3">{t.auth.passwordResetNote}</p>}
      </form>
      <p className="mt-8 text-sm text-ink-2">
        {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-accent hover:underline">
          {mode === "login" ? t.auth.toSignup : t.auth.toLogin}
        </Link>
      </p>
    </div>
  );
}
