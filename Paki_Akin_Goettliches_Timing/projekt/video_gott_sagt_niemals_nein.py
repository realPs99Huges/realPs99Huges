#!/usr/bin/env python3
"""Video 1: "Gott sagt niemals nein."  –  python3 video_gott_sagt_niemals_nein.py [--preview t …]

Alle Zeiten = Quellzeiten (Sekunden im Original).
"""
import os

import engine
from engine import GOLD, WHITE, keep_ranges

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "1_Gott_sagt_niemals_nein")
os.makedirs(OUT, exist_ok=True)

SLUG = "gott_sagt_niemals_nein"
TITLE = "Paki Akin – Gott sagt niemals nein"
SRC = os.path.join(HERE, "source", "original_gott_sagt_niemals_nein.mp4")
OUT_MAIN = os.path.join(OUT, "Paki_Akin_Gott_sagt_niemals_nein_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT, "Paki_Akin_Gott_sagt_niemals_nein_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT, "Paki_Akin_Gott_sagt_niemals_nein_Untertitel.srt")
ASS = os.path.join(HERE, "untertitel_gott_sagt_niemals_nein.ass")

ANCHOR = (390.0, 470.0)       # Gesicht in der Quelle
SUB_Y = 1330
GRADIENT = (1060, 0.34)

# ---------------------------------------------------------------------------
# SCHNITT: kein Cold Open – der erste Satz ist bereits der stärkste Hook.
# ---------------------------------------------------------------------------
TEASER = None
KEEP = keep_ranges(
    0.40, 64.30,
    trims=[            # (Pause von, bis, verbleibende Pause)
        (4.28, 4.84, 0.30),     # "nicht jetzt, | oder"
        (7.56, 8.58, 0.38),     # "auf dich zu. | Versteh"
        (11.46, 12.58, 0.32),   # "glauben wir, | es hätte"
        (21.38, 21.90, 0.38),   # "Was ist aber, | wenn es"
        (30.66, 31.32, 0.36),   # "bestimmt ist? | Du hast"
        (43.60, 44.18, 0.30),   # "bestimmen, | was in"
        (58.24, 58.88, 0.40),   # "Timing hat. | Und dass"
        (61.46, 61.98, 0.40),   # "kommt, | wenn der"
    ],
    remove=[(36.20, 38.30)],    # Selbstkorrektur "Und dieser Plan," -> "Diesen Plan bestimmt er."
)

# (Segment, von, bis, Zoom Start, Zoom Ende, Kurve)
SHOTS = [
    ("M", 0.40, 2.36, 1.00, 1.05, "lin"),     # Titel – weit, Licht von oben
    ("M", 2.36, 4.60, 1.18, 1.19, "lin"),     # "Gott sagt nur nicht jetzt,"
    ("M", 4.60, 8.00, 1.06, 1.10, "lin"),
    ("M", 8.00, 11.80, 1.22, 1.23, "lin"),    # "Versteh mich nicht falsch,"
    ("M", 11.80, 15.80, 1.04, 1.08, "lin"),
    ("M", 15.80, 20.30, 1.25, 1.28, "lin"),   # "warum … meine Manifestation?" – eng
    ("M", 20.30, 23.70, 1.00, 1.04, "lin"),   # "göttliches Timing" – weit
    ("M", 23.70, 31.00, 1.14, 1.18, "lin"),
    ("M", 31.00, 34.10, 1.24, 1.25, "lin"),   # "… eine Bestimmung."
    ("M", 34.10, 36.25, 1.00, 1.10, "ease"),  # "Gott hat einen Plan für dich." – Heranfahren
    ("M", 38.25, 40.40, 1.12, 1.13, "lin"),
    ("M", 40.40, 45.90, 1.26, 1.30, "lin"),   # "Wer sind wir, …" – ganz eng
    ("M", 45.90, 50.10, 1.06, 1.08, "lin"),
    ("M", 50.10, 56.20, 1.14, 1.20, "lin"),   # "… lernen zu vertrauen" – langsamer Push
    ("M", 56.20, 58.60, 1.24, 1.25, "lin"),
    ("M", 58.60, 64.31, 1.00, 1.04, "lin"),   # Zeitleiste – weit
]

# (Quellzeit, Text, {Schlüsselwort: Quellzeit}[, {"y": …}])
CARDS = [
    (2.36, "Gott sagt nur nicht jetzt,", {"nicht jetzt": 3.78}),
    (4.70, "oder es kommt", {}),
    (5.88, "etwas Besseres", {"Besseres": 6.26}),
    (6.92, "auf dich zu.", {}),
    (8.36, "Versteh mich nicht falsch,", {}),
    (9.62, "aber oftmals glauben wir,", {}),
    (12.30, "es hätte besser", {}),
    (13.24, "kommen sollen,", {}),
    (13.88, "da hätte etwas Besseres", {}),
    (15.16, "sein sollen,", {}),
    (15.86, "warum passiert", {}),
    (16.58, "das mir nicht,", {}),
    (17.40, "warum kommt nicht endlich", {}),
    (18.84, "meine Manifestation?", {"Manifestation": 19.26}),
    (20.50, "Was ist aber,", {}),
    # 21.62–23.8: Headline "wenn es ein göttliches Timing gibt?"
    (23.86, "Und was ist aber,", {}),
    (24.76, "wenn diese eine Sache,", {}),
    (26.10, "ja, die du dir", {}),
    (26.84, "ja ach so sehr wünschst,", {}),
    (29.06, "gar nicht für dich", {}),
    (29.94, "bestimmt ist?", {}),
    (31.06, "Du hast einen Plan,", {}),
    (32.26, "beziehungsweise", {}),
    (32.90, "du hast eine Bestimmung.", {"Bestimmung": 33.54}),
    # 34.2–36.2: Headline "Gott hat einen Plan für dich."
    (38.30, "Diesen Plan bestimmt er.", {}),
    (40.58, "Wer sind wir,", {}),
    (42.36, "dass wir bestimmen,", {}),
    (44.10, "was in unserem Leben", {}),
    (45.22, "passieren soll?", {}),
    (45.96, "Versteh mich nicht falsch.", {}),
    (47.08, "Wir haben eine", {}),
    (47.56, "Ausrichtung, ja,", {}),
    (48.36, "und wir sollten uns", {}),
    (49.08, "auch fokussieren.", {}),
    (50.20, "Aber wir dürfen", {}),
    (50.92, "auch wieder", {}),
    (51.32, "in das Göttliche", {}),
    (52.20, "lernen zu vertrauen,", {"vertrauen": 52.90}),
    (53.62, "auf unseren Weg", {}),
    (54.76, "lernen zu vertrauen,", {}),
    (56.36, "dass alles ein", {}),
    (57.22, "göttliches Timing hat.", {"göttliches Timing": 57.30}),
    (58.76, "Und dass alles", {}),
    (59.88, "genau dann kommt,", {}),
    (61.90, "wenn der richtige", {}),
    (62.98, "Zeitpunkt ist.", {"Zeitpunkt": 63.06}),
]
BREAKS = {21.62, 34.20}

TOP = dict(cx=540, cy=-220, rx=650, ry=950)        # Licht "von oben"
LIGHTS = [
    dict(ref=("out", 0.0), peak=0.40, rise=0.05, fall=1.0, **TOP),
    dict(ref=("src", 22.96), peak=0.24, rise=0.45, fall=1.4, **TOP),   # "göttliches Timing"
    dict(ref=("src", 34.32), peak=0.20, rise=0.35, fall=1.6, **TOP),   # "Gott hat einen Plan"
    dict(ref=("src", 63.06), peak=0.18, rise=0.30, fall=1.2, **TOP),   # "richtige Zeitpunkt"
]
SFX = [
    ("impact", ("out", 0.0), -21.0),       # erster Frame, Titel
    ("impact", ("src", 22.96), -24.0),     # "Timing"
    ("impact", ("src", 34.32), -20.0),     # "Gott hat einen Plan" – Musik öffnet sich
    ("bell", ("src", 63.08), -25.0),       # Punkt erreicht den Zeitpunkt
]
MUSIC = {"first_beat": ("src", 2.40), "open": ("src", 34.30), "level_db": -12.5,
         "score": {"intro": "Bm", "prog_b": ["Bm", "G", "D", "A"], "prog_c": ["D", "A", "Bm", "G"], "final": "D"}}


def circle(r):
    k = 0.5523 * r
    return (f"m 0 {-r} b {k:.1f} {-r} {r} {-k:.1f} {r} 0 b {r} {k:.1f} {k:.1f} {r} 0 {r} "
            f"b {-k:.1f} {r} {-r} {k:.1f} {-r} 0 b {-r} {-k:.1f} {-k:.1f} {-r} 0 {-r}")


def specials(p):
    # Titel: "Gott sagt niemals nein."
    p.headline(0.0, p.to_out(2.30), [
        ([("Gott", 0.48), ("sagt", 0.82)], 1262, "Head"),
        ([("niemals", 1.22, GOLD), ("nein.", 1.78)], 1396, "Head"),
    ], srt="Gott sagt niemals nein.")

    # "wenn es ein göttliches Timing gibt?"
    p.headline(p.to_out(21.62), p.to_out(p.snap(23.86)), [
        ([("wenn", 21.70), ("es", 21.92), ("ein", 22.16)], 1214, "Small"),
        ([("göttliches", 22.42), ("Timing", 22.98, GOLD)], 1326, "Head"),
        ([("gibt?", 23.46)], 1436, "Small"),
    ], srt="wenn es ein göttliches Timing gibt?")

    # Wendepunkt: "Gott hat einen Plan für dich."
    p.headline(p.to_out(34.20), p.to_out(36.20), [
        ([("Gott", 34.34), ("hat", 34.74), ("einen", 35.06)], 1262, "Head"),
        ([("Plan", 35.30, GOLD), ("für", 35.70), ("dich.", 35.94)], 1396, "Head"),
    ], settle=1500, dur=300, srt="Gott hat einen Plan für dich.")

    # Zeitleiste: Linie zeichnet sich, ein Punkt wandert und kommt bei "Zeitpunkt" an
    Y, X0, X1, XT = 1212, 290, 790, 700
    g0, g1 = p.to_out(58.70), p.total
    ms = lambda t: round((t - g0) * 1000)
    t_line = p.to_out(58.80)
    reveal = "\\fad(0,300)\\clip(%d,%d,%d,%d)\\t(%d,%d,0.6,\\clip(%d,%d,%d,%d))" % (
        X0 - 12, Y - 14, X0 - 12, Y + 14, ms(t_line), ms(t_line) + 700, X0 - 12, Y - 14, X1 + 12, Y + 14)
    p.shape(g0, g1, 540, Y, "m 0 0 l %d 0 l %d 4 l 0 4" % (X1 - X0, X1 - X0), filled=True, extra=reveal, layer=3)
    # Zielmarke erscheint bei "richtige"
    p.shape(p.to_out(62.56), g1, XT, Y + 2, circle(16), width=3, color=GOLD, extra="\\fad(220,300)", layer=5)
    # wandernder Punkt
    d0, d1 = p.to_out(59.92), p.to_out(63.06)
    p.shape(t_line + 0.3, d0, X0, Y + 2, circle(11), filled=True, extra="\\fad(200,0)", layer=7)
    p.frames(d0, d1, "Shape", lambda u: p.shape_text(round(X0 + (XT - X0) * engine.ease(u)), Y + 2, circle(11),
                                                      filled=True, layer=7))
    p.shape(d1, g1, XT, Y + 2, circle(11), filled=True, extra="\\fad(0,300)",
            extra_main="\\t(0,160,\\1c%s)" % GOLD, layer=7)
    # Puls beim Ankommen
    p.shape(d1, d1 + 0.9, XT, Y + 2, circle(16), width=2.5, color=GOLD,
            extra="\\t(0,900,0.5,\\fscx260\\fscy260\\alpha&HFF&)", layer=5)


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
