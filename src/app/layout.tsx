import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { getMessages } from "@/i18n";
import { I18nProvider } from "@/components/i18n-provider";
import { ToastProvider } from "@/components/ui/toast";

const t = getMessages("de");

export const metadata: Metadata = {
  title: { default: t.meta.title, template: "%s · PostPilot" },
  description: t.meta.description,
  applicationName: "PostPilot",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#111014" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-dvh">
        <I18nProvider locale="de">
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
