# Bilder

Die Website verwendet ausschließlich Bilder, die vom Auftraggeber bereitgestellt wurden.
Es werden keine Bilder generiert oder aus fremden Quellen eingebunden.

## Bildflächen

Alle Bilder werden zentral in `src/data/images.ts` den Bildflächen zugeordnet. Zum Austausch
genügt es, eine Datei in `src/assets/images/` abzulegen, sie in `images.ts` zu importieren und
der passenden Fläche zuzuweisen. Astro erzeugt beim Build automatisch AVIF/WebP in passenden Größen.

| Fläche | Einsatz | Aktuelles Bild | Format / empfohlene Größe |
| --- | --- | --- | --- |
| `hero` | Startseite „Der richtige Standort …“ (Hochformat) und Bildreihe | `shopping-center-galerie.jpg` | 4:5, mind. 1200 × 1500 px |
| `einzelhandel` | Bildreihe (Startseite, Leistungen, Handelsimmobilien) | `einzelhandel-einkauf.jpg` | 3:2, mind. 1200 px breit |
| `deutschland` | Bildreihe (Startseite, Leistungen, Handelsimmobilien) | `einkaufsstrasse-innenstadt.jpg` | 3:2, mind. 1200 px breit |
| `ueberUns` | Über Issa Immobilien (Porträt oder Büro) | – noch nicht geliefert | 4:5, mind. 1200 × 1500 px |

Flächen ohne Bild (`src: null`) werden ausgeblendet (Über uns) bzw. als neutrale Fläche dargestellt.
Platzhalter werden nie als Immobilienangebote oder Referenzen dargestellt.

## Hinweise zu den gelieferten Fotos

- Die drei Fotos liegen nur in **600 × 400 px** vor. Auf großen und hochauflösenden Bildschirmen
  wirken sie dadurch weich. Bitte möglichst in höherer Auflösung nachliefern (siehe Tabelle).
- Bitte sicherstellen, dass für alle Fotos die **Nutzungsrechte** vorliegen (z. B. Lizenz der
  Bildagentur) und ggf. Bildnachweise im Impressum ergänzen.
- Auf `einkaufsstrasse-innenstadt.jpg` sind Markenschilder von Geschäften erkennbar. Das Foto
  zeigt eine allgemeine Einkaufsstraße und stellt keine Geschäftsbeziehung dar; bei Bedenken
  durch ein neutrales Motiv ersetzen.

## Logo

- Originale: `src/assets/brand/original-logo-hell.jpg` und `original-visitenkarte-dunkel.jpg`
- Daraus freigestellt (Form und Farben unverändert, nur Hintergrund transparent):
  `logo-issa-immobilien.png` (helle Hintergründe), `logo-issa-immobilien-negativ.png`
  (dunkle Hintergründe) und `bildmarke.png` (Favicon). Skript: `npm run prepare:logo`.
- Liegt das Logo als Vektordatei (SVG/PDF/EPS) vor, sollte diese die PNG-Dateien ersetzen –
  für die schärfste Darstellung auf allen Bildschirmen.

## Logo-Animation auf der Startseite

`src/components/LogoReveal.astro` zeigt das Original-Logo groß und baut es in drei Schritten auf
(Bildmarke, „ISSA“, „IMMOBILIEN“). Dafür werden drei deckungsgleiche Ausschnitte derselben
Bilddatei nacheinander sichtbar – das Logo selbst wird nicht verändert. Für die schärfste
Darstellung in dieser Größe das Logo bitte als SVG oder als PNG mit mind. 1600 px Breite liefern;
bei geändertem Seitenverhältnis die Ausschnittsgrenzen in der Komponente anpassen.

## Markenfarben (aus den Originaldateien gemessen)

| Token | Wert | Herkunft |
| --- | --- | --- |
| `--green` | `#038604` | Grün in Logo und Visitenkarte |
| `--slate` | `#4E5258` | Grau „IMMOBILIEN“ im Logo |
| `--anthracite` | `#2A2A2A` | Hintergrund der Visitenkarte |
