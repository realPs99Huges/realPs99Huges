# Paki Akin – „Warum sabotieren sich Menschen selbst?“

| Datei | Inhalt |
|---|---|
| `Paki_Akin_Selbstsabotage_1080x1920.mp4` | **Finaler Edit**: 9:16, 1080 × 1920, 30 fps, H.264 High, AAC 192 kbit/s, 67,7 s |
| `Paki_Akin_Selbstsabotage_ohne_Musik_1080x1920.mp4` | Identisches Bild ohne Musik |
| `Paki_Akin_Selbstsabotage_Untertitel.srt` | Untertitel als separate Datei |
| `projekt/video_selbstsabotage.py` | Alle Schnitt- und Gestaltungsentscheidungen dieses Videos |
| `projekt/engine.py`, `projekt/music.py` | Schnitt-Engine und Musik-Synthese, für dieses Video erweitert (siehe unten) |
| `projekt/face_track.py`, `projekt/face_track.json` | Gemessene Gesichtsposition über die Zeit, damit die Zooms dem Gesicht folgen |
| `projekt/source/` | Originalvideo, unverändert |

Neu rendern: `cd projekt && python3 video_selbstsabotage.py` (Optionen `--preview 5.3` und `--subs-only`).

## Der Einstieg: Hook-Montage (0–5,3 s)

Statt direkt mit der Frage zu beginnen, baut eine kurze Montage aus drei Fragmenten aus dem Video Spannung auf:

| Zeit | Fragment | Bild & Ton |
|---|---|---|
| 0,0 s | „Deinem Nervensystem ist es **scheißegal**.“ | eng, schnelles Heranfahren. Die Wörter schnappen ins Bild. Herzschlag auf dem ersten Frame, dunkle c-Moll-Fläche |
| 1,7 s | „Verlass diesen **Mann**.“ | Hart geschnitten mit kurzem Mikro-Blitz und weichem Schlag, neuer Bildausschnitt |
| 3,1 s | „…ist ein verlorener **Tag**.“ | Mikro-Blitz und Schlag. Danach wird das Bild dunkler, es wird still, und ein zweiter Herzschlag folgt, während ein Rauschanstieg zuläuft |
| 5,3 s | Lichtblitz → „**Warum sabotieren** sich eigentlich Menschen selbst?“ | Schlag, warmes Licht, die Musik setzt im Takt ein |

Die Fragmente sind so gewählt, dass sie neugierig machen, ohne die Antwort zu verraten: eine provokante Aussage, eine Aufforderung und das, was auf dem Spiel steht. Alle drei kommen später im Video noch einmal an ihrer Originalstelle.

## Dramaturgie im Hauptteil

| Moment | Umsetzung |
|---|---|
| „Ich sag's dir, warum. Damit sie sich anschließend wieder **motivieren** können.“ | Punch-in, „motivieren“ in Gold, weil es die überraschende Antwort ist |
| „…aus **Unbewusstheit**, aus einer **Schutzstrategie** … ihre **wahre Größe**“ | Schlüsselwörter färben sich beim Aussprechen gold |
| „…ob du **glücklich** bist, **zufrieden** bist oder **erfolgreich** bist.“ | Die drei Wörter erscheinen nebeneinander, jeweils mit leisem Tap |
| „Dein Nervensystem sagt nur: Okay, ist das **sicher?**“ | Die drei Wünsche verblassen, groß erscheint „sicher?“. Das zeigt den Kern der Aussage: Das Nervensystem will nicht Glück, sondern Sicherheit |
| „Aber soll ich dir mal was sagen?“ | engste Einstellung, Spannung vor der Wende |
| **„Hör auf, dich selbst zu sabotieren.“** | Wendepunkt: Headline, warmes Licht, Akzent, und die Musik wechselt von c-Moll in ein offenes Es-Dur mit Klavier-Arpeggien |
| „Triff diese Entscheidung, geh aus diesem Umfeld heraus. Verlass diesen Mann…“ | drei Aufforderungen in drei Stufen im Bildausschnitt (103 % → 107 % → 111 %) |
| „Denn jeder Tag, an dem du…“ | Steigerung durch immer engere Einstellungen bis zum Schluss |
| **„…ist ein verlorener Tag.“** | Schluss-Headline, „Tag.“ in Gold, Akzent, die Musik endet ernst auf c-Moll |

**Schnitt:** 14 Pausen gekürzt, meist auf 0,3 s. Bewusst stehen geblieben ist die Spannungspause vor „ist ein verlorener Tag“. Versprecher gab es keine.

## Neu in der Engine für dieses Video

- **Gesichtsverfolgung:** Sie lehnt sich in diesem Video oft zur Kamera und wieder zurück, die Gesichtsbreite schwankt zwischen ca. 330 und 530 px. Ich habe die Gesichtsposition 5-mal pro Sekunde gemessen, Ausreißer entfernt und die Spur weich geglättet. Jeder Punch-in zoomt um das Gesicht herum, und die Zoomstärke ist an den Abstand angepasst: kleine Zooms, wenn sie nah ist, größere, wenn sie weiter weg sitzt.
- **Mehrteilige Hook-Montage** mit Mikro-Blitzen an den Montage-Schnitten und einer Abdunklung vor dem Haupteinstieg.
- **Herzschlag** als neues Sounddesign-Element und eine neue Tonart (c-Moll/Es-Dur).

## Ton & Musik

- **Stimme:** Hochpass 80 Hz, De-Esser, sanfte Kompression, Lautheit auf −14 LUFS normalisiert, 12-ms-Blenden an jedem Schnitt.
- **Musik:** eigene Komposition, synthetisiert und rechtefrei.
  - Montage: dunkle Klangfläche mit Rauschanstieg in den Lichtblitz.
  - Danach c-Moll – As – Es – B.
  - Ab „Hör auf, dich selbst zu sabotieren“ Es – B – c-Moll – As mit Arpeggien.
  - Unter der Stimme wird sie automatisch abgesenkt.
- **Sounddesign (11 Effekte):** 2× Herzschlag, 3× weicher Schlag (Montage-Schnitte und Lichtblitz), 3× leiser Tap (glücklich/zufrieden/erfolgreich), 3× Akzent („sicher?“, „Hör auf“, „Tag.“).

## Bitte kurz prüfen

1. **„scheißegal“** steht so im Untertitel und in der Montage, wie gesprochen. Falls dir das als Einstieg zu direkt ist, lässt sich das erste Fragment in `TEASER` ersetzen, zum Beispiel durch „Hör auf, dich selbst zu sabotieren.“.
2. **Musik:** Ich habe sie über Messwerte geprüft, konnte sie aber nicht anhören. Bitte einmal reinhören. Die Version ohne Musik liegt bei.

## Transkript

> *(Montage)* Deinem Nervensystem ist es scheißegal. – Verlass diesen Mann. – … ist ein verlorener Tag.
>
> Warum sabotieren sich eigentlich Menschen selbst? Ich sag's dir, warum. Damit sie sich anschließend wieder motivieren können. Ja, du hast richtig gehört. Menschen sabotieren sich selbst aus Unbewusstheit, aus einer Schutzstrategie heraus, damit sie nicht in ihre wahre Größe kommen. Denn dein Nervensystem will immer nur das, was vertraut ist. Deinem Nervensystem ist es scheißegal, ob du glücklich bist, zufrieden bist oder erfolgreich bist. Dein Nervensystem sagt nur: Okay, ist das sicher? Dann will ich das. Und wer weiß schon, was für deinen Körper sicher ist? Wer weiß schon, was du alles in deinem Leben erlebt hast? Aber soll ich dir mal was sagen? Hör auf, dich selbst zu sabotieren. Triff diese Entscheidung, geh aus diesem Umfeld heraus. Verlass diesen Mann, wenn er dir nicht guttut. Hör auf, dich selbst zu sabotieren. Denn jeder Tag, an dem du dich selbst sabotierst, an dem du dich klein hältst, an dem du Dinge tust, die du nicht willst, ist ein verlorener Tag.
