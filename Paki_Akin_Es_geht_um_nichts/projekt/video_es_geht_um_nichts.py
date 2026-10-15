#!/usr/bin/env python3
"""Video: "Es geht um nichts."  –  python3 video_es_geht_um_nichts.py [--preview t …]

Alle Zeiten = Quellzeiten (Sekunden im Original).
"""
import os

import engine
from engine import GOLD, WHITE, keep_ranges

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)

SLUG = "es_geht_um_nichts"
TITLE = "Paki Akin – Es geht um nichts"
SRC = os.path.join(HERE, "source", "original_es_geht_um_nichts.mp4")
SRC_SIZE = (464, 848)          # Quelle ist kleiner und etwas schmaler als 9:16
OUT_MAIN = os.path.join(OUT, "Paki_Akin_Es_geht_um_nichts_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT, "Paki_Akin_Es_geht_um_nichts_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT, "Paki_Akin_Es_geht_um_nichts_Untertitel.srt")
ASS = os.path.join(HERE, "untertitel_es_geht_um_nichts.ass")

ANCHOR = (232.0, 285.0)        # Gesicht in der Quelle
SUB_Y = 1330
GRADIENT = (1060, 0.34)

# ---------------------------------------------------------------------------
# SCHNITT: kein Cold Open – "Dieser eine Satz wird alles für dich verändern." ist der Hook.
# Das langsame, betonte "Es … geht … um … nichts." bleibt bewusst ungekürzt.
# ---------------------------------------------------------------------------
TEASER = None
KEEP = keep_ranges(
    0.55, 65.60,
    trims=[
        (6.36, 6.82, 0.32),     # "sagen habe. | Wenn du"
        (16.34, 16.88, 0.36),   # "Nervensystem, | dann musst"
        (24.30, 25.32, 0.60),   # "Trust me. | Es geht um nichts." – Spannungspause bleibt spürbar
        (28.74, 29.56, 0.36),   # "Ab sofort. | Wenn du"
        (36.64, 37.62, 0.36),   # "wichtig ist, | sagst du dir"
        (40.88, 41.36, 0.36),   # "nichts. | Mit dieser"
        (56.90, 57.42, 0.34),   # "Meeting? | Mach es"
    ],
)

# Quelle nur 464 px breit -> Punch-ins bewusst klein (max. 15 %)
SHOTS = [
    ("M", 0.55, 3.40, 1.00, 1.04, "lin"),     # Titel
    ("M", 3.40, 6.60, 1.10, 1.11, "lin"),     # "Bleib dran, hör mir zu, …"
    ("M", 6.60, 12.40, 1.00, 1.05, "lin"),
    ("M", 12.40, 16.60, 1.08, 1.10, "lin"),   # "… regulierteres Nervensystem,"
    ("M", 16.60, 24.40, 1.03, 1.12, "lin"),   # "dann musst du diesen einen Satz …" – langsames Heranfahren (Spannung)
    ("M", 24.40, 27.75, 1.15, 1.15, "lin"),   # "Es geht um nichts." – nah, ruhig
    ("M", 27.75, 29.20, 1.04, 1.05, "lin"),   # "Ab sofort."
    ("M", 29.20, 37.20, 1.00, 1.03, "lin"),   # Liste Prüfung / Entscheidung / Treffen – weit
    ("M", 37.20, 41.10, 1.06, 1.08, "lin"),   # "sagst du dir, es geht um nichts."
    ("M", 41.10, 49.10, 1.02, 1.07, "lin"),
    ("M", 49.10, 50.90, 1.00, 1.00, "lin"),   # "Und wenn wir doch mal ehrlich sind,"
    ("M", 50.90, 52.95, 1.05, 1.05, "lin"),   # drei Fragen – drei Stufen
    ("M", 52.95, 55.00, 1.10, 1.10, "lin"),
    ("M", 55.00, 57.20, 1.15, 1.15, "lin"),
    ("M", 57.20, 58.42, 1.00, 1.02, "lin"),   # "Mach es dir leicht." – weit, Licht
    ("M", 58.42, 63.20, 1.06, 1.10, "lin"),
    ("M", 63.20, 65.61, 1.00, 1.06, "ease"),  # "es geht um nichts." – Schluss
]

CARDS = [
    (3.40, "Bleib dran,", {}),
    (4.36, "hör mir zu,", {}),
    (5.30, "was ich dir zu sagen habe.", {}),
    (6.86, "Wenn du dein Leben", {}),
    (7.72, "verändern willst,", {}),
    (8.76, "wenn du endlich ein", {}),
    (9.88, "besseres,", {}),
    (10.68, "leichteres Leben", {}),
    (11.72, "haben willst,", {}),
    (12.44, "ja, vielleicht auch ein", {}),
    (14.20, "regulierteres Nervensystem,", {}),
    (16.84, "dann musst du", {}),
    (17.72, "diesen einen Satz", {"Satz": 18.98}),
    (19.64, "verinnerlichen,", {}),
    (20.68, "so tief in jede Zelle", {}),
    (22.76, "deiner selbst.", {}),
    (23.80, "Trust me.", {}),
    # 25.10–27.75: Headline "Es geht um nichts."
    (27.80, "Ab sofort.", {}),
    (29.32, "Wenn du vor einer", {}),
    (30.28, "Prüfung stehst,", {}),
    (31.24, "wenn du vor einer", {}),
    (32.12, "wichtigen Entscheidung", {}),
    (33.16, "stehst,", {}),
    (33.64, "wenn du vor einem", {}),
    (35.16, "Treffen stehst,", {}),
    (36.28, "das dir wichtig ist,", {}),
    (37.56, "sagst du dir,", {}),
    (38.68, "es geht um nichts.", {"nichts": 40.26}),
    (41.32, "Mit dieser Ausrichtung,", {}),
    (42.84, "mit dieser Intention", {"Intention": 43.70}),
    (45.00, "verschaffst du deinem", {}),
    (46.12, "Unterbewusstsein", {}),
    (47.16, "Leichtigkeit,", {"Leichtigkeit": 47.22}),
    (48.04, "dass es um nichts geht.", {}),
    (49.16, "Und wenn wir doch", {}),
    (49.80, "mal ehrlich sind,", {}),
    (50.92, "worum geht es denn", {}),
    (52.04, "bei dieser Prüfung?", {}),
    (53.00, "Worum geht es denn", {}),
    (53.96, "bei diesem Titel?", {}),
    (55.08, "Worum geht es denn", {}),
    (56.20, "bei diesem Meeting?", {}),
    # 57.30–58.40: Headline "Mach es dir leicht."
    (58.44, "Speicher dir dieses", {}),
    (59.40, "Video ab", {}),
    (59.88, "für schwierige Zeiten,", {}),
    (61.24, "damit du dich daran", {}),
    (62.28, "wieder erinnerst,", {}),
    # ab 63.20: Schluss-Headline "es geht um nichts."
]
BREAKS = {25.10, 57.30, 63.20}

LAMP = dict(cx=-260, cy=760, rx=620, ry=900, drift=260)
TOP = dict(cx=540, cy=-220, rx=650, ry=950)
LIGHTS = [
    dict(ref=("out", 0.0), peak=0.40, rise=0.05, fall=0.9, **LAMP),
    dict(ref=("src", 25.22), peak=0.26, rise=0.50, fall=1.6, **TOP),   # "Es geht um nichts."
    dict(ref=("src", 57.40), peak=0.20, rise=0.35, fall=1.2, **TOP),   # "Mach es dir leicht."
    dict(ref=("src", 64.70), peak=0.20, rise=0.40, fall=1.4, **TOP),   # letztes "nichts"
]
SFX = [
    ("impact", ("out", 0.0), -21.0),       # erster Frame, Titel
    ("impact", ("src", 25.22), -20.0),     # "Es geht um nichts." – Musik öffnet sich
    ("click", ("src", 59.72), -23.0),      # Lesezeichen füllt sich bei "ab(speichern)"
    ("bell", ("src", 64.72), -26.0),       # letztes "nichts"
]
MUSIC = {"first_beat": ("src", 3.42), "open": ("src", 25.20), "level_db": -12.5,
         "score": {"intro": "Em", "prog_b": ["Em", "C", "G", "D"], "prog_c": ["G", "D", "Em", "C"], "final": "G"}}

# Liste "Prüfung / Entscheidung / Treffen": (Wort, Quellzeit, y, gemessene Breite in px)
LIST = [("Prüfung", 30.34, 1046, 162), ("Entscheidung", 32.66, 1128, 260), ("Treffen", 35.22, 1210, 130)]


def specials(p):
    # Titel
    p.headline(0.0, p.to_out(3.38), [
        ([("Dieser", 0.66), ("eine", 0.96), ("Satz", 1.30, GOLD)], 1196, "Head"),
        ([("wird", 1.70), ("alles", 2.10), ("für", 2.42), ("dich", 2.58)], 1312, "HeadRoman"),
        ([("verändern.", 2.82)], 1426, "Head"),
    ], dur=220, srt="Dieser eine Satz wird alles für dich verändern.")

    # Auflösung: "Es geht um nichts." – ihr langsames Sprechen bestimmt den Aufbau
    p.headline(p.to_out(25.10), p.to_out(27.75), [
        ([("Es", 25.24), ("geht", 25.56)], 1262, "Head"),
        ([("um", 26.36), ("nichts.", 26.70, GOLD)], 1396, "Head"),
    ], settle=1500, dur=320, srt="Es geht um nichts.")

    # Liste erscheint Wort für Wort und wird bei "es geht um nichts" durchgestrichen
    g1 = p.to_out(41.75)              # bleibt nach dem Durchstreichen noch ~1 s stehen
    t_strike = p.to_out(40.26)
    for k, (word, wt, y, w) in enumerate(LIST):
        t0 = p.to_out(wt) - 0.05
        dim = round((t_strike - t0) * 1000) + 120 * k
        p.ev(t0, g1, "Label", "{\\an5\\pos(540,%d)\\fad(0,220)\\t(%d,%d,\\alpha&H60&)}" % (y, dim, dim + 300)
             + p.focus_words([(word, wt)], t0, dur=280), 3)
        ts = t_strike + 0.12 * k
        L = w + 24
        reveal = "\\fad(0,220)\\clip(%d,%d,%d,%d)\\t(0,260,0.7,\\clip(%d,%d,%d,%d))" % (
            540 - L // 2 - 6, y - 10, 540 - L // 2 - 6, y + 20, 540 - L // 2 - 6, y - 10, 540 + L // 2 + 6, y + 20)
        p.shape(ts, g1, 540, y + 6, "m 0 0 l %d 0 l %d 3 l 0 3" % (L, L), filled=True, color=GOLD, extra=reveal, layer=5)

    # "Mach es dir leicht."
    p.headline(p.to_out(57.30), p.to_out(58.40), [
        ([("Mach", 57.40), ("es", 57.62), ("dir", 57.78)], 1262, "Head"),
        ([("leicht.", 57.96, GOLD)], 1396, "Head"),
    ], dur=200, settle=600, srt="Mach es dir leicht.")

    # Lesezeichen: erscheint mit "Speicher dir dieses", füllt sich gold bei "ab"
    mark = "m 0 4 b 0 2 2 0 4 0 l 44 0 b 46 0 48 2 48 4 l 48 64 l 24 47 l 0 64 l 0 4"
    t0, t1 = p.to_out(p.snap(58.44)), p.to_out(p.snap(59.88))
    tf = round((p.to_out(59.72) - t0) * 1000)
    pop = "\\fscx60\\fscy60\\t(0,140,\\fscx110\\fscy110)\\t(140,260,\\fscx100\\fscy100)\\fad(120,120)"
    p.shape(t0, t1, 540, 1222, mark, width=3.2, extra=pop,
            extra_main="\\1c%s\\t(%d,%d,\\1a&H00&\\3c%s\\fscx112\\fscy112)\\t(%d,%d,\\fscx100\\fscy100)"
            % (GOLD, tf, tf + 120, GOLD, tf + 120, tf + 260), layer=5)

    # Schluss: "es geht um nichts."
    p.headline(p.to_out(63.20), p.total, [
        ([("es", 63.32), ("geht", 63.56)], 1262, "Head"),
        ([("um", 64.12), ("nichts.", 64.72, GOLD)], 1396, "Head"),
    ], settle=1500, dur=320, fade_out=300, srt="es geht um nichts.")


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
