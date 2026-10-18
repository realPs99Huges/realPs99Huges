#!/usr/bin/env python3
"""Video 2: "Topf und Deckel" (Sehnsucht)  –  python3 video_topf_und_deckel.py [--preview t …]

Alle Zeiten = Quellzeiten (Sekunden im Original). Zeiten im Cold Open tragen seg="T".
"""
import os

import engine
from engine import GOLD, WHITE, keep_ranges

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "2_Topf_und_Deckel")
os.makedirs(OUT, exist_ok=True)

SLUG = "topf_und_deckel"
TITLE = "Paki Akin – Topf und Deckel"
SRC = os.path.join(HERE, "source", "original_topf_und_deckel.mp4")
OUT_MAIN = os.path.join(OUT, "Paki_Akin_Topf_und_Deckel_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT, "Paki_Akin_Topf_und_Deckel_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT, "Paki_Akin_Topf_und_Deckel_Untertitel.srt")
ASS = os.path.join(HERE, "untertitel_topf_und_deckel.ass")

ANCHOR = (390.0, 490.0)
SUB_Y = 1330
SUB_LOW = {"y": 1430}          # Untertitel während der Topf-Grafik etwas tiefer
GRADIENT = (1060, 0.36)

# ---------------------------------------------------------------------------
# SCHNITT
# ---------------------------------------------------------------------------
TEASER = (34.72, 37.90)        # Cold Open: "komischerweise hat doch jeder Topf einen Deckel."
KEEP = keep_ranges(
    0.0, 57.50,
    trims=[
        (1.58, 2.10, 0.34),     # "in dir. | Und weißt du was?"
        (2.86, 3.52, 0.40),     # "was? | Wenn du"
        (6.64, 7.20, 0.34),     # "dafür. | Denn"
        (11.80, 12.62, 0.34),   # "hineingelegt. | Solange"
        (20.46, 21.08, 0.34),   # "dafür. | Ja,"
        (37.72, 38.36, 0.34),   # "Deckel. | Also warum"
        (46.14, 46.66, 0.34),   # "Verwirklichung, | der Plan"
        (47.32, 47.78, 0.30),   # "der Plan, | der aufgehen"
        (52.04, 52.72, 0.45),   # "sondern | wenn Gott will" – bewusste Spannungspause bleibt
        (53.28, 53.84, 0.34),   # "will, | wenn das"
        (55.34, 56.48, 0.40),   # "Timing | da ist."
    ],
    remove=[(30.70, 33.10)],    # Wiederholung: erstes "es gibt einen … Topf." raus, das zweite (saubere) bleibt
)

SHOTS = [
    ("T", 34.72, 37.90, 1.18, 1.24, "lin"),   # Cold Open eng
    ("M", 0.00, 1.80, 1.00, 1.03, "lin"),     # Titel (sie ist hier ohnehin nah an der Kamera)
    ("M", 1.80, 3.30, 1.10, 1.11, "lin"),     # "Und weißt du was?"
    ("M", 3.30, 7.00, 1.00, 1.03, "lin"),
    ("M", 7.00, 12.30, 1.10, 1.14, "lin"),
    ("M", 12.30, 18.40, 1.04, 1.10, "lin"),
    ("M", 18.40, 20.80, 1.22, 1.23, "lin"),   # "gibt es auch einen Plan dafür."
    ("M", 20.80, 27.80, 1.06, 1.12, "lin"),
    ("M", 27.80, 29.55, 1.26, 1.27, "lin"),   # "Das ist doch sowas von klar." – eng
    ("M", 29.55, 30.71, 1.00, 1.01, "lin"),   # "Stell dir vor," – weit, Raum für die Grafik
    ("M", 33.09, 37.90, 1.00, 1.03, "lin"),
    ("M", 37.90, 42.80, 1.05, 1.07, "lin"),
    ("M", 42.80, 46.40, 1.00, 1.03, "lin"),
    ("M", 46.40, 49.20, 1.14, 1.15, "lin"),   # "der Plan, der aufgehen wird,"
    ("M", 49.20, 51.40, 1.22, 1.23, "lin"),   # "aber nicht dann, wenn du willst,"
    ("M", 51.40, 53.50, 1.04, 1.08, "lin"),   # "sondern wenn Gott will" – Licht von oben
    ("M", 53.50, 57.51, 1.00, 1.08, "ease"),  # "… das göttliche Timing da ist."
]

CARDS = [
    (1.96, "Und weißt du was?", {}),
    (3.40, "Wenn du diese Sehnsucht", {"Sehnsucht": 3.94}),
    (4.44, "in dir trägst,", {}),
    (5.30, "gibt es auch", {}),
    (5.88, "einen Plan dafür.", {"Plan": 6.10}),
    (7.14, "Denn diese Sehnsucht", {}),
    (8.66, "wurde nicht umsonst", {}),
    (10.18, "in dich hineingelegt.", {}),
    (12.44, "Solange du", {}),
    (13.30, "diese Sehnsucht", {}),
    (14.28, "in dir verspürst,", {}),
    (15.62, "immer wieder", {}),
    (16.36, "und sie immer", {}),
    (17.24, "stärker wird,", {"stärker": 17.30}),
    (18.56, "gibt es auch", {}),
    (19.40, "einen Plan dafür.", {}),
    (20.92, "Ja, solange du", {}),
    (22.36, "eine Sehnsucht hast,", {}),
    (23.86, "hat Gott auch", {}),
    (24.84, "den Plan gestiftet.", {}),
    (27.88, "Das ist doch", {}),
    (28.50, "sowas von klar.", {}),
    (29.72, "Stell dir vor,", {}),
    (33.10, "es gibt einen Topf.", {}, SUB_LOW),
    (34.30, "Und komischerweise", {}, SUB_LOW),
    (35.46, "hat doch jeder Topf", {}, SUB_LOW),
    (37.06, "einen Deckel.", {}, SUB_LOW),
    (38.30, "Also warum sollte", {}, SUB_LOW),
    (39.80, "deine Sehnsucht", {}, SUB_LOW),
    (40.98, "nicht auch", {}, SUB_LOW),
    (41.54, "einen Deckel haben?", {}, SUB_LOW),
    (42.92, "Und dieser Deckel", {}, SUB_LOW),
    (44.50, "ist die Verwirklichung,", {"Verwirklichung": 45.26}, SUB_LOW),
    (46.50, "der Plan,", {}),
    (47.62, "der aufgehen wird,", {}),
    (49.30, "aber nicht dann,", {}),
    (50.26, "wenn du willst,", {}),
    (51.52, "sondern wenn Gott will,", {"Gott will": 52.82}),
]
BREAKS = {53.62}

LAMP = dict(cx=-260, cy=760, rx=620, ry=900, drift=260)   # Lampenlicht von links
TOP = dict(cx=540, cy=-220, rx=650, ry=950)               # Licht "von oben"
LIGHTS = [
    dict(ref=("out", 0.0), peak=0.42, rise=0.05, fall=0.9, **LAMP),
    dict(ref=("src", 45.26), peak=0.18, rise=0.35, fall=1.2, **TOP),   # "Verwirklichung"
    dict(ref=("src", 52.82), peak=0.22, rise=0.40, fall=1.4, **TOP),   # "wenn Gott will"
    dict(ref=("src", 54.90), peak=0.20, rise=0.40, fall=1.6, **TOP),   # "göttliche Timing"
]
SFX = [
    ("impact", ("out", 0.0), -21.0),       # erster Frame
    ("hit", ("cut",), -20.0),              # Lichtblitz nach dem Cold Open
    ("rise", ("src", 37.52), -29.0),       # Deckel senkt sich …
    ("clink", ("src", 37.52), -25.0),      # … und setzt auf
    ("bell", ("src", 45.28), -27.0),       # Deckel wird gold: "Verwirklichung"
    ("impact", ("src", 56.48), -22.0),     # "… da ist."
]
MUSIC = {"first_beat": ("cut",), "open": ("src", 42.96), "level_db": -11.0,
         "score": {"intro": "Dm", "prog_b": ["Dm", "Bb", "F", "C"], "prog_c": ["F", "C", "Dm", "Bb"], "final": "F"}}

# Linienzeichnung Topf & Deckel (Koordinaten in Pixeln, \an5 zentriert die Form)
POT = "m 0 0 l 230 0 l 214 122 b 211 140 197 150 179 150 l 51 150 b 33 150 19 140 16 122 l 0 0"
HANDLE = "m 0 0 l 22 0 b 30 0 30 14 22 14 l 0 14"
LID = "m 0 40 b 30 4 230 4 260 40 l 0 40 m 120 12 l 140 12 l 140 2 l 120 2 l 120 12"
RIM_Y = 1150


def specials(p):
    # Cold Open
    p.headline(0.0, p.t_cut - 0.10, [
        ([("komischerweise", 34.80), ("hat", 35.52), ("doch", 35.76)], 1206, "Small"),
        ([("jeder", 36.08), ("Topf", 36.58)], 1304, "HeadRoman"),
        ([("einen", 37.14), ("Deckel.", 37.46, GOLD)], 1428, "Head"),
    ], seg="T", srt="komischerweise hat doch jeder Topf einen Deckel.")

    # Titel nach dem Lichtblitz
    p.headline(p.t_cut, p.to_out(1.75), [
        ([("Du", 0.14), ("hast", 0.26), ("eine", 0.56)], 1262, "Head"),
        ([("Sehnsucht", 0.74, GOLD), ("in", 1.36), ("dir.", 1.52)], 1396, "Head"),
    ], settle=600, dur=220, srt="Du hast eine Sehnsucht in dir.")

    # Topf & Deckel ------------------------------------------------------
    g0 = p.to_out(33.40)
    g1 = p.to_out(46.30)
    tp = p.to_out(33.58)                                   # "Topf"
    ms = lambda t, ref: round((t - ref) * 1000)
    # Topf zeichnet sich von unten nach oben
    reveal = "\\fad(0,260)\\clip(0,%d,%d,%d)\\t(%d,%d,0.6,\\clip(0,%d,%d,%d))" % (
        RIM_Y + 170, 1080, RIM_Y + 170, ms(tp, g0), ms(tp, g0) + 600, RIM_Y - 14, 1080, RIM_Y + 170)
    p.shape(g0, g1, 540, RIM_Y + 75, POT, extra=reveal, layer=3)
    for x, flip in ((540 - 128, "\\frz180"), (540 + 128, "")):
        p.shape(tp + 0.35, g1, x, RIM_Y + 22, HANDLE, extra=flip + "\\fad(250,260)", layer=3)
    # Deckel schwebt ein ("jeder Topf"), senkt sich und setzt bei "Deckel" auf
    lid_y = RIM_Y - 22                                       # Mittelpunkt der Form im gelandeten Zustand
    t_show, t_fall, t_land = p.to_out(36.58), p.to_out(37.10), p.to_out(37.52)
    p.shape(t_show, t_fall, 540, lid_y - 150, LID, extra="\\fad(300,0)", layer=5)
    p.frames(t_fall, t_land, "Shape", lambda u: p.shape_text(540, round(lid_y - 150 + 150 * u * u), LID, layer=5))
    p.frames(t_land, t_land + 0.2, "Shape",
             lambda u: p.shape_text(540, round(lid_y - 7 * 4 * u * (1 - u)), LID, layer=5))
    t_gold = p.to_out(45.26)                                 # "Verwirklichung"
    t2 = t_land + 0.2
    p.shape(t2, g1, 540, lid_y, LID, extra="\\fad(0,260)",
            extra_main="\\t(%d,%d,\\3c%s\\bord3.6)" % (ms(t_gold, t2), ms(t_gold, t2) + 300, GOLD), layer=5)
    # Beschriftungen: Topf = Sehnsucht, Deckel = Verwirklichung
    ts = p.to_out(39.82)
    p.ev(ts, g1, "Label", "{\\an5\\pos(540,%d)\\fad(0,260)}" % (RIM_Y + 70)
         + p.focus_words([("Sehnsucht", 40.18)], ts, dur=300), 3)
    p.ev(t_gold - 0.05, g1, "Label", "{\\an5\\pos(540,%d)\\fad(0,260)\\1c%s}" % (RIM_Y - 92, GOLD)
         + p.focus_words([("Verwirklichung", 45.22)], t_gold - 0.05, dur=300), 3)

    # Schluss: "wenn das göttliche Timing da ist."
    p.headline(p.to_out(53.62), p.total, [
        ([("wenn", 53.86), ("das", 53.96)], 1214, "Small"),
        ([("göttliche", 54.18), ("Timing", 54.90, GOLD)], 1326, "Head"),
        ([("da", 56.48), ("ist.", 56.74)], 1436, "Small"),
    ], settle=1400, dur=300, fade_out=300, srt="wenn das göttliche Timing da ist.")


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
