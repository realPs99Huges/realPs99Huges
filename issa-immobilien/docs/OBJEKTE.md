# Objekte veröffentlichen

Objekte werden in `src/content/objekte.json` gepflegt. Ist die Liste leer (`[]`), zeigt
`/objekte/` die Anfragewege „Sie bieten an / Sie suchen“. Sobald Einträge vorhanden sind,
erscheint zusätzlich eine Übersicht, und für jedes Objekt wird eine Detailseite
`/objekte/<id>/` erzeugt.

Nur echte, von den Eigentümern freigegebene Objekte eintragen.

## Beispielstruktur

Bilder in einen Ordner neben der JSON-Datei legen, z. B. `src/content/objekte/<id>/`.

```json
[
  {
    "id": "wohnung-lippstadt-zentrum",
    "veroeffentlicht": true,
    "titel": "…",
    "art": "Eigentumswohnung",
    "vermarktung": "Kauf",
    "ort": "Lippstadt",
    "kurzbeschreibung": "Ein Satz für die Übersicht.",
    "beschreibung": ["Absatz 1", "Absatz 2"],
    "preis": "Kaufpreis: … €",
    "kennzahlen": [
      { "label": "Wohnfläche", "wert": "… m²" },
      { "label": "Zimmer", "wert": "…" }
    ],
    "energie": "Energieausweis: …",
    "bilder": [
      { "src": "./objekte/wohnung-lippstadt-zentrum/01.jpg", "alt": "Bildbeschreibung" }
    ]
  }
]
```

- `id`: nur Kleinbuchstaben, Ziffern und Bindestriche (wird Teil der URL)
- `veroeffentlicht: false` blendet ein Objekt aus, ohne es zu löschen
- Die Pflichtangaben für Immobilienanzeigen (z. B. Energieausweis nach GEG) sind vom Betreiber
  zu prüfen und in `energie` bzw. `kennzahlen` anzugeben.

Nach dem Bearbeiten: `npm run build`. Fehlerhafte Einträge werden beim Build mit einer
Meldung abgewiesen.
