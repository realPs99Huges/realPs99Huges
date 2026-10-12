# Bilder

## Ausgangslage

Die bestehende Website war aus der Entwicklungsumgebung nicht erreichbar, ebenso Bilddatenbanken
wie Unsplash oder Pexels. Es lagen keine Unternehmensfotos, kein Logo und kein Porträt vor.

Statt beliebiger Stockfotos wurden deshalb **eigene Architekturzeichnungen** gerendert
(`scripts/render-images.mjs`, Three.js in Chromium). Sie zeigen keine realen Gebäude und
werden auf der Website überall als „Zeichnung“ gekennzeichnet (Bildunterschriften,
Footer, Impressum). Rechte Dritter bestehen daran nicht.

| Datei | Motiv | Einsatz |
| --- | --- | --- |
| `residence.jpg` | Wohnhaus, auskragender Baukörper | Hero, Leistungen, OG-Bild |
| `facade.jpg` | Fassadendetail, Lamellen | Startseite „Haltung“ |
| `interior.jpg` | Innenraum, Lichteinfall | Startseite „Leistungen“, Über uns |
| `urban.jpg` | Gewerbebau, Rasterfassade | Leistungen „Gewerbe“, Objekte |
| `horizon.jpg` | Wohnhaus mit Mauer, Abendlicht | Startseite „Objekte“, Leistungen „Analyse“ |

## Durch echte Fotografie ersetzen

1. Foto (mindestens 2000 px auf der langen Seite, JPG) unter gleichem Namen in
   `src/assets/studies/` ablegen – oder eine neue Datei ergänzen.
2. In `src/data/studies.ts` `caption` und `alt` anpassen. Handelt es sich um eine echte
   Aufnahme, in `src/components/Study.astro` den Zusatz „· Zeichnung“ entfernen bzw.
   steuerbar machen und den Hinweis im Footer (`src/components/Footer.astro`) sowie im
   Impressum anpassen.
3. `npm run build` – Astro erzeugt automatisch AVIF/WebP in passenden Größen.

Wichtig: Fotos realer Objekte nur mit Zustimmung der Eigentümer und nur, wenn das Objekt
tatsächlich vermarktet wird bzw. wurde. Bildrechte (Fotograf) im Impressum nennen.

## Porträt

Sobald ein authentisches Porträt von Sami Issa vorliegt, eignet sich die Über-uns-Seite
(`src/pages/ueber-uns.astro`, Abschnitt „Inhaber“) – dort ersetzt es die Innenraumstudie.
