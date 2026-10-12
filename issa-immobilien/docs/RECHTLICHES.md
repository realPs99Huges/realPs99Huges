# Rechtliche Inhalte – Stand und offene Punkte

> Diese Website enthält keine Rechtsberatung. Impressum und Datenschutzerklärung sind vor dem
> Livegang vom Betreiber bzw. einer fachkundigen Stelle abschließend zu prüfen.

## Impressum (`src/pages/impressum.astro`)

Verwendet ausschließlich die vom Auftraggeber bereitgestellten Angaben (zentral in
`src/data/site.ts`).

Gegenüber dem bisherigen Bestandstext aktualisiert:

| Bisher | Jetzt | Grund |
| --- | --- | --- |
| „Angaben gemäß § 5 TMG“ | „Angaben gemäß § 5 DDG“ | Das TMG wurde am 14.05.2024 durch das Digitale-Dienste-Gesetz (DDG) abgelöst. |
| „Verantwortlich … nach § 55 Abs. 2 RStV“ | „… nach § 18 Abs. 2 MStV“ | Der Rundfunkstaatsvertrag wurde durch den Medienstaatsvertrag ersetzt. |
| Hinweis/Link auf die EU-Plattform zur Online-Streitbeilegung (OS-Plattform) | entfernt | Die OS-Plattform wurde zum 20.07.2025 eingestellt; der Link ist nicht mehr erforderlich bzw. führt ins Leere. |
| Haftungsausschlüsse für Inhalte und Links mit Verweis auf §§ 7–10 TMG | nicht übernommen | Verweist auf aufgehobene Vorschriften; solche Passagen sind nicht vorgeschrieben. Bei Bedarf aktualisiert neu formulieren lassen. |

**Bitte prüfen bzw. entscheiden:**

1. **Verbraucherstreitbeilegung (§§ 36, 37 VSBG):** Ob eine Erklärung zur Teilnahme an
   Streitbeilegungsverfahren erforderlich ist, hängt u. a. von der Zahl der Beschäftigten und
   der Verwendung von AGB ab. Es wurde bewusst **keine** Erklärung eingefügt – bitte festlegen.
2. **Steuernummer:** Die Angabe der Steuernummer ist im Impressum nicht vorgeschrieben (nur eine
   ggf. vorhandene USt-IdNr.). Sie wurde wie gewünscht übernommen; aus Sicherheitsgründen kann sie
   entfernt werden (`src/pages/impressum.astro`, Abschnitt „Steuernummer“).
3. **USt-IdNr. / Wirtschafts-IdNr.:** Falls vorhanden, ergänzen. Es wurde nichts erfunden.
4. **Kammer:** Übernommen als „IHK Arnsberg“. Ggf. den vollständigen Namen
   „IHK Arnsberg, Hellweg-Sauerland“ und die Anschrift ergänzen.
5. **Berufshaftpflicht / weitere Pflichtangaben:** Für Immobilienmakler nicht generell
   vorgeschrieben; bei weiteren Erlaubnissen (z. B. § 34c GewO für Verwalter, § 34i GewO) ergänzen.

## Datenschutz (`src/pages/datenschutz.astro`)

Es lag keine bestehende Datenschutzerklärung vor (die bisherige Website war aus der
Entwicklungsumgebung nicht erreichbar). Die Seite ist daher **vorbereitet** und kennzeichnet
dies sichtbar. Sie enthält nur Angaben, die sich aus der technischen Umsetzung ergeben:
Verantwortlicher, Kontaktformular, kurzzeitige IP-Verarbeitung für das Rate-Limit, lokale
Schriften, keine Cookies, kein Tracking, keine eingebetteten Dienste.

**Für eine vollständige Fassung werden noch benötigt:**

- Hosting-Anbieter (Name, Sitz) und Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO)
- Server-Logfiles: welche Daten, Speicherdauer, Zweck
- E-Mail-Anbieter für Postfach und SMTP-Versand (Auftragsverarbeitung)
- Rechtsgrundlagen der Verarbeitungen (z. B. Kontaktanfragen) – bewusst nicht ergänzt
- Speicherdauer bzw. Löschfristen für Anfragen und E-Mails
- Betroffenenrechte und Beschwerderecht bei der Aufsichtsbehörde
  (für NRW: Landesbeauftragte für Datenschutz und Informationsfreiheit NRW)
- Ob ein Datenschutzbeauftragter benannt ist (nicht angegeben, da nicht bekannt)
- Ggf. Verarbeitung von Interessenten- und Eigentümerdaten im Maklergeschäft
  (separate Information nach Art. 13/14 DSGVO außerhalb der Website)

Nach Freigabe den Hinweis-Kasten am Seitenanfang entfernen.

## Kontaktformular

- Pflicht-Checkbox: „Ich habe die Datenschutzhinweise zur Kenntnis genommen …“ – formuliert als
  Kenntnisnahme, nicht als Einwilligung. Bitte mit der finalen Datenschutzerklärung abstimmen.
- Der Satz „Meine Angaben werden ausschließlich zur Bearbeitung meiner Anfrage verwendet“
  beschreibt die technische Umsetzung; er sollte der tatsächlichen Praxis entsprechen.

## Inhalte, die bestätigt werden sollten

Folgende Formulierungen leiten sich aus den bereitgestellten Informationen ab; bitte kurz
bestätigen:

- „Sie sprechen direkt mit dem Inhaber“ / „Sami Issa betreut Ihr Anliegen selbst“ (Über uns)
- Die Markenwerte (persönliche Beratung, Diskretion, Erfahrung usw.) werden ohne Zahlen oder
  Belege dargestellt – es wurden keine Referenzen, Kundenstimmen oder Statistiken erfunden.
