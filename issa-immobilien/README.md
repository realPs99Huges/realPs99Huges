# Issa Immobilien – Website

Website für Issa Immobilien, Inhaber Sami Issa, Lippstadt.
Gebaut mit [Astro](https://astro.build) 7: alle Seiten werden statisch vorgerendert, nur der
Formularendpunkt `/api/contact` läuft serverseitig (Node.js).

## Schnellstart

```bash
npm install
npm run dev        # Entwicklung: http://localhost:4321
npm run build      # Typprüfung (astro check) + Produktions-Build nach dist/
npm run preview    # gebaute Website lokal starten (Node-Server)
```

Voraussetzung: Node.js ≥ 22.12.

## Seiten

| Pfad | Inhalt |
| --- | --- |
| `/` | Startseite: Hero, Haltung, Leistungen, Ablauf, persönliche Betreuung, Objekte, Kontakt |
| `/leistungen/` | Vier Leistungsbereiche im Detail, Ablauf |
| `/objekte/` | Anfragewege (anbieten/suchen); zeigt automatisch Objekte, sobald welche gepflegt sind |
| `/objekte/<id>/` | Detailseite je Objekt (nur wenn Objekte gepflegt sind) |
| `/ueber-uns/` | Inhaber, Haltung, Rahmenangaben |
| `/kontakt/` | Kontaktdaten und Anfrageformular |
| `/impressum/`, `/datenschutz/` | Rechtliches (siehe `docs/RECHTLICHES.md`) |
| `/kontakt/gesendet/`, `/kontakt/fehler/` | Rückmeldeseiten für Browser ohne JavaScript (noindex) |

## Projektstruktur

```
src/
  data/site.ts          Zentrale Unternehmensangaben, Navigation, Leistungen, Ablauf
  data/studies.ts       Bildtexte der Architekturstudien
  styles/global.css     Design-Tokens, Typografie, Raster, Buttons, Bewegung
  layouts/Base.astro    <head>, SEO/Open Graph, JSON-LD, Header, Footer
  components/           Header, Footer, Wortmarke, Formular, Sektionen
  components/home/      Abschnitte der Startseite
  pages/                Seiten und api/contact.ts (Formularendpunkt)
  lib/contact.ts        Serverseitige Validierung des Formulars
  content/objekte.json  Objektdaten (leer, siehe docs/OBJEKTE.md)
  assets/studies/       Gerenderte Architekturstudien
scripts/
  render-images.mjs     Rendert die Architekturstudien (Three.js, Chromium)
  render-og.mjs         Erzeugt Open-Graph-Bild und Touch-Icon
docs/                   Betrieb, Recht, Bilder, Objekte
```

## Weiterführend

- **Betrieb & E-Mail-Versand:** [`docs/BETRIEB.md`](docs/BETRIEB.md)
- **Offene rechtliche Punkte:** [`docs/RECHTLICHES.md`](docs/RECHTLICHES.md)
- **Bilder austauschen:** [`docs/BILDER.md`](docs/BILDER.md)
- **Objekte veröffentlichen:** [`docs/OBJEKTE.md`](docs/OBJEKTE.md)
