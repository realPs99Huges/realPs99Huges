# PostPilot

**Dein nächster guter Post ist schon geplant.**

PostPilot ist eine SaaS-Anwendung für kleine Unternehmen (Gastronomie, Barbershops, Studios, lokale Läden, kleine Marken). Sie plant, schreibt und organisiert Social-Media-Inhalte in der Stimme der jeweiligen Marke. Die Oberfläche ist auf Deutsch und so aufgebaut, dass weitere Sprachen ergänzt werden können.

## Funktionsumfang

| Bereich | Was funktioniert |
| --- | --- |
| **Konto & Onboarding** | Registrierung, Login und Logout. Onboarding in vier Schritten (Unternehmen → Kanäle & Ziel → Tonalität → erster Post). Optionale Schritte lassen sich überspringen. |
| **Übersicht** | Persönliche Begrüßung und eine Empfehlung für heute (eingeplanter Inhalt → Tag aus dem Wochenplan → Impuls aus der kuratierten Ideenbank). Dazu Wochenleiste, Schnellaktionen, nächste Termine, Kennzahlen aus echten Daten und eine Checkliste für den Start. |
| **Content Studio** | Briefing mit Branche, Plattform, Format, Ziel, Thema, Fakten, Tonalität, Zielgruppe, Sprache, Kampagne und Datum. Ergebnis ist ein Content-Paket aus Hook, Caption, CTA, Hashtags, visuellem Konzept, Shotlist (nur Video), Text im Bild und vorgeschlagener Posting-Zeit (als Schätzung gekennzeichnet). |
| **Editor** | Jeder Abschnitt lässt sich bearbeiten, kopieren und einzeln neu schreiben (mit optionalem Hinweis). Außerdem: Status, Datum und Uhrzeit, In Kalender eintragen, Als veröffentlicht markieren, Favorit, Hook merken, Als Vorlage nutzen, Löschen. Bei ungespeicherten Änderungen erscheint eine Warnung. |
| **Kalender** | Wochen- und Monatsansicht, Filter nach Plattform und Status, Einträge anlegen, bearbeiten und löschen. Drag & Drop zwischen Tagen und in den Bereich „Ohne Datum“ (Desktop), Datumsbearbeitung per Dialog (auch mobil). Export als CSV und `.ics`. |
| **Wochenplaner** | 2–7 Posts pro Woche, Ruhetage inklusive, mit wöchentlichem Schwerpunkt. Ausgewogener Mix aus Formaten und Zielen. Einzelne Tage oder den ganzen Plan neu erstellen, als Idee speichern, in den Kalender übernehmen oder im Studio ausarbeiten. |
| **Ideen** | Suche plus Filter nach Branche und Format. Tabs für Ideen, Favoriten, Hooks, Kampagnen und zuletzt Generiertes. Alles lässt sich wiederverwenden. |
| **Performance** | Manuelle Erfassung von Aufrufen, Likes, Kommentaren, Geteilt und Klicks als datierte Stände. Formatvergleich und Vergleich von bis zu vier Inhalten – nur auf Basis eigener Einträge und klar als „Manuell erfasst“ gekennzeichnet. |
| **Markenprofil** | Unternehmensdaten, Markenstimme (Tonalität, Du/Sie, Charakter, Lieblings- und No-Go-Formulierungen, „darf nie erfunden werden“), Kanäle, Ziele und Posting-Frequenz. Mehrere Profile im Business-Plan. |
| **Einstellungen** | Name und Passwort ändern (meldet andere Geräte ab), Sprache, Verbindungen (ehrlich als „noch nicht verfügbar“ markiert), JSON-Datenexport, Konto löschen. |
| **Plan & Nutzung** | Starter, Pro und Business mit konfigurierbaren Preisen und Limits, Verbrauchsanzeige für den laufenden Monat und „Interesse vormerken“. Es wird **nichts** abgerechnet. |

## Technik

- **Next.js 16** (App Router, Server Actions), **React 19**, **TypeScript**, **Tailwind CSS 4**
- **PostgreSQL** über **Drizzle ORM**. In Produktion läuft das über `DATABASE_URL` (Netlify DB/Neon, Supabase oder ein beliebiges Postgres 14+), lokal ohne Konfiguration über eingebettetes **PGlite** in `./.data`.
- **Authentifizierung:** E-Mail und Passwort mit scrypt-Hash. Session-Token im `httpOnly`-/`SameSite=Lax`-Cookie, in der Datenbank nur als SHA-256-Hash gespeichert. Login- und Registrierungs-Drosselung pro IP.
- **Autorisierung:** Jede Abfrage und jede Server Action ist serverseitig auf `userId` (und das aktive Markenprofil) beschränkt. Fremde IDs ergeben „nicht gefunden“.
- **KI-Schicht** (`src/lib/ai`): Ein Provider-Interface mit zwei Umsetzungen, `AnthropicProvider` (offizielles SDK, strukturierte Ausgabe mit Zod-Validierung, Server-side Fallback, Fehlerzuordnung) und `DemoProvider`. Ausgaben werden normalisiert und gekürzt, bei fehlerhafter Ausgabe wird einmal neu versucht. Dazu kommen Nutzungslimits pro Monat und eine Burst-Grenze pro Minute.
- **i18n:** Alle Texte liegen in `src/i18n/de.ts`. Für eine neue Sprache legst du eine Datei mit derselben Struktur an und registrierst sie in `src/i18n/index.ts`.

```
src/
  app/            Routen (Landing, Auth, Onboarding, /app/*, /api/export)
  components/     UI-Bausteine und Feature-Komponenten
  config/         Optionen, Pläne & Limits, Ideenbank
  i18n/           Wörterbücher
  lib/            DB, Auth, KI-Provider, Datumslogik, Integrations-Platzhalter
  server/         Server Actions, Datenzugriff, Nutzungszählung
drizzle/          SQL-Migrationen
scripts/          migrate, set-plan
tests/            Unit-Tests (node:test)
```

## Lokal starten

```bash
npm install
cp .env.example .env.local   # optional – ohne Werte läuft alles lokal im Demo-Modus
npm run dev                  # http://localhost:3000
```

Ohne `DATABASE_URL` legt die App automatisch eine lokale PGlite-Datenbank an und migriert sie. Ohne `ANTHROPIC_API_KEY` läuft sie im **Demo-Modus**: Inhalte entstehen aus Vorlagen und sind überall als „Demo-Inhalt“ gekennzeichnet.

Prüfungen:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | PostgreSQL-Verbindung. Alternativ wird `NETLIFY_DATABASE_URL` (Netlify DB) verwendet. Für Migrationen wird `*_UNPOOLED` bevorzugt, falls vorhanden. |
| `ANTHROPIC_API_KEY` | Aktiviert echte KI-Generierung. Bleibt immer serverseitig. |
| `AI_PROVIDER` | `anthropic` (Standard, wenn ein Key gesetzt ist) oder `demo`. |
| `AI_MODEL` | Standard `claude-opus-5-5`. |
| `AI_EFFORT` | `low` (Standard), `medium` oder `high`. Mehr Aufwand ist langsamer und teurer. |
| `POSTPILOT_BETA_ALL_FEATURES` | `true` (Standard): Alle Funktionen sind für alle Pläne freigeschaltet, die Limits gelten trotzdem. `false`: Funktionen werden nach Plan freigegeben. |
| `NEXT_PUBLIC_APP_TIME_ZONE` | Zeitzone für „heute“, Kalender und Monatszeiträume (Standard `Europe/Berlin`). |

## Deployment auf Netlify

1. Repository in Netlify verbinden. `netlify.toml` setzt Build-Befehl (`npm run db:migrate && npm run build`), Node 22 und `@netlify/plugin-nextjs`.
2. Datenbank anbinden: **Netlify DB** aktivieren (setzt `NETLIFY_DATABASE_URL` automatisch) oder `DATABASE_URL` einer anderen Postgres-Instanz hinterlegen. Ohne Datenbank bricht der Build bewusst ab.
3. `ANTHROPIC_API_KEY` als Umgebungsvariable setzen (Scope: Functions/Runtime und Builds).
4. Deployen. Die Migrationen laufen bei jedem Build und sind idempotent.

Hinweis: Eine Generierung dauert typischerweise einige bis etwa 30 Sekunden. Der SDK-Timeout liegt bei 55 Sekunden. Prüfe die Laufzeitgrenze für Serverless-Funktionen in deinem Netlify-Plan und senke bei Bedarf `AI_EFFORT`.

## Pläne & Preise

Preise und Limits stehen zentral in `src/config/plans.ts`. Die Texte auf der Preisseite werden daraus erzeugt. Die Preise sind **Vorschläge**, keine bestätigten Marktpreise.

Ein Zahlungsanbieter ist **noch nicht** angebunden. Bis dahin vergibst du Pläne manuell:

```bash
npm run admin:set-plan -- kunde@example.com pro
```

Lokal mit PGlite stoppst du dafür vorher `npm run dev`, weil PGlite nur einen Prozess zulässt.

## Bewusst noch nicht umgesetzt (ehrliche Grundlagen vorhanden)

- **Zahlungen/Abos:** Es gibt Plan-Konfiguration, Limits, Feature-Gating (`hasFeature`) und Interessenten-Erfassung (`users.upgrade_interest`). Es fehlen Stripe/Paddle-Checkout, Webhooks und Rechnungen.
- **Social-Media-Integrationen:** `src/lib/integrations` beschreibt das Interface. Es gibt keine verbundenen Konten, kein automatisches Veröffentlichen und keinen Statistik-Import. Performance-Einträge tragen eine `source`-Spalte, damit importierte Daten später von manuellen unterscheidbar sind.
- **E-Mail-Versand:** Passwort-Zurücksetzen, E-Mail-Bestätigung und Adressänderung brauchen einen E-Mail-Anbieter. Auf der Login-Seite steht ein entsprechender Hinweis.
- **Teams/geteilte Ressourcen:** Das Datenmodell ist strikt pro Nutzer. Für Teams wären eine Organisationsebene und Rollen nötig.
- **Weitere Sprachen der Oberfläche:** Die Struktur ist vorbereitet, bisher gibt es nur `de`.
- **Drag & Drop** funktioniert mit Maus/Trackpad (HTML5). Auf Touch-Geräten verschiebst du Einträge über den Dialog (Datum ändern).

## Qualitätssicherung

Geprüft wurde mit TypeScript, ESLint, 19 Unit-Tests (Datumslogik, Validierung, Normalisierung, Planverteilung, Demo-Provider, Anthropic-Provider gegen einen lokalen API-Mock) und dem Produktions-Build. Dazu kommen Browser-End-to-End-Durchläufe gegen den Dev-Server (PGlite) und den Produktions-Build (PostgreSQL 16) für Registrierung, Onboarding, Generierung, Bearbeiten und Neu-Schreiben, Persistenz nach Reload, Kalender (anlegen, verschieben, Monat), Wochenplaner, Ideen, Kampagnen, Performance, Markenprofil, Einstellungen, Exporte, Logout und mobile Layouts ohne horizontales Scrollen. Ein Isolationstest stellt sicher, dass ein zweites Konto keine fremden Inhalte sieht.

Die echte Anthropic-API wurde mangels Schlüssel **nicht** live aufgerufen. Der SDK-Pfad ist gegen einen Mock getestet.
