#!/usr/bin/env python3
"""Video: "Bist du ein Overthinker?"  –  python3 video_overthinking.py [--preview t …]

Alle Zeiten = Quellzeiten (Sekunden im Original). Trailer-Fragmente tragen seg="T".
Hinweis: Das Original endet mitten im Satz ("…mach etwas, was dich wieder ins Gefühl"),
der Edit endet deshalb sauber nach der vollständigen Aufzählung "…mach Sport, mach Yoga."
"""
import os

import engine
from engine import GOLD, WHITE, keep_ranges

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)

SLUG = "overthinking"
TITLE = "Paki Akin – Bist du ein Overthinker?"
SRC = os.path.join(HERE, "source", "original_overthinking.mov")
OUT_MAIN = os.path.join(OUT, "Paki_Akin_Overthinking_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT, "Paki_Akin_Overthinking_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT, "Paki_Akin_Overthinking_Untertitel.srt")
ASS = os.path.join(HERE, "untertitel_overthinking.ass")

ANCHOR = (400.0, 470.0)
FACE_TRACK = os.path.join(HERE, "face_track.json")
SUB_Y = 1330
GRADIENT = (1060, 0.34)

# ---------------------------------------------------------------------------
# TRAILER: drei Fragmente – Gefühl, Versprechen, Methode – ohne die Lösung zu verraten
# ---------------------------------------------------------------------------
TEASER = [
    (39.84, 41.40),    # "…und einfach nur dein Herz gespürt?"   (Herzschlag + Puls)
    (61.40, 63.75),    # "Hören deine Gedanken sofort auf."
    (66.26, 68.65),    # "Was ist jetzt mein nächster Gedanke?"  (+ Stille für die Abdunklung)
]
DIP = (0.50, 0.72)

KEEP = keep_ranges(
    0.40, 77.78,       # Ende nach "mach Yoga," – danach bricht die Aufnahme mitten im Satz ab
    trims=[
        (3.84, 4.34, 0.30),     # "für dich. | Ja,"
        (12.00, 12.38, 0.20),   # "XY | Szenario"
        (21.44, 21.94, 0.32),   # "Vergangenheit. | Dein Overthinking"
        (24.20, 24.88, 0.36),   # "sagt dir, | dass du nicht"
        (26.54, 27.04, 0.32),   # "Körper bist. | Dass du"
        (28.78, 29.44, 0.34),   # "Gefühl bist. | Dass du"
        (29.94, 30.64, 0.40),   # "Dass du | kaum mehr spürst." – Betonung bleibt
        (41.34, 42.44, 0.70),   # "Herz gespürt? | Wenn du" – Raum für den Herzschlag
        (43.80, 44.28, 0.32),   # "lange her, | dann wird"
        (58.42, 59.04, 0.34),   # "beobachten. | Mit jeder"
        (60.92, 61.48, 0.34),   # "deiner Gedanken | hören"
        (63.66, 64.28, 0.34),   # "sofort auf. | Zweite Methode"
        (68.10, 68.70, 0.45),   # "nächster Gedanke? | Und dann" – Denkpause bleibt sichtbar
        (72.34, 72.76, 0.30),   # "bringen. | Arbeite"
        (74.70, 75.32, 0.30),   # "Natur, | mach Sport"
        (75.96, 76.86, 0.36),   # "Sport, | mach Yoga"
    ],
)

SHOTS = [
    ("T", 39.82, 41.42, 1.25, 1.32, "lin"),
    ("T", 61.38, 63.77, 1.18, 1.24, "lin"),
    ("T", 66.24, 68.67, 1.28, 1.34, "lin"),
    ("M", 0.40, 3.95, 1.00, 1.05, "lin"),     # Titel
    ("M", 3.95, 14.20, 1.00, 1.06, "lin"),    # Gedanken schwirren um den Kopf – weit
    ("M", 14.20, 21.70, 1.14, 1.18, "lin"),
    ("M", 21.70, 24.55, 1.24, 1.26, "lin"),   # "Dein Overthinking sagt dir," – Spannung
    ("M", 24.55, 26.80, 1.04, 1.05, "lin"),   # drei Stufen: Körper – Gefühl – spüren
    ("M", 26.80, 29.10, 1.12, 1.13, "lin"),
    ("M", 29.10, 32.10, 1.20, 1.22, "lin"),
    ("M", 32.10, 36.15, 1.04, 1.08, "lin"),
    ("M", 36.15, 42.10, 1.10, 1.20, "lin"),   # Hand auf die Brust – langsames Heranfahren
    ("M", 42.10, 44.05, 1.00, 1.01, "lin"),
    ("M", 44.05, 50.45, 1.00, 1.10, "ease"),  # "dann wird es jetzt Zeit dafür" – Wendepunkt
    ("M", 50.45, 54.10, 1.14, 1.16, "lin"),
    ("M", 54.10, 55.60, 1.24, 1.24, "lin"),   # "Ich denke automatisch."
    ("M", 55.60, 58.70, 1.04, 1.05, "lin"),   # Methode 1
    ("M", 58.70, 61.20, 1.10, 1.12, "lin"),
    ("M", 61.20, 63.95, 1.18, 1.20, "lin"),   # "hören deine Gedanken sofort auf."
    ("M", 63.95, 68.40, 1.02, 1.06, "lin"),   # Methode 2
    ("M", 68.40, 72.55, 1.10, 1.13, "lin"),   # Methode 3
    ("M", 72.55, 77.80, 1.00, 1.06, "lin"),   # Hände · Natur · Sport · Yoga – weit
]
PULSES = [(("teaser", 0, 0.98), 0.022), (("src", 40.82), 0.022)]   # Bild pulsiert mit dem Herzschlag

CARDS = [
    (4.12, "Ja, ich weiß,", {}),
    (4.92, "du machst dir Sorgen", {}),
    (5.70, "um deine Zukunft,", {"Zukunft": 6.18}),
    (6.60, "du denkst über deine", {}),
    (7.48, "Vergangenheit nach,", {"Vergangenheit": 7.54}),
    (8.36, "ob das richtig war,", {}),
    (9.56, "du denkst darüber nach,", {}),
    (10.68, "ob XY-Szenario", {}),
    (13.16, "eintreffen wird.", {}),
    (14.36, "Aber dein Overthinking", {"Overthinking": 15.30}),
    (16.28, "sagt dir in Wirklichkeit", {}),
    (17.96, "was anderes", {}),
    (19.08, "als deine Zukunft", {}),
    (20.36, "oder deine Vergangenheit.", {}),
    (21.88, "Dein Overthinking", {}),
    (23.40, "sagt dir,", {}),
    (24.76, "dass du nicht", {}),
    (25.56, "in deinem Körper bist.", {"Körper": 26.10}),
    (26.92, "Dass du nicht", {}),
    (27.64, "in deinem Gefühl bist.", {"Gefühl": 28.18}),
    (29.46, "Dass du", {}),
    (30.44, "kaum mehr spürst.", {"spürst": 31.30}),
    (32.20, "Mal ganz ehrlich,", {}),
    (33.08, "wann hast du", {}),
    (33.72, "das letzte Mal", {}),
    (34.68, "in dich hineingehorcht?", {}),
    (36.28, "Wann hast du", {}),
    (36.92, "das letzte Mal", {}),
    (37.64, "deine Hand auf", {}),
    (38.36, "deine Brust gelegt", {}),
    (39.72, "und einfach nur", {}),
    (40.52, "dein Herz gespürt?", {"Herz": 40.82}),
    (42.12, "Wenn du sagst,", {}),
    (42.92, "es ist schon lange her,", {}),
    (44.20, "dann wird es jetzt", {}),
    (45.32, "Zeit dafür,", {}),
    (46.44, "dass du weniger denkst", {"weniger denkst": 46.90}),
    (47.72, "und mehr", {}),
    (48.60, "in deinen Körper kommst.", {"Körper": 49.54}),
    (50.52, "Und wenn du sagst:", {}),
    (51.32, "„Ich weiß aber gar nicht,", {}),
    (52.04, "wie das geht,", {}),
    (52.68, "wo soll ich denn", {}),
    (53.30, "da anfangen?", {}),
    (54.20, "Ich denke automatisch.“", {}),
    (55.64, "Dann fängst du", {}),
    (56.44, "jetzt mal an,", {}),
    (57.00, "deine Gedanken", {}),
    (57.72, "zu beobachten.", {"beobachten": 57.94}),
    (58.84, "Mit jeder Beobachtung", {}),
    (60.20, "deiner Gedanken", {}),
    # 61.20–63.9: Headline "hören deine Gedanken sofort auf."
    (64.12, "Zweite Methode ist,", {}),
    (65.30, "du fragst dich:", {}),
    # 66.26–68.55: Headline "Was ist jetzt mein nächster Gedanke?"
    (68.62, "Und dann empfehle ich dir,", {}),
    (70.04, "Dinge zu tun,", {}),
    (70.76, "die dich in deinen", {}),
    (71.60, "Körper bringen.", {"Körper": 71.70}),
    (72.60, "Arbeite mit deinen Händen,", {}),
    (74.04, "geh in die Natur,", {}),
    (75.24, "mach Sport,", {}),
    (76.68, "mach Yoga.", {}),
]
BREAKS = {61.20, 66.26}

LAMP = dict(cx=-260, cy=760, rx=620, ry=900, drift=260)
TOP = dict(cx=540, cy=-220, rx=650, ry=950)
HEART = dict(cx=540, cy=1150, rx=520, ry=520)       # warmes Glühen auf Brusthöhe
LIGHTS = [
    dict(ref=("cut",), peak=0.32, rise=0.05, fall=0.9, **LAMP),
    dict(ref=("teaser", 0, 0.98), peak=0.16, rise=0.08, fall=0.35, **HEART),
    dict(ref=("src", 40.82), peak=0.16, rise=0.08, fall=0.35, **HEART),   # "Herz"
    dict(ref=("src", 44.26), peak=0.22, rise=0.40, fall=1.4, **LAMP),     # Wendepunkt
    dict(ref=("src", 62.92), peak=0.20, rise=0.30, fall=1.2, **TOP),      # "sofort auf."
]
SFX = [
    ("heartbeat", ("teaser", 0, 0.98), -19.0),   # Trailer: "Herz"
    ("hit", ("teaser", 1), -23.0),
    ("hit", ("teaser", 2), -23.0),
    ("heartbeat", ("teaser", 2, 1.92), -19.0),   # Stille vor dem Einstieg
    ("hit", ("cut",), -19.0),
    ("heartbeat", ("src", 40.82), -19.0),        # "dein Herz gespürt?"
    ("impact", ("src", 44.26), -20.0),           # "dann wird es jetzt Zeit dafür" – Musik öffnet sich
    ("click", ("src", 57.96), -26.0),            # Chip "1 · Gedanken beobachten"
    ("impact", ("src", 62.92), -22.0),           # "sofort auf."
    ("click", ("src", 64.20), -26.0),            # Chip 2
    ("click", ("src", 69.14), -26.0),            # Chip 3
    ("click", ("src", 73.54), -29.0),            # Hände
    ("click", ("src", 74.74), -29.0),            # Natur
    ("click", ("src", 75.70), -29.0),            # Sport
    ("click", ("src", 77.14), -29.0),            # Yoga
    ("bell", ("src", 77.20), -28.0),             # Schluss
]
MUSIC = {"first_beat": ("cut",), "open": ("src", 44.24), "level_db": -12.5,
         "score": {"intro": "Bm", "prog_b": ["Bm", "G", "D", "A"], "prog_c": ["D", "A", "Bm", "G"], "final": "D"}}

# Gedanken, die um den Kopf schwirren – nur Wörter, die sie selbst sagt: (Wort, Quellzeit, x, y, dx, dy)
THOUGHTS = [("Zukunft", 6.18, 880, 540, 18, -34), ("Vergangenheit", 7.54, 200, 470, -14, -30),
            ("richtig war", 8.72, 210, 770, -10, 26), ("XY-Szenario", 12.56, 860, 820, 12, 22)]
METHODS = [("1 · Gedanken beobachten", 57.94, 63.70), ("2 · Was ist jetzt mein nächster Gedanke?", 64.18, 68.40),
           ("3 · In den Körper kommen", 69.12, 77.80)]
ACTIVITIES = [("Hände", 73.52, 230), ("Natur", 74.72, 437), ("Sport", 75.68, 643), ("Yoga", 77.12, 850)]


def slam(p, t0, t1, lines, seg="T"):
    """Trailer-Typografie: Wörter schnappen schnell und scharf ins Bild (kleiner Scale-Impuls)."""
    for words, y, style in lines:
        p.ev(t0, t1, style, "{\\an5\\q2\\pos(540,%d)\\fscx108\\fscy108\\t(0,180,0.5,\\fscx100\\fscy100)\\fad(0,60)}" % y
             + p.focus_words(words, t0, seg, dur=110, blur=5), 2)


def pill(w, h=64, r=32):
    k = 0.5523 * r
    return (f"m {r} 0 l {w - r} 0 b {w - r + k:.0f} 0 {w} {r - k:.0f} {w} {r} b {w} {r + k:.0f} {w - r + k:.0f} {h} {w - r} {h} "
            f"l {r} {h} b {r - k:.0f} {h} 0 {r + k:.0f} 0 {r} b 0 {r - k:.0f} {r - k:.0f} 0 {r} 0")


def specials(p):
    # --- Trailer -------------------------------------------------------------
    j1, j2 = p.resolve(("teaser", 1)), p.resolve(("teaser", 2))
    slam(p, 0.0, j1, [([("…und", 39.86), ("einfach", 40.02), ("nur", 40.34)], 1226, "Small"),
                      ([("dein", 40.58), ("Herz", 40.82, GOLD), ("gespürt?", 41.12)], 1338, "Head")])
    slam(p, j1, j2, [([("Hören", 61.42), ("deine", 61.94), ("Gedanken", 62.26)], 1226, "Small"),
                     ([("sofort", 62.90), ("auf.", 63.62, GOLD)], 1338, "Head")])
    slam(p, j2, p.t_cut - 0.30, [([("Was", 66.34), ("ist", 66.58), ("jetzt", 66.82), ("mein", 67.14)], 1226, "Small"),
                                 ([("nächster", 67.38), ("Gedanke?", 67.70, GOLD)], 1338, "Head")])
    p.srt += [(0.02, j1, "…und einfach nur dein Herz gespürt?"), (j1, j2, "Hören deine Gedanken sofort auf."),
              (j2, p.t_cut - 0.30, "Was ist jetzt mein nächster Gedanke?")]

    # --- Titel ---------------------------------------------------------------
    p.headline(p.t_cut, p.to_out(3.95), [
        ([("Bist", 0.56), ("du", 0.82), ("ein", 1.14)], 1180, "Head"),
        ([("Overthinker?", 1.40, GOLD)], 1310, "Head"),
        ([("Dann", 2.42), ("ist", 2.66), ("dieses", 2.90), ("Video", 3.22), ("für", 3.62), ("dich.", 3.78)], 1424, "Small"),
    ], dur=220, settle=600, srt="Bist du ein Overthinker? Dann ist dieses Video für dich.")

    # --- Gedanken schwirren um den Kopf und lösen sich bei "Aber" auf -----------
    t_end = p.to_out(14.40)
    for word, wt, x, y, dx, dy in THOUGHTS:
        t0 = p.to_out(wt) - 0.05
        dur = round((t_end + 0.45 - t0) * 1000)
        gone = round((t_end - t0) * 1000)
        p.ev(t0, t_end + 0.45, "Label",
             "{\\an5\\move(%d,%d,%d,%d,0,%d)\\alpha&HFF&\\blur6\\t(0,450,\\alpha&H58&\\blur0.8)"
             "\\t(%d,%d,\\alpha&HFF&\\blur8)}%s" % (x, y, x + dx, y + dy, dur, gone, gone + 450, word), 1)

    # --- "hören deine Gedanken sofort auf." -----------------------------------
    p.headline(p.to_out(61.20), p.to_out(63.95), [
        ([("hören", 61.42), ("deine", 61.94), ("Gedanken", 62.26)], 1262, "Head"),
        ([("sofort", 62.90, GOLD), ("auf.", 63.62, GOLD)], 1396, "Head"),
    ], settle=1200, dur=260, srt="hören deine Gedanken sofort auf.")

    # --- "Was ist jetzt mein nächster Gedanke?" + Denkpause als Punkte --------
    h0, h1 = p.to_out(66.26), p.to_out(68.55)
    p.headline(h0, h1, [
        ([("Was", 66.34), ("ist", 66.58), ("jetzt", 66.82), ("mein", 67.14)], 1262, "Head"),
        ([("nächster", 67.38), ("Gedanke?", 67.70, GOLD)], 1396, "Head"),
    ], settle=900, dur=240, srt="Was ist jetzt mein nächster Gedanke?")
    td = round((p.to_out(68.10) - h0) * 1000)
    dots = "".join("{\\alpha&HFF&\\t(%d,%d,\\alpha&H00&)}·" % (td + 130 * k, td + 130 * k + 120) for k in range(3))
    p.ev(h0, h1, "Head", "{\\an5\\pos(540,1500)\\fsp14\\fad(0,140)}" + dots, 2)

    # --- Methoden-Chips oben --------------------------------------------------
    for text, ts, te in METHODS:
        t0, t1 = p.to_out(ts) - 0.05, p.to_out(te)
        w = 470 if text.startswith("1") else (700 if text.startswith("2") else 480)
        anim = "\\fad(180,220)\\move(540,%d,540,%d,0,260)"
        p.ev(t0, t1, "Shape", "{\\an5\\p1\\bord0\\shad0\\1c&H000000&\\1a&H70&%s}%s" % (anim % (300, 330), pill(w)), 3)
        p.ev(t0, t1, "Chip", "{\\an5\\q2%s}%s" % (anim % (300, 330), text), 4)

    # --- Hände · Natur · Sport · Yoga -----------------------------------------
    g1 = p.total
    for word, wt, x in ACTIVITIES:
        t0 = p.to_out(wt) - 0.05
        p.ev(t0, g1, "Label", "{\\an5\\pos(%d,1196)\\fscx70\\fscy70\\t(0,170,\\fscx100\\fscy100)\\fad(0,300)}" % x
             + p.focus_words([(word, wt, GOLD)], t0, dur=160, blur=6), 3)


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
