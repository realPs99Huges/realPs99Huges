import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { getMessages } from "@/i18n";

export default function NotFound() {
  const t = getMessages().common;
  return (
    <main className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div className="max-w-sm">
        <LogoMark className="mx-auto size-10" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">{t.notFoundTitle}</h1>
        <p className="mt-2 text-ink-2">{t.notFoundText}</p>
        <Link href="/app" className={buttonClass("primary", "md", "mt-6")}>
          {t.toDashboard}
        </Link>
      </div>
    </main>
  );
}
