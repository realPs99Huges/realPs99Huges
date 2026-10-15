# Paki Akin – „Selbstwert“

| Datei | Inhalt |
|---|---|
| `Paki_Akin_Selbstwert_1080x1920.mp4` | **Finaler Edit**: 9:16, 1080 × 1920, 30 fps, H.264 High, AAC 192 kbit/s, 56,6 s, −14,2 LUFS |
| `Paki_Akin_Selbstwert_ohne_Musik_1080x1920.mp4` | Identisches Bild, Ton ohne Musik. Zum Unterlegen eines Sounds direkt in TikTok/Instagram |
| `Paki_Akin_Selbstwert_Untertitel.srt` | Untertitel als separate Datei (Timeline des Edits) |
| `projekt/edit.py` | Schnittprojekt: Schnitt, Bildausschnitte, Licht, Typografie, Sounddesign, Mischung, Export |
| `projekt/music.py` | Komposition und Synthese der Hintergrundmusik |
| `projekt/untertitel_animiert.ass` | Gestaltete und animierte Untertitel (libass/Aegisub) |
| `projekt/source/` | Originalvideo, unverändert (SHA-256 `4cf6f622…1424a483`) |
| `projekt/fonts/` | Inter und Instrument Serif (SIL Open Font License) |

Neu rendern: `cd projekt && python3 edit.py`. Ein Render dauert etwa 6 Minuten. Benötigt werden ffmpeg mit libass und libx264 sowie Python mit numpy, scipy und opencv-python-headless. Die Version ohne Musik entsteht dabei automatisch mit.

## Analyse des Rohmaterials

- **Datei:** 720 × 1280 (bereits 9:16), H.264, variable Bildrate (~26,7 Bilder/s auf 30-fps-Raster), AAC Stereo 44,1 kHz, 56,2 s.
- **Bild:** Frontkamera, frontal, sauber belichtet. Warmes Lampenlicht links, die Hauttöne sind leicht gelblich/magenta. Das Bild ist gespiegelt (Selfie-Kamera), deshalb steht der Schriftzug „Soul Sisters“ an der Wand spiegelverkehrt.
- **Ton:** Ansteckmikrofon, das in der Hand gehalten wird. Klar und rauscharm, die App hat bereits ein Noise-Gate angewendet. Lautstärkespitzen entstehen durch den wechselnden Abstand zum Mikrofon.
- **Inhalt:** ein Selbstwert-Monolog in zwei Hälften. Erst kommen konfrontierende Fragen („Warum hältst du dich klein?“), dann die Wende „Du hast einen Wert in dir.“ und die Ermutigung, am Ende ein Call-to-Action.

## Dramaturgie und Schnitt (56,2 s → 56,6 s inkl. Cold Open)

1. **Cold Open (0–3,8 s):** Das Video beginnt mit der stärksten Frage aus der Mitte des Videos: *„Warum bist du weniger wert als jemand anderes da draußen?“* Sie baut sich groß in Serifenschrift auf, im engsten Bildausschnitt, mit warmem Lichtschleier von links (aus Richtung der Lampe) und einem tiefen, weichen Akzent auf dem ersten Frame.
2. **Übergang:** Ein Rauschanstieg läuft in einen warmen Lichtblitz. Auf dem ersten Taktschlag der Musik folgt der Schnitt auf *„Das sagt dir niemand.“* als Titel. Zusammen gelesen ergibt das eine Antwort: Niemand sagt dir, dass du weniger wert bist.
3. **Die Fragen:** Bei jeder neuen Frage wechselt der Bildausschnitt (weit, nah oder ganz nah bei „todernst“). Bei *„kleiner“* schrumpft das Wort, während die Kamera gleichzeitig aufzieht.
4. **Wendepunkt (ab 31,9 s):** *„Du hast einen Wert in dir.“* Das Bild fährt langsam heran, die Worte werden einzeln scharf, „Wert“ erscheint in Gold. Dazu kommen ein weicher Impact und ein Lichtschleier, und die Musik öffnet sich.
5. **Podest-Metapher:** Bei *„Du darfst erst mal dich auf diesen Podest stellen“* öffnet sich eine goldene Linie. Bei „stellen“ steigt „dich“ aus ihr auf und landet darauf. Bei *„… die anderen mit auch noch da hoch“* wird die Linie breiter.
6. **Call-to-Action:** Bei „Kommentare“ erscheint ein Kommentar-Symbol. Bei „abspeichern“ füllt sich ein Lesezeichen-Symbol gold, wie der Speichern-Button in der App. Danach endet das Video auf ihrem Lächeln.

**Gekürzt** wurden 0,6 s Vorlauf am Anfang sowie Pausen nach „da draußen?“ (1,0 → 0,35 s), nach „Erklär es mir,“, nach „stellen.“, nach „hoch.“ und nach „Also,“ (1,0 → 0,25 s). Gekürzt habe ich nur in Pausen, an keiner Stelle im Satz. Versprecher oder Wiederholungen, die den Fluss stören, gab es nicht. Die Reihenfolge ist original, nur der Cold Open wiederholt eine spätere Aussage.

**Keine externen Bilder:** Im Text werden keine konkreten Personen, Studien oder Ereignisse genannt. Fotos oder Grafiken hätten hier nichts erklärt, sondern nur dekoriert. Die visuelle Ebene entsteht deshalb aus Typografie, die den Inhalt bildlich umsetzt („kleiner“, Podest, Speichern).

## Bild

- **Bildausschnitte:** 22 Einstellungen zwischen 100 % und 130 %. Sie werden in einem einzigen Lanczos-Schritt direkt aus der Quelle berechnet, ohne Nachschärfen. Der Ankerpunkt liegt auf dem Gesicht.
- **Farbe:** Gelb- und Magentastich leicht reduziert, Kontrast +4 %, Sättigung −4 %. Keine Hautretusche über das hinaus, was schon im Original ist.
- **Lesbarkeit:** Das untere Drittel ist mit einem sanften Verlauf abgedunkelt (max. 34 %), weil der gestreifte Pullover hell und unruhig ist.
- **Licht:** zwei Lichtschleier (Opener, „Wert“) und ein einziger Lichtblitz (Übergang nach dem Cold Open).

## Typografie und Untertitel

- **Untertitel:** Inter SemiBold, 62 px, weiß mit weichem Schatten. Sie sitzen bei 69 % der Bildhöhe, also oberhalb der Beschreibung und links von der Button-Leiste. Pro Karte höchstens etwa 26 Zeichen.
- **Highlights:** Serifenschrift (Instrument Serif) nur für fünf Momente: Cold Open, Titel, „kleiner“, „Du hast einen Wert in dir“ und Podest.
- **Gold-Hervorhebung** genau im Moment des Aussprechens bei: *todernst, weniger wert, Wert, Selbstwertgefühl, Podest, da hoch, Hausaufgabe*.
- **Sync:** Die Startzeiten werden automatisch auf den tatsächlichen Stimmeinsatz gesetzt. Geprüft habe ich das, indem ich den fertigen Export erneut per Spracherkennung transkribiert habe. Alle Karten liegen innerhalb von ±0,17 s, meist knapp vor dem Wort.

## Ton

- **Stimme:** Hochpass 80 Hz, De-Esser, sanfte Kompression 2,5:1, Lautheit auf −14 LUFS normalisiert. An jedem Schnitt liegen 12-ms-Blenden.
- **Musik (eigene Komposition, synthetisiert, rechtefrei):** 68 BPM, A-Moll/C-Dur.
  - Unter den Fragen läuft gedämpft Am–F–C–G.
  - Ab „Du hast einen Wert in dir“ wechselt sie auf C–G–Am–F mit Klavier-Arpeggien und Bass.
  - Das Tempo ist so berechnet, dass der erste Taktschlag exakt auf den Schnitt nach dem Cold Open fällt und die Öffnung exakt auf „Du“.
  - Unter der Stimme wird die Musik automatisch um ~7 dB abgesenkt. Gesamt liegt sie bei −26,7 LUFS, etwa 13 dB unter der Stimme.
- **Sounddesign (6 Effekte, alle synthetisch):** tiefer Akzent auf dem ersten Frame, Riser mit weichem Schlag in den Lichtblitz, Tap beim Kommentar-Symbol, Impact auf „Wert“, Aufwärts-Whoosh mit Höhepunkt genau bei der Landung von „dich“, Tap beim Füllen des Lesezeichens.
- **Kontrolle:** Die Spracherkennung versteht auch in der Version mit Musik jedes Wort.

## Bitte kurz prüfen

1. **„Und ich meine es gerade todernst“:** Eine Spracherkennung hört „es“, die andere „das“. Ich habe mich für „es“ entschieden.
2. **„diesen Podest“:** So gesprochen und übernommen. Duden erlaubt *der Podest* neben *das Podest*.
3. **Gespiegeltes Bild:** So belassen, damit die vertraute Selfie-Ansicht erhalten bleibt.
4. **Musik:** Die Musik ist eigens komponiert und rechtefrei, aber bewusst zurückhaltend. Wer lieber einen Trend-Sound nutzen will, nimmt die Version ohne Musik und legt den Sound in der App mit ca. 5–10 % Lautstärke darunter.

## Transkript

> *(Cold Open)* Warum bist du weniger wert als jemand anderes da draußen?
>
> Das sagt dir niemand. Warum hältst du dich eigentlich klein? Warum machst du dich immer wieder kleiner, als du bist? Warum vergötterst du irgendwelche Stars? Warum vergötterst du Menschen, die nicht mal ansatzweise für dich Ozeane überqueren würden? Und ich meine es gerade todernst. Warum bist du weniger wert als jemand anderes da draußen? Erklär es mir, beantworte mir diese Frage. Jetzt schreib sie mir hier jetzt in die Kommentare. Du hast einen Wert in dir. Und diesen Wert darfst du erkennen. Du darfst heute anfangen, dich nicht mehr klein zu halten, dein Selbstwertgefühl zu stabilisieren, nicht andere Menschen auf ein Podest zu stellen. Du darfst erst mal dich auf diesen Podest stellen. Und dann nimmst du die anderen mit auch noch da hoch. Also, Hausaufgabe erledigen, Video abspeichern. Ich freue mich, von dir zu lesen.
