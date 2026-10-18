# Paki Akin – TikTok-Edit

| Datei | Inhalt |
|---|---|
| `Paki_Akin_TikTok_Edit_1080x1920.mp4` | Finaler Export: 1080 × 1920 (9:16), 30 fps, H.264 High (CRF 17), AAC 192 kbit/s, 48 kHz, 31,9 s, 37 MB |
| `Paki_Akin_Untertitel.srt` | Untertitel als separate Datei (31 Einblendungen, gleiche Timeline wie der Export) |
| `projekt/edit.py` | Komplettes Schnittprojekt: Schnitte, Bildausschnitte, Untertitel, Sounds, Grading, Export |
| `projekt/untertitel_animiert.ass` | Gestaltete und animierte Untertitel (libass/Aegisub-kompatibel) |
| `projekt/source/original_paki_akin.mp4` | Originaldatei, unverändert (SHA-256 `8e11ae88…3874fb`) |
| `projekt/fonts/` | Verwendete Schriften: Inter (SemiBold/Medium) und Instrument Serif (beide SIL Open Font License) |

Neu rendern: `cd projekt && python3 edit.py`. Braucht ffmpeg mit libass und libx264 sowie Python mit numpy und opencv-python-headless. Ein Render dauert etwa 2,5 Minuten.

## Schnitt: 54,9 s → 31,9 s

Das Original ist ein Ausschnitt aus einem Live. Die eigentliche Aussage endet bei „Manche brauchen aber eine Schelle.“ – danach folgen nur noch Begrüßungen. Entfernt wurden:

| Original | Entfernt | Grund |
|---|---|---|
| 07,77–10,50 | „Ja, weil irgendeiner und so war Sitcha.“ | Abgebrochener Satz. Der Name kommt direkt danach noch einmal vollständig („Sitcha war genau so.“), der Sinn bleibt also erhalten |
| 24,67–25,23 | Pause | Von 0,9 s auf ca. 0,3 s gekürzt. Zwischen den beiden „Glaub mir“ bleibt eine kurze Spannungspause |
| 28,07–31,30 | 3,5 s Stille | Toter Moment nach „mundtot“. Eine Pause von ca. 0,5 s bleibt als Wirkungspause stehen |
| 35,93–36,73 | Ansprache „Duygu“ | Bezieht sich auf eine Zuschauerin im Live und ist ohne diesen Kontext unverständlich |
| ab 39,27 | „Dankeschön, Elisabeth … Miss Lady … Haare gewaschen … Produkte. I love it.“ | Live-Begrüßungen ohne Bezug zur Aussage. Der Clip endet jetzt auf der Pointe |

Sonst ist nichts umgestellt, und es wurde nichts hinzugefügt. Alle Aussagen stehen in der Originalreihenfolge.

## Bild

- **Format:** Die Quelle (640 × 1280, 1:2) füllt die volle Breite. Oben und unten fehlen jeweils knapp 6 %. Jedes Bild wird nur ein einziges Mal mit Lanczos skaliert, ohne künstliches Nachschärfen.
- **Punch-ins:** Sieben Einstellungen zwischen 100 % und 117 %. Der Ankerpunkt liegt auf dem Gesicht. Die Wechsel liegen auf Schnitten oder Satzgrenzen und kaschieren so die Jump-Cuts. Innerhalb einer Einstellung gibt es nur eine kaum sichtbare Drift von 2–3 %. Am engsten ist das Bild bei „ich mache dich mundtot“.
- **Farbe:** Der Orange-/Gelbstich des Raumlichts ist leicht reduziert, für natürlichere Hauttöne. Dazu +5 % Kontrast und −5 % Sättigung. Im unteren Drittel liegt ein sanfter Verlauf (max. 30 % dunkler) für bessere Lesbarkeit der Untertitel.
- **Bildrate:** Die Quelle ist variabel (ca. 25 Bilder/s auf einem 30-fps-Raster). Der Export mit 30 fps übernimmt das Original-Timing 1:1, ohne neu berechnete Zwischenbilder.

## Typografie & Untertitel

- **Untertitel:** Inter SemiBold, 62 px, weiß mit weichem Schatten. Sie sitzen bei 68 % der Bildhöhe, also oberhalb der TikTok-Beschreibung und links von der Button-Leiste. Pro Einblendung höchstens ca. 25 Zeichen. Sie blenden in 110 ms ein und bewegen sich dabei 10 px nach oben.
- **Schlüsselwörter:** *Schafe, Respekt, respektlos, mundtot, Nervensystem, Schelle* färben sich genau im Moment des Aussprechens in ein dezentes Champagner.
- **Headline:** Die Kernaussage „Kein Blatt vor den Mund zu nehmen.“ erscheint in Instrument Serif Italic. Jedes Wort wird synchron zum Sprechen scharf. Die Headline ersetzt an dieser Stelle die Untertitel, nichts wird doppelt angezeigt.
- **Sync-Prüfung:** Der fertige Export wurde erneut per Spracherkennung transkribiert. Alle 31 Einblendungen starten höchstens 0,1 s vor bzw. am gesprochenen Wort.

## Ton

- **Stimme:** Hochpass bei 70 Hz, sanfte Kompression (2,2:1) und zweistufige Lautheitsnormalisierung. Gemessen am Export: **−14,0 LUFS, True Peak −1,4 dBTP**. An jedem Schnitt liegt eine 12-ms-Blende, es gibt keine Klicks.
- **Soundeffekte:** Drei synthetisch erzeugte Effekte, also ohne Fremdsamples und ohne Rechtefragen. Ein weicher Whoosh beim Aufbau der Headline, ein tiefer, weicher Impact auf „mundtot“ und ein leiserer auf „Schelle“. Alle liegen mindestens 13 dB unter der Stimme.
- **Musik:** Bewusst keine. Eine Musik mit gesicherten Rechten konnte ich hier nicht beschaffen, und die Stimme trägt den Clip allein. Wer Musik möchte, legt sie am besten in der TikTok-App aus der lizenzierten Bibliothek darunter, mit ca. 5–10 % Lautstärke.

## Bitte vor dem Posten prüfen

1. **Name „Sitcha“:** Hier bin ich unsicher. Beide Spracherkennungen hören etwa „Sitscha/Sitcha“. Falls der Name anders geschrieben wird, die Zeile `"Sitcha war genau so."` in `projekt/edit.py` (Abschnitt `CARDS`) ändern und neu rendern. Die SRT-Datei wird dabei automatisch mit aktualisiert.
2. **„ich mache dich mundtot“:** Beide Modelle hören auf dem Export „mache“. Im Original-Durchlauf hatte ein Modell „mach“ gehört.
3. **Gespiegeltes Bild:** Das Original ist mit der Frontkamera aufgenommen und gespiegelt, deshalb steht die Schrift auf dem Bild an der Wand spiegelverkehrt. Das habe ich bewusst so gelassen, weil sich sonst die gewohnte Ansicht der Person umkehrt. Falls gewünscht, lässt sich das mit einer Zeile ändern.
4. **Auflösung:** Die Quelle hat nur 640 px Breite. Der Export hat volle 1080 × 1920, echte Zusatzschärfe lässt sich daraus aber nicht gewinnen.

## Transkript des Edits

> Klar sagen, was die ganzen denken. Und diese ganzen Schafe sind dann so: „Oh mein Gott, hast du gesehen, was sie gesagt hat? Eigentlich denke ich das auch.“ Sitcha war genau so. Sie hat sich das getraut, auszusprechen, was so viele Menschen sich nicht getraut haben. Und das habe ich von ihr gelernt: Kein Blatt vor den Mund zu nehmen. Natürlich immer mit Respekt. Aber kommst du mir respektlos? Glaub mir. Glaub mir, ich mache dich mundtot. Das ist auch nicht gut für das Nervensystem. Überhaupt nicht. Und ich achte auf mein Nervensystem. Manche brauchen aber eine Schelle.
