# Betrieb, Hosting und E-Mail-Versand

## Architektur

- Alle Seiten sind statisches HTML (`dist/client/`).
- Der Formularendpunkt `POST /api/contact` läuft über den Astro-Node-Adapter
  (`dist/server/entry.mjs`, Modus *standalone*). Er liefert auch die statischen Dateien aus.
- Keine Datenbank, keine Cookies, kein Tracking, keine externen Schriften oder Skripte.

## Hosting

Benötigt wird ein Hosting mit **Node.js ≥ 22.12** (z. B. ein VPS, ein Managed-Node-Angebot oder
ein Container). Ablauf:

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs
```

Davor gehört ein Reverse Proxy (z. B. nginx/Caddy) mit HTTPS für
`www.issa-immobilien.de`. Empfehlung: Weiterleitung von `issa-immobilien.de` auf
`https://www.issa-immobilien.de` (die kanonischen URLs und die Sitemap verwenden `www`).
Die Domain ist in `astro.config.mjs` (`site`) hinterlegt.

> Hinweis: Wird ausschließlich statisches Hosting gewünscht (ohne Node.js), müsste der
> Formularversand über einen externen Formulardienst oder ein serverseitiges Skript des Hosters
> erfolgen. Der Endpunkt ist dafür klar gekapselt (`src/pages/api/contact.ts`); die
> Formularoberfläche bleibt unverändert, nur `action` und der Versand ändern sich. Ein externer
> Dienst ist datenschutzrechtlich zu prüfen (Auftragsverarbeitung).

## E-Mail-Versand des Kontaktformulars (SMTP)

Der Versand erfolgt serverseitig per SMTP. Zugangsdaten werden **nur** als Umgebungsvariablen
gesetzt (Vorlage: `.env.example`), niemals im Code oder Frontend.

| Variable | Bedeutung |
| --- | --- |
| `SMTP_HOST` | SMTP-Server des E-Mail-Anbieters |
| `SMTP_PORT` | meist `587` (STARTTLS) oder `465` (TLS) |
| `SMTP_SECURE` | `true` bei Port 465, sonst `false` |
| `SMTP_USER` / `SMTP_PASS` | Zugangsdaten des Postfachs, das versendet |
| `CONTACT_FROM` | Absenderadresse, muss zum SMTP-Konto passen (z. B. `website@issa-immobilien.de`) |
| `CONTACT_TO` | Empfänger der Anfragen (Standard: `info@issa-immobilien.de`) |

Die Antwortadresse (`Reply-To`) ist automatisch die E-Mail-Adresse der anfragenden Person.

**Verhalten ohne Konfiguration:** Das Formular meldet ehrlich, dass der Online-Versand nicht
eingerichtet ist und die Nachricht nicht übermittelt wurde, und nennt Telefon und E-Mail. Es
wird niemals ein Erfolg angezeigt, ohne dass die E-Mail vom SMTP-Server angenommen wurde.

### Test nach der Einrichtung

1. Server mit gesetzten Variablen starten.
2. Formular unter `/kontakt/` absenden (Wartezeit von ein paar Sekunden nach dem Laden einhalten –
   sehr schnelle Einsendungen werden als automatisiert abgewiesen).
3. Eingang im Postfach `CONTACT_TO` prüfen; „Antworten“ muss an die eingegebene Adresse gehen.
4. SPF/DKIM der Absenderdomain prüfen, damit Anfragen nicht im Spam landen.

## Schutzmechanismen des Formulars

- Server- und clientseitige Validierung mit verständlichen Meldungen
- Honeypot-Feld und Mindest-Ausfülldauer gegen automatisierte Einsendungen
- Rate-Limit: höchstens 5 Anfragen pro IP-Adresse in 15 Minuten (im Arbeitsspeicher, je Instanz)
- Herkunftsprüfung (Origin-Check) durch Astro für Formular-POSTs
- Größenbegrenzung der Anfrage, Entfernen von Steuerzeichen
- Keine Formulardaten in URLs oder Logs; geloggt wird nur ein technischer Fehlercode

## Qualitätssicherung

```bash
npm run check   # Astro- und TypeScript-Prüfung
npm run build   # beinhaltet die Prüfung
```

Bilder neu rendern (nur nötig bei Änderungen an `scripts/render/scenes.js`):

```bash
npm run render:images     # benötigt ein Chromium für Playwright
node scripts/render-og.mjs
```
