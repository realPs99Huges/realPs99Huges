# Paki Akin – „Göttliches Timing“ (2 Videos)

Zwei eigenständige Clips mit gemeinsamer Bildsprache, damit sie als Serie erkennbar sind: dieselbe Typografie, Gold als Akzentfarbe, „Licht von oben“ bei den Gottes-Momenten, Musik aus derselben Klangwelt in jeweils eigener Tonart.

| Ordner | Inhalt |
|---|---|
| `1_Gott_sagt_niemals_nein/` | Finaler Edit (59,0 s), Version ohne Musik, SRT-Untertitel |
| `2_Topf_und_Deckel/` | Finaler Edit (55,0 s), Version ohne Musik, SRT-Untertitel |
| `projekt/engine.py` | Schnitt-Engine: Bild, Licht, Typografie, Ton, Mischung, Export |
| `projekt/music.py` | Komposition und Synthese der Musik |
| `projekt/video_*.py` | Je Video eine Datei mit allen Schnitt- und Gestaltungsentscheidungen |
| `projekt/untertitel_*.ass` | Gestaltete, animierte Untertitel (libass/Aegisub) |
| `projekt/source/` | Originalvideos, unverändert |
| `projekt/fonts/` | Inter und Instrument Serif (SIL Open Font License) |

**Technik (beide Videos):** 1080 × 1920 (9:16), 30 fps, H.264 High (CRF 20), AAC 192 kbit/s 48 kHz, Lautheit ≈ −14 LUFS.

Neu rendern: `cd projekt && python3 video_gott_sagt_niemals_nein.py` bzw. `python3 video_topf_und_deckel.py`. Benötigt werden ffmpeg mit libass und libx264 sowie Python mit numpy, scipy und opencv-python-headless. Mit `--preview 12.5` entsteht ein Kontrollbild, mit `--subs-only` werden nur die Untertitel neu geschrieben.

## Rohmaterial

Beide Videos: 720 × 1280 (bereits 9:16), variable Bildrate (~27 Bilder/s auf 30-fps-Raster), AAC Stereo, Ansteckmikrofon in der Hand, klarer Ton. Gleicher Raum und Look wie beim Selbstwert-Video. Das Bild ist gespiegelt (Frontkamera) und wurde bewusst so belassen.

---

## 1 · „Gott sagt niemals nein“ (65,6 s → 59,0 s)

**Dramaturgie:** Der erste Satz *„Gott sagt niemals nein.“* ist bereits der stärkste Hook. Deshalb gibt es **keinen Cold Open**. Der Satz steht als Titel in Serifenschrift, „niemals“ in Gold, dazu warmes Licht von oben und ein tiefer, weicher Akzent auf dem ersten Frame. Danach folgen Zweifel und Fragen („Warum kommt nicht endlich meine Manifestation?“) und dann die Wende.

| Moment | Umsetzung |
|---|---|
| „…wenn es ein **göttliches Timing** gibt?“ | Headline, Licht von oben, weicher Akzent |
| „**Gott hat einen Plan für dich.**“ | Wendepunkt: Das Bild fährt langsam heran, die Worte werden einzeln scharf, „Plan“ in Gold, die Musik öffnet sich |
| „Wer sind wir, dass wir bestimmen…“ | engste Einstellung |
| „Und dass alles genau dann kommt, wenn der **richtige Zeitpunkt** ist.“ | Zeitleiste: Die Linie zeichnet sich, ein Punkt wandert und kommt genau bei „Zeitpunkt“ an der goldenen Marke an, mit Puls und leisem Glockenton |

**Schnitt:**
- Selbstkorrektur entfernt: *„Und dieser Plan, diesen Plan bestimmt er.“* → *„Diesen Plan bestimmt er.“*
- Acht lange Pausen gekürzt, zum Beispiel 1,1 s → 0,3 s nach „glauben wir,“.
- Wiederholungen mit eigener Aussage bleiben drin: „beziehungsweise du hast eine Bestimmung“ und das zweite „Versteh mich nicht falsch.“.

**Musik:** D-Dur/h-Moll. Unter den Zweifeln läuft h-Moll – G – D – A, ab „Gott hat einen Plan für dich“ D – A – h-Moll – G mit Klavier-Arpeggien.
**Sounddesign (4 Effekte):** Akzent auf dem ersten Frame, Akzent auf „Timing“, Akzent bei der Wende, Glockenton bei „Zeitpunkt“.

---

## 2 · „Topf und Deckel“ (59,8 s → 55,0 s)

**Dramaturgie:** **Cold Open** mit der eingängigsten Zeile: *„…komischerweise hat doch jeder Topf einen Deckel.“* Danach folgen ein warmer Lichtblitz und der Titel *„Du hast eine Sehnsucht in dir.“*, „Sehnsucht“ in Gold. Der Cold Open macht neugierig, weil man noch nicht weiß, was ein Topf mit Sehnsucht zu tun hat.

| Moment | Umsetzung |
|---|---|
| „Stell dir vor, es gibt einen **Topf**.“ | Eine Linienzeichnung zeichnet sich von unten nach oben |
| „…hat doch jeder Topf einen **Deckel**.“ | Der Deckel schwebt ein, fällt und setzt genau auf „Deckel“ auf, mit einem leisen Klang und kleinem Nachfedern |
| „Also warum sollte deine **Sehnsucht** …“ | „Sehnsucht“ erscheint im Topf |
| „Und dieser Deckel ist die **Verwirklichung**“ | Der Deckel wird gold, darüber erscheint „Verwirklichung“, dazu ein Glockenton. Die Musik öffnet sich |
| „sondern wenn **Gott will**“ | Licht von oben, Spannungspause bleibt erhalten |
| „wenn das **göttliche Timing** da ist.“ | Schluss-Headline mit Licht von oben |

Die Grafik erklärt die Metapher ohne Worte: **Topf = Sehnsucht, Deckel = Verwirklichung.**

**Schnitt:**
- Wiederholung entfernt: *„Stell dir vor, es gibt einen … Topf. Es gibt einen Topf.“* → *„Stell dir vor, es gibt einen Topf.“* Behalten habe ich die zweite, flüssig gesprochene Version.
- Elf lange Pausen gekürzt.

**Musik:** F-Dur/d-Moll. Erst d-Moll – B – F – C, ab „Und dieser Deckel ist die Verwirklichung“ F – C – d-Moll – B mit Arpeggien.
**Sounddesign (6 Effekte):** Akzent auf dem ersten Frame, Schlag in den Lichtblitz, Luftzug beim fallenden Deckel, Aufsetz-Klang, Glockenton bei „Verwirklichung“, Akzent bei „da ist“.

---

## Gemeinsame Gestaltung

- **Bild:** Punch-ins zwischen 100 % und 130 % um den Gesichts-Anker. Sie werden in einem einzigen Lanczos-Schritt aus der Quelle berechnet, ohne Nachschärfen. Die Wechsel liegen auf Satzgrenzen und kaschieren die Jump-Cuts. Die Farbe ist leicht entgelbt (+4 % Kontrast, −4 % Sättigung), das untere Drittel sanft abgedunkelt für die Lesbarkeit.
- **Untertitel:** Inter SemiBold 62 px, weiß mit weichem Schatten. Sie sitzen bei ~69 % der Bildhöhe, also oberhalb der Beschreibung und links von der Button-Leiste. Schlüsselwörter färben sich genau beim Aussprechen gold. Startzeiten werden automatisch auf den Stimmeinsatz gesetzt. Jede Karte läuft bis zur nächsten, auch über gekürzte Pausen hinweg.
- **Grafiken:** dünne Linien mit weichem dunklem Schatten, damit sie auf dem gestreiften Pullover lesbar bleiben.
- **Ton:** Hochpass 80 Hz, De-Esser, sanfte Kompression, Lautheit auf −14 LUFS normalisiert, 12-ms-Blenden an jedem Schnitt. Die Musik ist eigens komponiert, synthetisiert und rechtefrei. Sie liegt ~13 dB unter der Stimme und wird beim Sprechen automatisch weiter abgesenkt. Das Tempo ist so berechnet, dass die Taktschläge auf die Wendepunkte fallen.
- **Keine externen Bilder:** In beiden Texten werden keine konkreten Personen, Studien oder Ereignisse genannt. Fotos wären hier Dekoration. Die visuelle Ergänzung kommt aus dem Inhalt selbst (Zeitleiste, Topf und Deckel).

## Bitte kurz prüfen

1. **„die du dir ja ach so sehr wünschst“ (Video 1):** Beide Spracherkennungen hören „aka“. Ich habe das als „ach so sehr“ gedeutet, weil es die einzige sinnvolle Lesart ist.
2. **„Versteh mich nicht falsch“:** So gesprochen, ohne „e“.
3. **Musik:** Ich habe sie über Messwerte geprüft (Pegel, Spektrum, Übersteuerung), konnte sie aber nicht anhören. Bitte einmal reinhören. Als Alternative gibt es zu jedem Video die Version ohne Musik.

## Transkripte

**1 · Gott sagt niemals nein**
> Gott sagt niemals nein. Gott sagt nur nicht jetzt, oder es kommt etwas Besseres auf dich zu. Versteh mich nicht falsch, aber oftmals glauben wir, es hätte besser kommen sollen, da hätte etwas Besseres sein sollen, warum passiert das mir nicht, warum kommt nicht endlich meine Manifestation? Was ist aber, wenn es ein göttliches Timing gibt? Und was ist aber, wenn diese eine Sache, ja, die du dir ja ach so sehr wünschst, gar nicht für dich bestimmt ist? Du hast einen Plan, beziehungsweise du hast eine Bestimmung. Gott hat einen Plan für dich. Diesen Plan bestimmt er. Wer sind wir, dass wir bestimmen, was in unserem Leben passieren soll? Versteh mich nicht falsch. Wir haben eine Ausrichtung, ja, und wir sollten uns auch fokussieren. Aber wir dürfen auch wieder in das Göttliche lernen zu vertrauen, auf unseren Weg lernen zu vertrauen, dass alles ein göttliches Timing hat. Und dass alles genau dann kommt, wenn der richtige Zeitpunkt ist.

**2 · Topf und Deckel**
> *(Cold Open)* … komischerweise hat doch jeder Topf einen Deckel.
>
> Du hast eine Sehnsucht in dir. Und weißt du was? Wenn du diese Sehnsucht in dir trägst, gibt es auch einen Plan dafür. Denn diese Sehnsucht wurde nicht umsonst in dich hineingelegt. Solange du diese Sehnsucht in dir verspürst, immer wieder, und sie immer stärker wird, gibt es auch einen Plan dafür. Ja, solange du eine Sehnsucht hast, hat Gott auch den Plan gestiftet. Das ist doch sowas von klar. Stell dir vor, es gibt einen Topf. Und komischerweise hat doch jeder Topf einen Deckel. Also warum sollte deine Sehnsucht nicht auch einen Deckel haben? Und dieser Deckel ist die Verwirklichung, der Plan, der aufgehen wird, aber nicht dann, wenn du willst, sondern wenn Gott will, wenn das göttliche Timing da ist.
