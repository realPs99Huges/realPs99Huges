#!/usr/bin/env python3
"""Video: "Warum sabotieren sich Menschen selbst?"  –  python3 video_selbstsabotage.py [--preview t …]

Alle Zeiten = Quellzeiten (Sekunden im Original). Montage-Fragmente tragen seg="T".
"""
import os

import engine
from engine import GOLD, WHITE, keep_ranges

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)

SLUG = "selbstsabotage"
TITLE = "Paki Akin – Warum sabotieren sich Menschen selbst?"
SRC = os.path.join(HERE, "source", "original_selbstsabotage.mp4")
OUT_MAIN = os.path.join(OUT, "Paki_Akin_Selbstsabotage_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT, "Paki_Akin_Selbstsabotage_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT, "Paki_Akin_Selbstsabotage_Untertitel.srt")
ASS = os.path.join(HERE, "untertitel_selbstsabotage.ass")

ANCHOR = (390.0, 470.0)
FACE_TRACK = os.path.join(HERE, "face_track.json")   # Zoom folgt dem Gesicht (sie lehnt sich oft vor/zurück)
SUB_Y = 1330
GRADIENT = (1060, 0.34)

# ---------------------------------------------------------------------------
# HOOK-MONTAGE: drei kurze Fragmente aus dem Video, schnell geschnitten,
# dann Abdunkeln + Stille -> Lichtblitz -> die Frage.
# ---------------------------------------------------------------------------
TEASER = [
    (23.50, 25.23),    # "Deinem Nervensystem ist es scheißegal" (endet vor dem Ansatz von "ob")
    (47.93, 49.30),    # "Verlass diesen Mann,"
    (63.33, 65.50),    # "ist ein verlorener Tag."  (+ Stille für die Abdunklung)
]
DIP = (0.55, 0.72)     # letzte 0,55 s vor dem Haupteinstieg auf 28 % abdunkeln

KEEP = keep_ranges(
    0.45, 65.20,
    trims=[
        (4.40, 4.92, 0.30),     # "warum. | Damit"
        (11.82, 12.22, 0.26),   # "selbst | aus Unbewusstheit"
        (13.62, 14.16, 0.30),   # "Unbewusstheit, | aus einer"
        (16.42, 16.82, 0.28),   # "heraus, | damit"
        (19.28, 19.88, 0.34),   # "kommen. | Denn"
        (26.14, 26.64, 0.30),   # "glücklich bist, | zufrieden"
        (32.36, 32.84, 0.30),   # "das. | Und wer"
        (35.24, 35.66, 0.30),   # "sicher ist? | Wer weiß"
        (38.88, 39.28, 0.30),   # "erlebt hast. | Aber"
        (43.60, 44.10, 0.30),   # "sabotieren. | Triff"
        (53.36, 53.78, 0.34),   # "sabotieren. | Denn jeder Tag"
        (59.74, 60.20, 0.30),   # "an dem du | Dinge"
        (61.24, 61.82, 0.34),   # "tust, | die du nicht willst"
        (62.98, 63.42, 0.40),   # "willst, | ist ein verlorener Tag." – Spannungspause bleibt
    ],
)

SHOTS = [
    # Montage – eng, jedes Fragment mit eigenem Push
    ("T", 23.50, 25.30, 1.26, 1.33, "lin"),
    ("T", 47.90, 49.32, 1.10, 1.16, "lin"),
    ("T", 63.30, 65.52, 1.22, 1.30, "lin"),
    # 0–8 s: sie ist nah an der Kamera -> kleine Zooms
    ("M", 0.45, 3.20, 1.00, 1.03, "lin"),     # Titel
    ("M", 3.20, 4.70, 1.08, 1.08, "lin"),     # "Ich sag's dir, warum."
    ("M", 4.70, 7.90, 1.00, 1.04, "lin"),
    # 8–40 s: weiter weg -> mehr Spielraum
    ("M", 7.90, 9.40, 1.22, 1.22, "lin"),     # "Ja, du hast richtig gehört."
    ("M", 9.40, 13.90, 1.05, 1.10, "lin"),
    ("M", 13.90, 19.60, 1.14, 1.18, "lin"),
    ("M", 19.60, 23.45, 1.00, 1.04, "lin"),
    ("M", 23.45, 28.70, 1.00, 1.03, "lin"),   # glücklich / zufrieden / erfolgreich – weit
    ("M", 28.70, 32.50, 1.18, 1.20, "lin"),   # "Okay, ist das sicher?"
    ("M", 32.50, 35.45, 1.06, 1.08, "lin"),
    ("M", 35.45, 39.10, 1.12, 1.16, "lin"),
    ("M", 39.10, 41.10, 1.24, 1.25, "lin"),   # "Aber soll ich dir mal was sagen?"
    # 41–57 s: wieder nah
    ("M", 41.10, 43.85, 1.00, 1.06, "ease"),  # "Hör auf, dich selbst zu sabotieren." – Wendepunkt
    ("M", 43.85, 45.70, 1.03, 1.03, "lin"),   # drei Aufforderungen – drei Stufen
    ("M", 45.70, 47.70, 1.07, 1.07, "lin"),
    ("M", 47.70, 50.70, 1.11, 1.11, "lin"),
    ("M", 50.70, 53.55, 1.00, 1.03, "lin"),
    ("M", 53.55, 57.00, 1.03, 1.07, "lin"),
    # 57–65 s: wieder weiter weg, Steigerung zum Schluss
    ("M", 57.00, 59.95, 1.10, 1.13, "lin"),
    ("M", 59.95, 63.15, 1.16, 1.20, "lin"),
    ("M", 63.15, 65.21, 1.00, 1.06, "ease"),  # "ist ein verlorener Tag."
]

CARDS = [
    (3.30, "Ich sag's dir, warum.", {}),
    (4.76, "Damit sie sich", {}),
    (5.56, "anschließend wieder", {}),
    (6.52, "motivieren können.", {"motivieren": 6.58}),
    (7.96, "Ja, du hast", {}),
    (8.60, "richtig gehört.", {}),
    (9.56, "Menschen sabotieren", {}),
    (11.00, "sich selbst", {}),
    (12.04, "aus Unbewusstheit,", {"Unbewusstheit": 12.60}),
    (13.96, "aus einer Schutzstrategie", {"Schutzstrategie": 14.66}),
    (15.80, "heraus,", {}),
    (16.68, "damit sie nicht", {}),
    (17.72, "in ihre wahre Größe kommen.", {"wahre Größe": 18.24}),
    (19.80, "Denn dein Nervensystem", {}),
    (21.48, "will immer nur das,", {}),
    (22.36, "was vertraut ist.", {"vertraut": 22.66}),
    (23.48, "Deinem Nervensystem", {}),
    (24.44, "ist es scheißegal,", {}),
    (25.24, "ob du glücklich bist,", {}),
    (26.52, "zufrieden bist", {}),
    (27.48, "oder erfolgreich bist.", {}),
    (28.76, "Dein Nervensystem", {}),
    (29.72, "sagt nur:", {}),
    # 30.28–31.46: Headline "Okay, ist das sicher?"
    (31.48, "Dann will ich das.", {}),
    (32.60, "Und wer weiß schon,", {}),
    (33.72, "was für deinen Körper", {}),
    (34.76, "sicher ist?", {}),
    (35.56, "Wer weiß schon,", {}),
    (36.52, "was du alles", {}),
    (37.32, "in deinem Leben", {}),
    (38.20, "erlebt hast?", {}),
    (39.24, "Aber soll ich dir", {}),
    (40.20, "mal was sagen?", {}),
    # 41.10–43.8: Headline "Hör auf, dich selbst zu sabotieren."
    (43.96, "Triff diese Entscheidung,", {"Entscheidung": 44.90}),
    (45.80, "geh aus diesem", {}),
    (46.76, "Umfeld heraus.", {"Umfeld": 46.82}),
    (47.96, "Verlass diesen Mann,", {"Verlass": 48.04}),
    (49.32, "wenn er dir nicht guttut.", {}),
    (50.84, "Hör auf, dich selbst", {}),
    (52.36, "zu sabotieren.", {"sabotieren": 52.58}),
    (53.72, "Denn jeder Tag,", {}),
    (55.00, "an dem du dich", {}),
    (55.80, "selbst sabotierst,", {}),
    (56.92, "an dem du dich", {}),
    (57.64, "klein hältst,", {}),
    (58.92, "an dem du", {}),
    (60.04, "Dinge tust,", {}),
    (61.64, "die du nicht willst,", {}),
    # ab 63.20: Schluss-Headline "ist ein verlorener Tag."
]
BREAKS = {30.28, 41.10, 63.20}

LAMP = dict(cx=-260, cy=760, rx=620, ry=900, drift=260)
LIGHTS = [
    dict(ref=("cut",), peak=0.30, rise=0.05, fall=1.0, **LAMP),       # nach dem Blitz: Titel
    dict(ref=("src", 41.22), peak=0.22, rise=0.40, fall=1.4, **LAMP),  # "Hör auf …"
    dict(ref=("src", 64.80), peak=0.20, rise=0.40, fall=1.2, **LAMP),  # "… verlorener Tag."
]
SFX = [
    ("heartbeat", ("out", 0.02), -19.0),        # Herzschlag auf dem ersten Frame
    ("hit", ("teaser", 1), -23.0),              # Montage-Schnitt 1
    ("hit", ("teaser", 2), -23.0),              # Montage-Schnitt 2
    ("heartbeat", ("teaser", 2, 1.62), -19.0),  # Herzschlag in der Stille vor dem Einstieg
    ("hit", ("cut",), -19.0),                   # Lichtblitz -> Frage
    ("click", ("src", 25.56), -29.0),           # glücklich
    ("click", ("src", 26.60), -29.0),           # zufrieden
    ("click", ("src", 27.80), -29.0),           # erfolgreich
    ("impact", ("src", 31.06), -24.0),          # "sicher?"
    ("impact", ("src", 41.22), -20.0),          # "Hör auf" – Musik öffnet sich
    ("impact", ("src", 64.82), -21.0),          # "Tag."
]
MUSIC = {"first_beat": ("cut",), "open": ("src", 41.20), "level_db": -12.5,
         "score": {"intro": "Cm", "prog_b": ["Cm", "Ab", "Eb", "Bb"], "prog_c": ["Eb", "Bb", "Cm", "Ab"], "final": "Cm"}}

# Was wir wollen vs. was das Nervensystem will: (Wort, Quellzeit, x)
WANTS = [("glücklich", 25.54, 290), ("zufrieden", 26.58, 540), ("erfolgreich", 27.78, 790)]


def slam(p, t0, t1, lines, seg="T"):
    """Montage-Typografie: Wörter schnappen schnell und scharf ins Bild (kleiner Scale-Impuls)."""
    for words, y, style in lines:
        p.ev(t0, t1, style, "{\\an5\\q2\\pos(540,%d)\\fscx108\\fscy108\\t(0,180,0.5,\\fscx100\\fscy100)\\fad(0,60)}" % y
             + p.focus_words(words, t0, seg, dur=110, blur=5), 2)


def specials(p):
    # --- Hook-Montage ----------------------------------------------------
    j1, j2 = p.resolve(("teaser", 1)), p.resolve(("teaser", 2))
    slam(p, 0.0, j1, [([("Deinem", 23.62), ("Nervensystem", 23.88), ("ist", 24.48), ("es", 24.58)], 1226, "Small"),
                      ([("scheißegal.", 24.76, GOLD)], 1338, "Head")])
    slam(p, j1, j2, [([("Verlass", 48.04), ("diesen", 48.66), ("Mann.", 48.98, GOLD)], 1300, "Head")])
    slam(p, j2, p.t_cut - 0.25, [([("ist", 63.42), ("ein", 63.62)], 1226, "Small"),
                                 ([("verlorener", 63.88), ("Tag.", 64.82, GOLD)], 1338, "Head")])
    p.srt += [(0.02, j1, "Deinem Nervensystem ist es scheißegal."), (j1, j2, "Verlass diesen Mann."),
              (j2, p.t_cut - 0.25, "… ist ein verlorener Tag.")]

    # --- Titel nach dem Blitz ----------------------------------------------
    p.headline(p.t_cut, p.to_out(3.20), [
        ([("Warum", 0.56), ("sabotieren", 0.86, GOLD)], 1226, "Head"),
        ([("sich", 1.70), ("eigentlich", 1.86), ("Menschen", 2.34), ("selbst?", 2.74)], 1340, "Small"),
    ], dur=220, settle=600, srt="Warum sabotieren sich eigentlich Menschen selbst?")

    # --- glücklich · zufrieden · erfolgreich  ->  "sicher?" -------------------
    g1 = p.to_out(32.34)
    t_sicher = p.to_out(31.04)
    for word, wt, x in WANTS:
        t0 = p.to_out(wt) - 0.05
        dim = round((t_sicher - t0) * 1000)
        p.ev(t0, g1, "Label", "{\\an5\\pos(%d,1150)\\fscx70\\fscy70\\t(0,160,\\fscx100\\fscy100)\\fad(0,200)"
             "\\t(%d,%d,\\alpha&HB0&\\blur3)}" % (x, dim, dim + 350) + p.focus_words([(word, wt)], t0, dur=160, blur=6), 3)
    p.headline(p.to_out(30.28), p.to_out(31.46), [
        ([("Okay,", 30.34), ("ist", 30.66), ("das", 30.82)], 1236, "Small"),
        ([("sicher?", 31.06, GOLD)], 1348, "Head"),
    ], dur=200, settle=500, srt="Okay, ist das sicher?")

    # --- Wendepunkt -----------------------------------------------------------
    p.headline(p.to_out(41.10), p.to_out(43.80), [
        ([("Hör", 41.24), ("auf,", 41.64), ("dich", 41.96), ("selbst", 42.28)], 1262, "Head"),
        ([("zu", 42.68), ("sabotieren.", 42.84, GOLD)], 1396, "Head"),
    ], settle=1500, dur=260, srt="Hör auf, dich selbst zu sabotieren.")

    # --- Schluss --------------------------------------------------------------
    p.headline(p.to_out(63.20), p.total, [
        ([("ist", 63.42), ("ein", 63.62)], 1236, "Small"),
        ([("verlorener", 63.88), ("Tag.", 64.82, GOLD)], 1348, "Head"),
    ], settle=1400, dur=300, fade_out=300, srt="ist ein verlorener Tag.")


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
