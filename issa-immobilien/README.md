# Issa Immobilien – Website

Website für Issa Immobilien, Inhaber Sami Issa – Spezialist für Einzelhandelsimmobilien und
Handelsstandorte, deutschlandweit tätig, Sitz in Lippstadt.
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
| `/` | Startseite: Einstieg, Leistungen, Handelsimmobilien-Beispiele, Deutschlandweit, Zusammenarbeit, Kontakt |
| `/leistungen/` | Vier Leistungsbereiche im Detail, Beispiele, Zusammenarbeit |
| `/handelsimmobilien/` | Beispiele, Bildreihe, Anfragewege; zeigt Angebote, sobald welche gepflegt sind |
| `/handelsimmobilien/<id>/` | Detailseite je Angebot (nur wenn Angebote gepflegt sind) |
| `/ueber-uns/` | Über Issa Immobilien: Inhaber und Angaben auf einen Blick |
| `/kontakt/` | Kontaktdaten und Anfrageformular |
| `/impressum/`, `/datenschutz/` | Rechtliches (siehe `docs/RECHTLICHES.md`) |
| `/kontakt/gesendet/`, `/kontakt/fehler/` | Rückmeldeseiten für Browser ohne JavaScript (noindex) |

## Projektstruktur

```
src/
  data/site.ts          Zentrale Unternehmensangaben, Navigation, Leistungen, Beispiele, Ablauf
  data/images.ts        Zuordnung der Bilder zu den Bildflächen
  styles/global.css     Design-Tokens, Typografie, Raster, Buttons, Bewegung
  layouts/Base.astro    <head>, SEO/Open Graph, JSON-LD, Header, Footer
  components/           Header, Footer, Logo, Bildfläche, Formular, Sektionen
  components/home/      Abschnitte der Startseite
  pages/                Seiten und api/contact.ts (Formularendpunkt)
  lib/contact.ts        Serverseitige Validierung des Formulars
  content/objekte.json  Objektdaten (leer, siehe docs/OBJEKTE.md)
  assets/brand/         Original-Logo und freigestellte Logo-Versionen
  assets/images/        Vom Auftraggeber gelieferte Fotos
scripts/
  prepare-logo.mjs      Stellt das Original-Logo frei (npm run prepare:logo)
  render-og.mjs         Erzeugt OG-Bild, Favicon und Touch-Icon aus dem Logo
docs/                   Betrieb, Recht, Bilder, Objekte
```

## Weiterführend

- **Betrieb & E-Mail-Versand:** [`docs/BETRIEB.md`](docs/BETRIEB.md)
- **Offene rechtliche Punkte:** [`docs/RECHTLICHES.md`](docs/RECHTLICHES.md)
- **Bilder, Logo, Farben:** [`docs/BILDER.md`](docs/BILDER.md)
- **Angebote veröffentlichen:** [`docs/OBJEKTE.md`](docs/OBJEKTE.md)
