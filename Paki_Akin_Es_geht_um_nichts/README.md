# Paki Akin – „Es geht um nichts“

| Datei | Inhalt |
|---|---|
| `Paki_Akin_Es_geht_um_nichts_1080x1920.mp4` | **Finaler Edit**: 9:16, 1080 × 1920, 30 fps, H.264 High, AAC 192 kbit/s, 63,0 s |
| `Paki_Akin_Es_geht_um_nichts_ohne_Musik_1080x1920.mp4` | Identisches Bild ohne Musik, zum Unterlegen eines Sounds direkt in der App |
| `Paki_Akin_Es_geht_um_nichts_Untertitel.srt` | Untertitel als separate Datei |
| `projekt/video_es_geht_um_nichts.py` | Alle Schnitt- und Gestaltungsentscheidungen dieses Videos |
| `Version_2_Hook-Montage/` | **Version 2** (67,0 s) mit Hook-Montage und mehr Effekten, mit und ohne Musik, eigene SRT (siehe unten) |
| `projekt/video_es_geht_um_nichts_v2.py` | Konfiguration von Version 2 |
| `projekt/engine.py`, `projekt/music.py` | Schnitt-Engine und Musik-Synthese (Stand Selbstsabotage-Video, plus Abdunklungen und Lichtblitze an beliebigen Stellen) |
| `projekt/source/` | Originalvideo, unverändert |

Neu rendern: `cd projekt && python3 video_es_geht_um_nichts.py` bzw. `python3 video_es_geht_um_nichts_v2.py` (Optionen `--preview 25.0` und `--subs-only`).

## Version 2 – Hook-Montage und mehr Effekte

Gleiches Originalvideo, gleicher Grundschnitt wie Version 1. Neu sind:

| Zeit | Was passiert |
|---|---|
| 0,0 s | **Hook-Montage** mit drei Fragmenten, die neugierig machen, ohne „Es geht um nichts“ zu verraten: *„Worum geht es denn bei diesem **Meeting?**“*, *„Mach es dir **leicht**.“*, *„Trust **me**.“* Jedes Fragment hat einen eigenen Ausschnitt, die Wörter schnappen ins Bild, Herzschlag auf dem ersten Frame, Mikro-Blitze und weiche Schläge an den Schnitten |
| 3,5 s | Das Bild wird dunkler, Stille, zweiter Herzschlag, ein Rauschanstieg läuft zu |
| 4,0 s | **Lichtblitz** → Titel „Dieser eine **Satz** wird alles für dich verändern.“, die Musik setzt im Takt ein |
| 27,4 s | Vor der Enthüllung wird das Bild erneut dunkler, mit Herzschlag in der Spannungspause |
| 27,9 s | **Lichtblitz auf „Es“** → „Es geht um **nichts**.“, Akzent, die Musik öffnet sich |
| ~30 s | Prüfung / Entscheidung / Treffen erscheinen mit leisem Tap und werden bei „nichts“ golden durchgestrichen (wie in Version 1) |
| ~52 s | **Drei weiche Zoom-Punches** bei den drei Fragen (Prüfung? Titel? Meeting?), jeweils mit Luftzug-Sound. Die Kamera fährt in 0,2 s an statt hart zu springen |
| 59,3 s | Bei „Mach es dir **leicht**.“ schwebt „leicht.“ wie eine Feder nach oben weg, die Buchstaben ziehen dabei auseinander |
| 60,7 s | Das Lesezeichen erscheint bei „Video ab“ und füllt sich gold |

## Rohmaterial

- **Bild:** 464 × 848 Pixel. Das ist deutlich kleiner als bei den anderen Videos und etwas schmaler als 9:16 (Verhältnis 29:53).
- **Bildrate:** variabel, ca. 27 Bilder/s, 66,3 s.
- **Szene:** gleicher Raum und gleicher Look wie bei den vorherigen Videos, Ton über Ansteckmikrofon.
- **Format:** Das Bild füllt die volle Breite, oben und unten fehlen je 27 px.
- **Auflösung:** Weil die Quelle so klein ist, wird sie ~2,3-fach hochgerechnet (Lanczos, ohne Nachschärfen). Das Ergebnis ist sauber, aber weicher als bei 720p-Quellen. Mehr Schärfe gibt das Material nicht her. Die Punch-ins sind deshalb bewusst klein gehalten (max. 15 %).

## Dramaturgie

**Kein Cold Open:** *„Dieser eine Satz wird alles für dich verändern.“* ist schon ein perfekter Hook, denn er erzeugt Neugier auf genau diesen Satz. Der Einstieg ist ein Titel in Serifenschrift („Satz“ in Gold), dazu ein warmer Lichtschleier von links und ein tiefer, weicher Akzent auf dem ersten Frame.

| Moment | Umsetzung |
|---|---|
| Aufbau: „…dann musst du diesen einen Satz verinnerlichen … Trust me.“ | Das Bild fährt langsam heran, die Musik bleibt gedämpft und baut Spannung auf, ein Riser läuft in die Pause |
| **„Es geht um nichts.“** | Die Spannungspause davor bleibt (0,6 s). Die Worte erscheinen genau in ihrem langsamen, betonten Sprechtempo, „nichts“ in Gold. Dazu Licht von oben, ein Akzent, und die Musik öffnet sich |
| „Prüfung … Entscheidung … Treffen“ | Die drei Situationen stapeln sich Wort für Wort im Bild |
| „…sagst du dir, es geht um **nichts**.“ | Alle drei werden genau bei „nichts“ golden durchgestrichen und blassen ab |
| Drei Fragen: „Worum geht es denn bei dieser Prüfung? … Titel? … Meeting?“ | Drei Stufen im Bildausschnitt (105 % → 110 % → 115 %), die Steigerung entsteht durch den Schnitt, nicht durch Effekte |
| **„Mach es dir leicht.“** | Headline, Licht von oben |
| „Speicher dir dieses Video ab“ | Ein Lesezeichen-Symbol füllt sich gold, mit leisem Tap |
| Schluss: „…es geht um **nichts**.“ | Schluss-Headline, Licht von oben, leiser Glockenton, die Musik endet auf dem Grundakkord |

**Schnitt:** sieben lange Pausen gekürzt, zum Beispiel 1,0 s → 0,36 s nach „wichtig ist,“. Bewusst **nicht** gekürzt sind die Pausen innerhalb von „Es … geht … um … nichts“. Dieses langsame Sprechen ist ihre Betonung und trägt die Aussage. Versprecher gab es keine.

**Keine externen Bilder:** Im Text werden keine konkreten Personen, Studien oder Ereignisse genannt. Die Liste und die Durchstreichungen zeigen die Aussage direkt.

## Ton & Musik

- **Stimme:** Hochpass 80 Hz, De-Esser, sanfte Kompression, Lautheit auf −14 LUFS normalisiert, 12-ms-Blenden an jedem Schnitt.
- **Musik:** eigene Komposition, synthetisiert und rechtefrei, in e-Moll/G-Dur.
  - Unter dem Aufbau läuft e-Moll – C – G – D, ab „Es geht um nichts“ G – D – e-Moll – C mit Klavier-Arpeggien.
  - Das Tempo ist so berechnet, dass der erste Taktschlag auf „Bleib dran“ fällt und die Öffnung exakt auf „Es“.
  - Unter der Stimme wird sie automatisch abgesenkt.
- **Sounddesign (4 Effekte):** Akzent auf dem ersten Frame, Akzent auf „Es geht um nichts“, Tap beim Lesezeichen, Glockenton beim letzten „nichts“.

## Bitte kurz prüfen

1. **„Trust me.“** bleibt englisch, wie gesprochen.
2. **„Speicher dir dieses Video ab“:** So gesprochen, beide Spracherkennungen hören „Speicher“.
3. **„bei diesem Titel?“:** Von beiden Spracherkennungen bestätigt.
4. **Musik:** Ich habe sie über Messwerte geprüft, konnte sie aber nicht anhören. Bitte einmal reinhören. Die Version ohne Musik liegt bei.

## Transkript

> Dieser eine Satz wird alles für dich verändern. Bleib dran, hör mir zu, was ich dir zu sagen habe. Wenn du dein Leben verändern willst, wenn du endlich ein besseres, leichteres Leben haben willst, ja, vielleicht auch ein regulierteres Nervensystem, dann musst du diesen einen Satz verinnerlichen, so tief in jede Zelle deiner selbst. Trust me. Es geht um nichts. Ab sofort. Wenn du vor einer Prüfung stehst, wenn du vor einer wichtigen Entscheidung stehst, wenn du vor einem Treffen stehst, das dir wichtig ist, sagst du dir, es geht um nichts. Mit dieser Ausrichtung, mit dieser Intention verschaffst du deinem Unterbewusstsein Leichtigkeit, dass es um nichts geht. Und wenn wir doch mal ehrlich sind, worum geht es denn bei dieser Prüfung? Worum geht es denn bei diesem Titel? Worum geht es denn bei diesem Meeting? Mach es dir leicht. Speicher dir dieses Video ab für schwierige Zeiten, damit du dich daran wieder erinnerst, es geht um nichts.
