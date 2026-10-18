# Paki Akin – „Bist du ein Overthinker?“

| Datei | Inhalt |
|---|---|
| `Paki_Akin_Overthinking_1080x1920.mp4` | **Finaler Edit**: 9:16, 1080 × 1920, 30 fps, H.264 High, AAC 192 kbit/s, 79,7 s |
| `Paki_Akin_Overthinking_ohne_Musik_1080x1920.mp4` | Identisches Bild ohne Musik |
| `Paki_Akin_Overthinking_Untertitel.srt` | Untertitel als separate Datei |
| `projekt/video_overthinking.py` | Alle Schnitt- und Gestaltungsentscheidungen dieses Videos |
| `projekt/engine.py`, `projekt/music.py` | Schnitt-Engine und Musik-Synthese (neu: Herzschlag-Puls im Bild, Methoden-Chips) |
| `projekt/face_track.py`, `projekt/face_track.json` | Gemessene Gesichtsposition, damit die Zooms dem Gesicht folgen |
| `projekt/source/original_overthinking.mov` | Originalvideo, unverändert |

Neu rendern: `cd projekt && python3 video_overthinking.py` (Optionen `--preview 45.1` und `--subs-only`).

## Wichtig: Das Original bricht mitten im Satz ab

Die Aufnahme endet bei *„…mach etwas, was dich wieder ins Gefühl“*, das letzte Wort („bringt“) fehlt. Ein Video, das mitten im Satz aufhört, wirkt wie ein Fehler. Deshalb endet der Edit sauber nach der vollständigen Aufzählung *„Arbeite mit deinen Händen, geh in die Natur, mach Sport, mach Yoga.“* Wenn du den Satz noch komplett hast, lässt sich das Ende in einer Zeile verlängern (`KEEP` in `video_overthinking.py`).

## Trailer (0–6,3 s)

Drei Fragmente aus dem Video erzählen in Kurzform den Bogen Gefühl → Versprechen → Methode, ohne die Lösung zu verraten:

| Zeit | Fragment | Bild & Ton |
|---|---|---|
| 0,0 s | „…und einfach nur dein **Herz** gespürt?“ | Sie hat die Hand auf der Brust. Auf „Herz“ gibt es einen Herzschlag: Das Bild pulsiert zweimal mit („ba-bum“), dazu ein warmes Glühen auf Brusthöhe |
| 1,6 s | „Hören deine Gedanken sofort **auf**.“ | harter Schnitt mit Mikro-Blitz und weichem Schlag |
| 3,9 s | „Was ist jetzt mein nächster **Gedanke?**“ | Mikro-Blitz und Schlag. Danach wird das Bild dunkler, es wird still, zweiter Herzschlag, ein Rauschanstieg läuft zu |
| 6,3 s | Lichtblitz → „Bist du ein **Overthinker?** Dann ist dieses Video für dich.“ | Schlag, warmes Licht, die Musik setzt im Takt ein |

## Hauptteil

| Moment | Umsetzung |
|---|---|
| „…Sorgen um deine **Zukunft** … deine **Vergangenheit** … ob das **richtig war** … ob **XY-Szenario** eintreffen wird“ | Die Gedanken erscheinen als halbtransparente Wörter, die um ihren Kopf schweben, jeweils genau beim Aussprechen. Bei „Aber dein Overthinking…“ lösen sie sich unscharf auf. Es sind nur Wörter, die sie selbst sagt |
| „Dein Overthinking sagt dir,“ | enge Einstellung, Spannung |
| „…nicht in deinem **Körper** … nicht in deinem **Gefühl** … kaum mehr **spürst**“ | drei Stufen im Bildausschnitt (104 % → 112 % → 120 %), Schlüsselwörter in Gold |
| „Wann hast du das letzte Mal deine Hand auf deine Brust gelegt und einfach nur dein **Herz** gespürt?“ | Das Bild fährt langsam heran (sie hat die Hand auf der Brust). Bei „Herz“ folgen Herzschlag-Sound, Bildpuls und warmes Glühen, danach 0,7 s Raum |
| „…dann wird es jetzt Zeit dafür, dass du **weniger denkst** und mehr in deinen **Körper** kommst.“ | Wendepunkt: langsames Heranfahren, Licht, Akzent, die Musik wechselt von h-Moll in ein offenes D-Dur |
| Methode 1: „…deine Gedanken zu **beobachten**.“ | Chip oben: **„1 · Gedanken beobachten“** |
| „…**hören deine Gedanken sofort auf.**“ | Headline, Licht von oben, Akzent |
| Methode 2: „Zweite Methode ist, du fragst dich:“ | Chip **„2 · Was ist jetzt mein nächster Gedanke?“** und die Frage als Headline. In der kurzen Denkpause danach erscheinen drei Punkte · · · |
| Methode 3: „…Dinge zu tun, die dich in deinen Körper bringen.“ | Chip **„3 · In den Körper kommen“** |
| „Arbeite mit deinen **Händen**, geh in die **Natur**, mach **Sport**, mach **Yoga**.“ | Die vier Stichworte laufen in einer Reihe ein, jeweils mit leisem Tap. Leiser Glockenton zum Schluss |

**Schnitt:** 16 Pausen gekürzt. Bewusst stehen geblieben sind die Betonungen („Dass du … kaum mehr spürst“), der Raum nach „Herz gespürt?“ und die Denkpause nach „nächster Gedanke?“. Versprecher gab es keine.

## Ton & Musik

- **Stimme:** Hochpass 80 Hz, De-Esser, sanfte Kompression, Lautheit auf −14 LUFS normalisiert, 12-ms-Blenden an jedem Schnitt.
- **Musik:** eigene Komposition, synthetisiert und rechtefrei.
  - Trailer: dunkle Klangfläche mit Rauschanstieg in den Lichtblitz.
  - Danach h-Moll – G – D – A.
  - Ab „dann wird es jetzt Zeit dafür“ D – A – h-Moll – G mit Klavier-Arpeggien.
  - Unter der Stimme wird sie automatisch abgesenkt.
- **Sounddesign:** 3× Herzschlag, 3× weicher Schlag (Trailer-Schnitte und Lichtblitz), 2× Akzent (Wendepunkt, „sofort auf.“), 7× leiser Tap (Chips und Stichworte), 1× Glockenton.

## Bitte kurz prüfen

1. **Ende:** Das Video endet nach „mach Yoga.“, siehe oben.
2. **Die Methoden-Chips** fassen ihre eigenen Worte kurz zusammen („Gedanken beobachten“, „Was ist jetzt mein nächster Gedanke?“, „In den Körper kommen“). Falls du andere Formulierungen möchtest, stehen sie in `METHODS`.
3. **Musik:** Ich habe sie über Messwerte geprüft, konnte sie aber nicht anhören. Die Version ohne Musik liegt bei.

## Transkript

> *(Trailer)* …und einfach nur dein Herz gespürt? – Hören deine Gedanken sofort auf. – Was ist jetzt mein nächster Gedanke?
>
> Bist du ein Overthinker? Dann ist dieses Video für dich. Ja, ich weiß, du machst dir Sorgen um deine Zukunft, du denkst über deine Vergangenheit nach, ob das richtig war, du denkst darüber nach, ob XY-Szenario eintreffen wird. Aber dein Overthinking sagt dir in Wirklichkeit was anderes als deine Zukunft oder deine Vergangenheit. Dein Overthinking sagt dir, dass du nicht in deinem Körper bist. Dass du nicht in deinem Gefühl bist. Dass du kaum mehr spürst. Mal ganz ehrlich, wann hast du das letzte Mal in dich hineingehorcht? Wann hast du das letzte Mal deine Hand auf deine Brust gelegt und einfach nur dein Herz gespürt? Wenn du sagst, es ist schon lange her, dann wird es jetzt Zeit dafür, dass du weniger denkst und mehr in deinen Körper kommst. Und wenn du sagst: „Ich weiß aber gar nicht, wie das geht, wo soll ich denn da anfangen? Ich denke automatisch.“ Dann fängst du jetzt mal an, deine Gedanken zu beobachten. Mit jeder Beobachtung deiner Gedanken hören deine Gedanken sofort auf. Zweite Methode ist, du fragst dich: Was ist jetzt mein nächster Gedanke? Und dann empfehle ich dir, Dinge zu tun, die dich in deinen Körper bringen. Arbeite mit deinen Händen, geh in die Natur, mach Sport, mach Yoga.
