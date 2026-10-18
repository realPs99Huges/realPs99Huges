# Paki Akin – Numerologie-Serie (Zahl 2, 3, 4, 8)

Vier Folgen mit einheitlicher Serien-Gestaltung. Pro Folge gibt es den finalen Edit, eine Version ohne Musik und die Untertitel als SRT:

| Ordner | Geburtstage | Länge |
|---|---|---|
| `Zahl_2/` | 2., 11., 20. | 56,9 s |
| `Zahl_3/` | 3., 12., 30. | 65,0 s |
| `Zahl_4/` | 4., 13., 22. | 70,8 s |
| `Zahl_8/` | 8., 17., 26. | 69,0 s |

**Technik:** 1080 × 1920 (9:16), 30 fps, H.264 High, AAC 192 kbit/s, ca. −14 LUFS, Untertitel fest eingebrannt und zusätzlich als SRT.

| Projektdatei | Inhalt |
|---|---|
| `projekt/serie.py` | Gemeinsame Serien-Elemente (Trailer, große Zahl, Badge, Symbole) |
| `projekt/video_zahl_*.py` | Je Folge alle Schnitt- und Gestaltungsentscheidungen |
| `projekt/engine.py`, `projekt/music.py` | Schnitt-Engine und Musik-Synthese |
| `projekt/face_track_zahl_*.json` | Gemessene Gesichtsposition je Folge |
| `projekt/source/` | Originalvideos, unverändert |

Neu rendern: `cd projekt && python3 video_zahl_3.py` (Optionen `--preview 5.0` und `--subs-only`).

## Serien-Gestaltung (in allen vier Folgen)

1. **Trailer (2,8–4,6 s):** Zwei Fragmente aus der Folge, die neugierig machen. Die Wörter schnappen ins Bild, dazu ein Mikro-Blitz und ein weicher Schlag am Schnitt. Danach wird das Bild kurz dunkel, ein Lichtblitz führt in den Einstieg, die Musik setzt im Takt ein.
2. **Große goldene Zahl:** Genau wenn sie die erste Zahl sagt, erscheint die Zahl groß rechts neben ihr, mit Akzent-Sound. Bei den beiden anderen Daten steht darunter, warum sie dazugehören, mit leisem Tap. Das ist die numerologische Quersumme:
   - Zahl 2: 11 → 1 + 1 = 2, 20 → 2 + 0 = 2
   - Zahl 3: 12 → 1 + 2 = 3, 30 → 3 + 0 = 3
   - Zahl 4: 13 → 1 + 3 = 4, 22 → 2 + 2 = 4
   - Zahl 8: 17 → 1 + 7 = 8, 26 → 2 + 6 = 8
3. **Badge:** Nach dem ersten Satz fliegt die Zahl mit einem Luftzug-Sound nach oben links und bleibt dort als Badge bis zum Ende. Bei jeder Erwähnung („Mit der 2…“, „Als Dreier…“) pulsiert er kurz.
4. **Stichwort-Grafiken:** Aufzählungen erscheinen Wort für Wort im Bild, jeweils mit leisem Tap.
5. **Musik:** Jede Folge hat ihre eigene Tonart. Die Musik öffnet sich am Wendepunkt der Folge.

## Die Folgen im Einzelnen

### Zahl 2 – „feinfühlige Seele“
- **Trailer:** „…Konflikt hast mit deiner **Mama**.“ → „Arbeite **daran**.“
- **Grafik:** Familie · Gemeinschaft · Freunde.
- **Gold:** feinfühlige, Intuition, diplomatisch, *nicht gut genug*, *nicht so viel wert*, Selbstzweifeln, Selbstwertgefühl.
- **Wendepunkt:** „**Arbeite daran.**“ als Headline mit Licht von oben, die Musik wechselt von d-Moll nach F-Dur.
- **Schluss:** Kommentar-Symbol bei „in die Kommentare“, der Badge pulsiert beim zweiten „Bist du am 2., 11. …“.

### Zahl 3 – „kindliche Energie“
- **Trailer:** „Hör auf zu **prokrastinieren**.“ → „Das ist ein **Manko** von dir.“
- **Gold:** schlauesten, lustig, humorvoll, kindliche Energie, Spaß, Abenteuer, Ausdruck, Kommunikation, Gemeinschaft.
- **Headline:** „und hör auf zu **prokrastinieren**.“
- **Wendepunkt:** „Gleichzeitig stehst du aber auch für die **Umsetzung**“, die Musik öffnet sich.
- **Schluss:** Headline „und drück dich **aus**.“

### Zahl 4 – „der Künstler“
- **Trailer:** „sehr ehrlich oder sehr lügnerisch,“ → „Du gehörst auf die **Bühne**.“
- **Headline mit Bühnen-Spot:** „Du gehörst auf die **Bühne**“ wird von einem schmalen Lichtkegel von oben beleuchtet.
- **Grafiken:** Planung · Organisation · Recht · Unternehmertum. Danach **ehrlich | lügnerisch** links und rechts einer Trennlinie. Bei „Entweder bist du sehr ehrlich oder du lügst sehr viel“ leuchtet jede Seite noch einmal auf.
- **Wendepunkt:** Ab „Du hast ebenso schauspielerisches Talent“ öffnet sich die Musik. „singen · tanzen · malen“ läuft in einer Reihe ein, dazu die Headline „du bist der geborene **Künstler**“ mit Spot.
- **Schluss:** Kommentar-Symbol.

### Zahl 8 – „starke Persönlichkeit“
- **Trailer:** „Ich muss die Dinge **kontrollieren**.“ → „Dein allergrößtes **Manko:**“. Der Satz bricht vor der Antwort ab, als Cliffhanger.
- **Grafik:** Wohlstand · Materie · Wahrnehmung · Wahrheit als 2×2-Raster.
- **Headline:** „Dein allergrößtes Manko: **Gleichgewicht.**“ Darüber pendelt eine goldene Waage, die nie zur Ruhe kommt, solange sie über das Gleichgewicht spricht.
- **Wendepunkt:** „Was du lernen darfst, ist **Kontrolle abgeben**.“ Licht, Akzent, die Musik wechselt von c-Moll nach Es-Dur.
- **Schluss:** Headline „deswegen bist du immer ein **Wahrheitssuchender.**“

## Schnitt

Gekürzt sind nur lange Pausen (4–9 je Folge). Inhalt, Reihenfolge und Wortlaut bleiben unverändert. Versprecher gab es keine, die geschnitten werden mussten.

## Bitte kurz prüfen

1. **Quersummen:** Die Rechnungen (z. B. 12 → 1 + 2 = 3) sind eine Ergänzung von mir. Sie erklären, warum die drei Daten zu einer Zahl gehören. Sie stimmen rechnerisch und entsprechen der üblichen numerologischen Methode. Wenn du sie nicht im Bild willst, lassen sie sich in einer Zeile entfernen.
2. **Zahl 3, erster Satz:** Akustisch ist nicht eindeutig, ob sie „Du **bist** am 3. …“ oder „Du **wirst** am 3. …“ sagt (die Spracherkennung schwankt). Untertitelt ist „Du bist am 3., 12. oder aber auch am 30. geboren“, das ist grammatisch richtig und entspricht den anderen Folgen.
3. **Zahl 8, „Acht geben“:** in zwei Wörtern (Duden erlaubt beides), passend zur „8“.
4. **Musik:** Ich habe sie über Messwerte geprüft, konnte sie aber nicht anhören. Zu jeder Folge gibt es die Version ohne Musik.
