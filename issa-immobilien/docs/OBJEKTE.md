# Angebote (Handelsimmobilien) veröffentlichen

Objekte werden in `src/content/objekte.json` gepflegt. Ist die Liste leer (`[]`), zeigt
`/handelsimmobilien/` nur Schwerpunkte und Anfragewege. Sobald Einträge vorhanden sind,
erscheint zusätzlich „Aktuelle Angebote“, und für jedes Angebot wird eine Detailseite
`/handelsimmobilien/<id>/` erzeugt.

Nur echte, von den Eigentümern freigegebene Objekte eintragen.

## Beispielstruktur

Bilder in einen Ordner neben der JSON-Datei legen, z. B. `src/content/objekte/<id>/`.

```json
[
  {
    "id": "fachmarkt-beispielstadt",
    "veroeffentlicht": true,
    "titel": "…",
    "art": "Fachmarkt",
    "vermarktung": "Miete",
    "ort": "…",
    "kurzbeschreibung": "Ein Satz für die Übersicht.",
    "beschreibung": ["Absatz 1", "Absatz 2"],
    "preis": "Miete auf Anfrage",
    "kennzahlen": [
      { "label": "Verkaufsfläche", "wert": "… m²" },
      { "label": "Stellplätze", "wert": "…" }
    ],
    "energie": "Energieausweis: …",
    "bilder": [
      { "src": "./objekte/fachmarkt-beispielstadt/01.jpg", "alt": "Bildbeschreibung" }
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
