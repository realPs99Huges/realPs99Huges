#!/usr/bin/env python3
"""Paki Akin – "Selbstwert": komplettes, reproduzierbares Schnittprojekt.

    python3 edit.py                 # kompletter Render (mit Musik + Version ohne Musik)
    python3 edit.py --subs-only     # nur Untertitel (ASS/SRT) neu schreiben
    python3 edit.py --preview 31.2  # Kontrollbild bei Ausgabe-Sekunde 31.2

Alle Zeiten in den Tabellen sind ORIGINALZEITEN (Sekunden im Quellvideo).
Das Skript rechnet sie auf die geschnittene Timeline um. Bild-Zeitpunkte des
Cold Opens werden mit seg="T" gekennzeichnet, weil diese Passage im Video
zweimal vorkommt.
"""
import argparse
import json
import os
import subprocess
import sys
import wave

import cv2
import numpy as np

import music

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(HERE)
SRC = os.path.join(HERE, "source", "original_paki_akin_selbstwert.mp4")
FONTS = os.path.join(HERE, "fonts")
BUILD = os.path.join(HERE, "build")
OUT_MAIN = os.path.join(OUT_DIR, "Paki_Akin_Selbstwert_1080x1920.mp4")
OUT_NOMUSIC = os.path.join(OUT_DIR, "Paki_Akin_Selbstwert_ohne_Musik_1080x1920.mp4")
OUT_SRT = os.path.join(OUT_DIR, "Paki_Akin_Selbstwert_Untertitel.srt")

FPS = 30                       # Quelle: ~26,7 Bilder/s auf 30-fps-Raster -> 1:1-Timing bei 30 fps
W, H = 1080, 1920
SRC_W, SRC_H = 720, 1280
BASE = W / SRC_W               # 1.5 – Quelle ist bereits 9:16, kein Beschnitt nötig
ANCHOR = (400.0, 470.0)        # Gesicht – bleibt bei Punch-ins an seiner Bildposition
SR = 48000

GOLD, WHITE = "&H0096CDF2&", "&H00FFFFFF&"

# ---------------------------------------------------------------------------
# 1) SCHNITT  (Name, erstes Quellbild, Bild nach dem letzten; Raster 1/30 s)
# ---------------------------------------------------------------------------
SEGMENTS = [
    ("T",  574,  687),   # COLD OPEN: "Warum bist du weniger wert als jemand anderes da draußen?"
    ("M1",  19,  688),   # "Das sagt dir niemand." … "… da draußen?"   (0,6 s Vorlauf entfernt)
    ("M2", 705,  734),   # "Erklär es mir,"                               (Pause 1,0 -> 0,35 s)
    ("M3", 741, 1416),   # "beantworte mir diese Frage." … "… auf diesen Podest stellen."
    ("M4", 1427, 1488),  # "Und dann nimmst du die anderen mit auch noch da hoch."   (Pause gekürzt)
    ("M5", 1496, 1510),  # "Also,"
    ("M6", 1533, 1669),  # "Hausaufgabe erledigen, Video abspeichern. Ich freue mich, von dir zu lesen."
]

# ---------------------------------------------------------------------------
# 2) BILDAUSSCHNITT  (Segment, Quellzeit von, bis, Zoom Start, Zoom Ende, Kurve)
# ---------------------------------------------------------------------------
SHOTS = [
    ("T",  19.13, 22.90, 1.22, 1.30, "lin"),    # eng, langsamer Push – Spannung
    ("M1",  0.60,  2.00, 1.00, 1.02, "lin"),    # weit: Titel "Das sagt dir niemand."
    ("M1",  2.00,  4.30, 1.12, 1.14, "lin"),
    ("M1",  4.30,  6.25, 1.16, 1.17, "lin"),
    ("M1",  6.25,  6.95, 1.17, 1.00, "ease"),   # Kamera zieht auf, während "kleiner" schrumpft
    ("M1",  6.95,  7.73, 1.00, 1.00, "lin"),
    ("M1",  7.73, 10.25, 1.18, 1.20, "lin"),    # "irgendwelche Stars?"
    ("M1", 10.25, 16.85, 1.03, 1.08, "lin"),
    ("M1", 16.85, 19.05, 1.26, 1.28, "lin"),    # "Und ich meine es gerade todernst." – ganz eng
    ("M1", 19.05, 22.94, 1.06, 1.09, "lin"),
    ("M2", 23.50, 24.47, 1.18, 1.19, "lin"),    # "Erklär es mir,"
    ("M3", 24.70, 26.50, 1.00, 1.02, "lin"),
    ("M3", 26.50, 29.40, 1.10, 1.12, "lin"),    # Kommentare
    ("M3", 29.40, 31.90, 1.00, 1.12, "ease"),   # "Du hast einen Wert in dir." – langsames Heranfahren
    ("M3", 31.90, 34.22, 1.12, 1.14, "lin"),
    ("M3", 34.22, 41.85, 1.02, 1.07, "lin"),
    ("M3", 41.85, 44.52, 1.14, 1.15, "lin"),
    ("M3", 44.52, 47.21, 1.00, 1.02, "lin"),    # weit: Podest-Grafik
    ("M4", 47.55, 49.61, 1.02, 1.04, "lin"),
    ("M5", 49.85, 50.34, 1.12, 1.12, "lin"),
    ("M6", 51.10, 53.75, 1.10, 1.13, "lin"),
    ("M6", 53.75, 55.64, 1.00, 1.03, "lin"),    # Abschied, weit
]

# ---------------------------------------------------------------------------
# 3) UNTERTITEL  (Quellzeit, Text, {Schlüsselwort: Quellzeit})
#    Ende = Beginn der nächsten Karte im selben Segment, sonst Segmentende.
#    Startzeiten werden automatisch auf den tatsächlichen Stimmeinsatz gesetzt.
# ---------------------------------------------------------------------------
CARDS = [
    (2.05, "Warum hältst du dich", {}),
    (3.30, "eigentlich klein?", {}),
    (4.45, "Warum machst du dich", {}),
    (5.55, "immer wieder", {}),
    # 6.28–6.92: "kleiner," als schrumpfendes Wort (SPECIALS)
    (6.92, "als du bist?", {}),
    (7.72, "Warum vergötterst du", {}),
    (8.92, "irgendwelche Stars?", {}),
    (10.36, "Warum vergötterst du", {}),
    (11.70, "Menschen, die nicht mal", {}),
    (13.40, "ansatzweise", {}),
    (14.36, "für dich Ozeane", {}),
    (15.50, "überqueren würden?", {}),
    (16.92, "Und ich meine es", {}),
    (17.66, "gerade todernst.", {"todernst": 18.10}),
    (19.15, "Warum bist du", {}),
    (20.04, "weniger wert", {"weniger wert": 20.10}),
    (20.92, "als jemand anderes", {}),
    (22.04, "da draußen?", {}),
    (23.62, "Erklär es mir,", {}),
    (24.80, "beantworte mir", {}),
    (25.72, "diese Frage.", {}),
    (26.52, "Jetzt schreib sie mir", {}),
    (27.74, "hier jetzt", {}),
    (28.38, "in die Kommentare.", {}),
    # 29.6–31.95: "Du hast einen Wert in dir." als Headline (SPECIALS)
    (31.98, "Und diesen Wert", {"Wert": 32.60}),
    (32.98, "darfst du erkennen.", {}),
    (34.28, "Du darfst heute anfangen,", {}),
    (36.58, "dich nicht mehr", {}),
    (37.70, "klein zu halten,", {}),
    (39.05, "dein Selbstwertgefühl", {"Selbstwertgefühl": 39.56}),
    (40.68, "zu stabilisieren,", {}),
    (41.95, "nicht andere Menschen", {}),
    (43.00, "auf ein Podest zu stellen.", {"Podest": 43.40}),
    (44.60, "Du darfst erst mal", {}),
    # 45.72–49.6: Podest-Grafik mit eigener Beschriftung (SPECIALS)
    (49.90, "Also,", {}),
    (51.20, "Hausaufgabe erledigen,", {"Hausaufgabe": 51.30}),
    (52.60, "Video abspeichern.", {}),
    (53.80, "Ich freue mich,", {}),
    (54.44, "von dir zu lesen.", {}),
]
CARD_BREAKS = {6.28, 29.55, 45.72}   # hier beginnt ein Special -> vorherige Karte endet

# ---------------------------------------------------------------------------
# 4) SOUNDDESIGN  (Typ, Ausgabezeit-Bezug, Pegel dBFS) – alles synthetisch erzeugt
# ---------------------------------------------------------------------------
# Zeitbezüge: ("src", Quellzeit[, Segment]) oder ("out", Ausgabezeit)
SFX = [
    ("impact", ("out", 0.0), -21.0),            # erster Frame: weicher, tiefer Akzent + Licht
    ("hit",    ("cut",), -20.0),                # Schnitt aus dem Cold Open, mit Lichtblitz
    ("click",  ("src", 28.72), -25.0),          # Kommentar-Symbol erscheint
    ("impact", ("src", 30.94), -20.0),          # "Wert" – Musik öffnet sich
    ("rise",   ("src", 46.98), -24.0),          # "dich" steigt aufs Podest (Höhepunkt = Landung)
    ("click",  ("src", 53.10), -23.0),          # Lesezeichen füllt sich bei "abspeichern"
]

GRADE = ("colorbalance=rs=-0.02:bs=0.02:rm=-0.02:bm=0.02:rh=-0.03:bh=0.01,"
         "eq=contrast=1.04:saturation=0.96")
GRADIENT = (1060, 0.34)        # unteres Drittel sanft abgedunkelt (max. 34 %) für Lesbarkeit
X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-colorspace", "bt709", "-color_range", "tv"]


# ===========================================================================
# Timeline
# ===========================================================================
SEG_OUT = []
_t = 0
for _, a, b in SEGMENTS:
    SEG_OUT.append(_t)
    _t += b - a
N_FRAMES = _t
TOTAL = N_FRAMES / FPS
T_CUT = SEG_OUT[1] / FPS


def seg_index(name):
    return [s[0] for s in SEGMENTS].index(name)


def to_out(src_t, seg=None):
    """Quellzeit -> Ausgabezeit. Ohne seg: Hauptteil (der Cold Open wird übersprungen)."""
    for i, (name, a, b) in enumerate(SEGMENTS):
        if (seg and name != seg) or (not seg and name == "T"):
            continue
        if a / FPS - 0.25 <= src_t <= b / FPS + 0.05:
            return SEG_OUT[i] / FPS + max(0.0, min(src_t, b / FPS) - a / FPS)
    raise ValueError(f"Quellzeit {src_t} liegt in keinem Segment ({seg})")


def seg_of(src_t):
    for name, a, b in SEGMENTS:
        if name != "T" and a / FPS - 0.25 <= src_t <= b / FPS + 0.05:
            return name
    raise ValueError(src_t)


def seg_end_out(name):
    i = seg_index(name)
    return (SEG_OUT[i] + SEGMENTS[i][2] - SEGMENTS[i][1]) / FPS


def resolve(ref):
    if ref[0] == "out":
        return ref[1]
    if ref[0] == "cut":
        return T_CUT
    return to_out(ref[1], ref[2] if len(ref) > 2 else None)


def ease(u):
    return u * u * (3 - 2 * u)


def zoom_for(seg, src_t):
    for s, a, b, z0, z1, curve in SHOTS:
        if s == seg and a - 1e-3 <= src_t < b + 1e-3:
            u = min(1.0, max(0.0, (src_t - a) / (b - a)))
            return z0 + (z1 - z0) * (ease(u) if curve == "ease" else u)
    return 1.0


def frame_plan():
    plan = []
    for name, a, b in SEGMENTS:
        for f in range(a, b):
            plan.append((name, f, zoom_for(name, f / FPS)))
    assert len(plan) == N_FRAMES
    return plan


# ===========================================================================
# Stimmeinsätze (für exakte Untertitel-Starts)
# ===========================================================================
_ENV = None


def voice_env():
    global _ENV
    if _ENV is None:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "16000",
                              "-f", "s16le", "-"], capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        hop = 320
        n = len(a) // hop
        _ENV = 20 * np.log10(np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    return _ENV


def snap(src_t):
    """Liegt der Zeitpunkt in einer Pause, wird er auf den nächsten Stimmeinsatz geschoben."""
    env = voice_env()
    i = int(src_t / 0.02)
    if env[i] > -50:
        return src_t - 0.03
    for j in range(i, min(len(env), i + 25)):
        if env[j] > -46:
            return j * 0.02 - 0.05
    return src_t


# ===========================================================================
# ASS-Untertitel und Typografie
# ===========================================================================
def at(t):
    cs = max(0, round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def st(t):
    ms = max(0, round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


ASS_HEADER = f"""[Script Info]
Title: Paki Akin – Selbstwert
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter SemiBold,62,&H00FFFFFF,&H00FFFFFF,&H8C000000,&HA0000000,0,0,0,0,100,100,0.6,0,1,3.4,1.8,5,140,140,0,1
Style: Head,Instrument Serif,134,&H00FFFFFF,&H00FFFFFF,&H78000000,&HA0000000,0,1,0,0,100,100,0.5,0,1,4,2,5,90,90,0,1
Style: HeadRoman,Instrument Serif,104,&H00FFFFFF,&H00FFFFFF,&H78000000,&HA0000000,0,0,0,0,100,100,0.5,0,1,4,2,5,90,90,0,1
Style: Small,Inter Medium,46,&H00FFFFFF,&H00FFFFFF,&H8C000000,&HA0000000,0,0,0,0,100,100,2.4,0,1,3,1.6,5,90,90,0,1
Style: Shape,Inter Medium,20,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

SUB_Y = 1330
EVENTS, SRT_ROWS = [], []


def ev(t0, t1, style, text, layer=1):
    EVENTS.append(f"Dialogue: {layer},{at(t0)},{at(t1)},{style},,0,0,0,,{text}")


def focus_words(words, t0, seg=None, dur=260, blur=9):
    """Wörter erscheinen einzeln synchron zum Sprechen: unscharf/transparent -> scharf."""
    parts = []
    for w, wt, *col in words:
        ms = max(0, round((to_out(wt, seg) - t0) * 1000))
        c = "\\1c" + col[0] if col else ""
        parts.append("{\\alpha&HFF&\\blur%d%s\\t(%d,%d,0.6,\\alpha&H00&\\blur0.7)}%s"
                     % (blur, c, ms, ms + dur, w))
    return " ".join(parts)


def build_cards():
    starts = sorted([c[0] for c in CARDS] + list(CARD_BREAKS))
    for s, text, kws in CARDS:
        seg = seg_of(s)
        t0 = to_out(snap(s))
        nxt = next((x for x in starts if x > s), None)
        t1 = seg_end_out(seg)
        if nxt is not None and seg_of(nxt) == seg:
            t1 = min(t1, to_out(snap(nxt)) if nxt not in CARD_BREAKS else to_out(nxt))
        body = text
        for kw, kt in kws.items():
            ms = max(0, round((to_out(kt) - t0) * 1000))
            body = body.replace(kw, "{\\1c%s\\t(%d,%d,\\1c%s)}%s{\\1c%s}" % (WHITE, ms, ms + 140, GOLD, kw, WHITE), 1)
        tags = "{\\an5\\q2\\move(540,%d,540,%d,0,170)\\fad(110,80)\\blur0.6}" % (SUB_Y + 10, SUB_Y)
        ev(t0, t1, "Sub", tags + body)
        SRT_ROWS.append((t0, t1, text))


def build_specials():
    # --- Cold Open: Frage als typografischer Aufbau --------------------------
    t0, t1 = 0.0, T_CUT - 0.10
    lines = [
        ([("Warum", 19.20), ("bist", 19.60), ("du", 19.84)], 1240, "HeadRoman"),
        ([("weniger", 20.10), ("wert", 20.50, GOLD)], 1372, "Head"),
        ([("als", 20.96), ("jemand", 21.28), ("anderes", 21.68), ("da", 22.08), ("draußen?", 22.32)], 1478, "Small"),
    ]
    for words, y, style in lines:
        ev(t0, t1, style, "{\\an5\\q2\\move(540,%d,540,%d,0,900)\\fad(0,120)}" % (y + 10, y)
           + focus_words(words, t0, "T"), layer=2)
    SRT_ROWS.append((to_out(19.15, "T"), t1, "Warum bist du weniger wert als jemand anderes da draußen?"))

    # --- Titel nach dem Lichtblitz -----------------------------------------
    t0, t1 = T_CUT, to_out(2.0)
    ev(t0, t1, "Head", "{\\an5\\q2\\move(540,%d,540,%d,0,600)\\fad(0,140)}" % (SUB_Y + 8, SUB_Y)
       + focus_words([("Das", 0.76), ("sagt", 0.92), ("dir", 1.26), ("niemand.", 1.46)], t0, dur=220), layer=2)
    SRT_ROWS.append((to_out(0.70), t1, "Das sagt dir niemand."))

    # --- "kleiner," schrumpft, während die Kamera aufzieht ---------------
    t0, t1 = to_out(6.28), to_out(snap(6.92))
    ev(t0, t1, "Head", "{\\an5\\pos(540,%d)\\fad(90,90)\\t(80,640,0.7,\\fscx66\\fscy66\\alpha&H30&)}kleiner," % SUB_Y, layer=2)
    SRT_ROWS.append((t0, t1, "kleiner,"))

    # --- Wendepunkt: "Du hast einen Wert in dir." --------------------------
    t0, t1 = to_out(29.55), to_out(31.95)
    for words, y in (([("Du", 29.64), ("hast", 30.22), ("einen", 30.70)], 1262),
                     ([("Wert", 30.94, GOLD), ("in", 31.34), ("dir.", 31.50)], 1396)):
        ev(t0, t1, "Head", "{\\an5\\q2\\move(540,%d,540,%d,0,1500)\\fad(0,160)}" % (y + 10, y)
           + focus_words(words, t0, dur=300), layer=2)
    SRT_ROWS.append((to_out(29.6), t1, "Du hast einen Wert in dir."))

    # --- Podest: "dich" steigt auf die Linie --------------------------------
    LINE_Y, HALF = 1352, 160
    g0, g1 = to_out(45.72), seg_end_out("M4")
    t_line = to_out(45.74)
    ms = lambda t: round((t - g0) * 1000)
    # Linie: öffnet sich von der Mitte, wird bei "da hoch" breiter
    rect = "m 0 0 l %d 0 l %d 4 l 0 4" % (2 * 280, 2 * 280)
    t_wide = to_out(49.22)
    ev(g0, g1, "Shape",
       "{\\an7\\pos(%d,%d)\\p1\\bord0\\shad0\\1c%s\\fad(0,180)"
       "\\clip(540,%d,540,%d)\\t(%d,%d,0.5,\\clip(%d,%d,%d,%d))\\t(%d,%d,0.5,\\clip(%d,%d,%d,%d))}%s"
       % (540 - 280, LINE_Y, GOLD, LINE_Y - 2, LINE_Y + 5,
          ms(t_line), ms(t_line) + 380, 540 - HALF, LINE_Y - 2, 540 + HALF, LINE_Y + 5,
          ms(t_wide), ms(t_wide) + 500, 540 - 280, LINE_Y - 2, 540 + 280, LINE_Y + 5, rect), layer=3)
    # "dich": taucht aus der Linie auf (Maske = alles oberhalb der Linie), Landung bei "stellen"
    r0, r1 = to_out(46.96), to_out(46.96) + 0.55
    y_hidden, y_land = LINE_Y + 120, LINE_Y - 6
    frames = int(round((r1 - r0) * FPS))
    style = "{\\an2\\clip(0,0,%d,%d)\\pos(540,%d)}dich"
    ev(g0, r0, "Head", style % (W, LINE_Y - 1, y_hidden), layer=4)
    for k in range(frames):
        u = (k + 1) / frames
        y = y_hidden + (y_land - y_hidden) * (1 - (1 - u) ** 3)
        ev(r0 + k / FPS, r0 + (k + 1) / FPS, "Head", style % (W, LINE_Y - 1, round(y)), layer=4)
    ev(r1, g1, "Head", "{\\an2\\clip(0,0,%d,%d)\\pos(540,%d)\\fad(0,180)}dich" % (W, LINE_Y - 1, y_land), layer=4)
    # Beschriftung unter der Linie, Wort für Wort
    p1_end = seg_end_out("M3")
    ev(g0, p1_end, "Small", "{\\an5\\q2\\pos(540,%d)\\fad(0,120)}" % (LINE_Y + 62)
       + focus_words([("dich", 45.76), ("auf", 46.00), ("diesen", 46.16), ("Podest", 46.42, GOLD),
                      ("stellen.", 46.98)], g0, dur=200, blur=6), layer=2)
    SRT_ROWS.append((g0, p1_end, "dich auf diesen Podest stellen."))
    p2 = to_out(47.62)
    for words, y in (([("Und", 47.72), ("dann", 47.80), ("nimmst", 47.90), ("du", 48.16), ("die", 48.24),
                       ("anderen", 48.40)], LINE_Y + 62),
                     ([("mit", 48.66), ("auch", 48.88), ("noch", 49.04), ("da", 49.20), ("hoch.", 49.36, GOLD)],
                      LINE_Y + 122)):
        ev(p2, g1, "Small", "{\\an5\\q2\\pos(540,%d)\\fad(0,160)}" % y
           + focus_words(words, p2, dur=200, blur=6), layer=2)
    SRT_ROWS.append((p2, g1, "Und dann nimmst du die anderen mit auch noch da hoch."))

    # --- Symbole: Kommentar & Lesezeichen -----------------------------------
    pop = "\\fscx60\\fscy60\\3a&HFF&\\t(%d,%d,\\fscx110\\fscy110\\3a&H00&)\\t(%d,%d,\\fscx100\\fscy100)"
    bubble = ("m 16 0 l 56 0 b 65 0 72 7 72 16 l 72 38 b 72 47 65 54 56 54 l 30 54 l 15 67 l 17 54 "
              "l 16 54 b 7 54 0 47 0 38 l 0 16 b 0 7 7 0 16 0")
    t0, t1 = to_out(snap(28.38)), to_out(29.55)
    tp = round((to_out(28.72) - t0) * 1000)
    ev(t0, t1, "Shape", "{\\an5\\pos(540,1222)\\p1\\1a&HFF&\\3c%s\\bord3.2\\shad0\\fad(0,120)%s}%s"
       % (WHITE, pop % (tp, tp + 140, tp + 140, tp + 260), bubble), layer=3)
    mark = "m 0 4 b 0 2 2 0 4 0 l 44 0 b 46 0 48 2 48 4 l 48 64 l 24 47 l 0 64 l 0 4"
    t0, t1 = to_out(snap(52.60)), to_out(snap(53.80))
    tf = round((to_out(53.10) - t0) * 1000)
    ev(t0, t1, "Shape", "{\\an5\\pos(540,1222)\\p1\\1a&HFF&\\1c%s\\3c%s\\bord3.2\\shad0\\fad(0,120)%s"
       "\\t(%d,%d,\\1a&H00&\\3c%s\\fscx112\\fscy112)\\t(%d,%d,\\fscx100\\fscy100)}%s"
       % (GOLD, WHITE, pop % (0, 140, 140, 260), tf, tf + 120, GOLD, tf + 120, tf + 260, mark), layer=3)


def write_subs():
    EVENTS.clear(), SRT_ROWS.clear()
    build_cards()
    build_specials()
    with open(os.path.join(HERE, "untertitel_animiert.ass"), "w", encoding="utf-8") as f:
        f.write(ASS_HEADER + "\n".join(EVENTS) + "\n")
    rows = sorted(SRT_ROWS)
    with open(OUT_SRT, "w", encoding="utf-8") as f:
        for n, (a, b, t) in enumerate(rows, 1):
            f.write(f"{n}\n{st(a)} --> {st(b)}\n{t}\n\n")
    return rows


# ===========================================================================
# Bild
# ===========================================================================
def source_frames():
    """Quelle einmal auf 30-fps-Raster dekodieren (wahlfreier Zugriff für den Cold Open)."""
    path = os.path.join(BUILD, "src_30fps.bgr")
    n_src = max(b for _, _, b in SEGMENTS) + 2
    size = SRC_W * SRC_H * 3
    if not os.path.exists(path) or os.path.getsize(path) < n_src * size:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-vf",
                        f"fps={FPS},scale=in_color_matrix=bt709:in_range=tv:out_color_matrix=bt709:out_range=full,format=bgr24",
                        "-f", "rawvideo", path], check=True)
    n = os.path.getsize(path) // size
    return np.memmap(path, np.uint8, "r", shape=(n, SRC_H, SRC_W, 3))


def affine(z):
    s = BASE * z
    ax, ay = ANCHOR
    return np.float32([[s, 0, ax * BASE - s * ax], [0, s, ay * BASE - s * ay]])


_YY, _XX = np.mgrid[0:H, 0:W].astype(np.float32)
WARM = np.array([0.42, 0.74, 1.0], np.float32)       # BGR – Farbe des Lampenlichts im Bild
FLASH = np.array([0.86, 0.93, 1.0], np.float32)


def gradient_mask():
    y0, a = GRADIENT
    u = np.clip((_YY[:, :1] - y0) / (H - y0), 0, 1)
    return (1.0 - a * ease(u))[:, :, None]


def light_amount(t):
    """(Lichtschleier von links, Blitz) für Ausgabezeit t."""
    leak = 0.0
    for t0, peak, rise, fall in ((0.0, 0.42, 0.05, 0.9), (to_out(30.94), 0.20, 0.35, 1.6)):
        if t0 - rise <= t <= t0 + fall * 3:
            leak = max(leak, peak * (min(1, (t - t0 + rise) / rise) if t < t0 else np.exp(-(t - t0) / fall)))
    d = t - T_CUT
    flash = 0.0
    if -0.11 <= d < 0:
        flash = 0.65 * (1 + d / 0.11) ** 2
    elif 0 <= d < 0.5:
        flash = 0.65 * np.exp(-d / 0.09)
    return leak, flash


def render_frame(img, z, t, mask):
    out = cv2.warpAffine(img, affine(z), (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    f = out.astype(np.float32) / 255
    leak, flash = light_amount(t)
    if leak > 0.003:
        cx = -260 + 520 * min(1.0, t / 2.0) if t < 3 else -200
        g = np.exp(-(((_XX - cx) / 620) ** 2 + ((_YY - 760) / 900) ** 2))[:, :, None]
        f = 1 - (1 - f) * (1 - g * WARM * leak)
    if flash > 0.003:
        f = 1 - (1 - f) * (1 - FLASH * flash)
    f *= mask
    return (np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8)


# ===========================================================================
# Ton
# ===========================================================================
def read_wav(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        return a.reshape(-1, w.getnchannels())


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2), w.setsampwidth(2), w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def build_voice(path):
    chains, labels = [], []
    for i, (name, a, b) in enumerate(SEGMENTS):
        a, b = a / FPS, b / FPS
        fin = "afade=t=in:d=0.012," if i else ""
        fout = f"afade=t=out:st={b - a - (0.15 if i == len(SEGMENTS) - 1 else 0.012):.4f}:d={0.15 if i == len(SEGMENTS) - 1 else 0.012}"
        chains.append(f"[0:a]atrim=start={a:.5f}:end={b:.5f},asetpts=PTS-STARTPTS,aresample={SR},{fin}{fout}[s{i}]")
        labels.append(f"[s{i}]")
    chains.append("".join(labels) + f"concat=n={len(SEGMENTS)}:v=0:a=1,highpass=f=80,"
                  "deesser=i=0.35:m=0.5:f=0.5,"
                  "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1[v]")
    pre = os.path.join(BUILD, "voice_pre.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", ";".join(chains),
                    "-map", "[v]", "-ac", "2", "-c:a", "pcm_s16le", pre], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"{ln},aresample={SR}",
                    "-c:a", "pcm_s16le", path], check=True)


def synth_sfx(kind, rng):
    if kind == "click":     # weicher, kurzer "Tap" (Holzklang statt Klick-Knacken)
        t = np.arange(int(0.25 * SR)) / SR
        s = (np.sin(2 * np.pi * 1650 * t) * np.exp(-t / 0.018) + 0.6 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.03))
        return s / np.abs(s).max(), 0.0
    if kind in ("impact", "hit"):
        t = np.arange(int(1.2 * SR)) / SR
        f = 46 + 44 * np.exp(-t / 0.05)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
        air = rng.standard_normal(len(t)) * np.exp(-t / (0.012 if kind == "impact" else 0.05))
        air = np.convolve(air, np.ones(10) / 10, mode="same")
        s = body + (0.3 if kind == "impact" else 0.5) * air
        s *= np.minimum(1, t / 0.002)
        return s / np.abs(s).max(), 0.0
    if kind == "rise":      # sanfter Aufwärts-Whoosh, Höhepunkt nach 0.55 s
        r = music.riser(0.55, rng)
        tail = r[-1] * np.exp(-np.arange(int(0.25 * SR)) / SR / 0.06)
        return np.concatenate([r, tail]), 0.55
    raise ValueError(kind)


def build_sfx():
    rng = np.random.default_rng(5)
    buf = np.zeros((int(TOTAL * SR) + SR, 2))
    for kind, ref, db in SFX:
        s, peak = synth_sfx(kind, rng)
        music.add(buf, s * 10 ** (db / 20), resolve(ref) - peak)
    return buf[: int(TOTAL * SR)]


def duck_gain(voice):
    """Musik unter der Stimme um ~7 dB absenken (weich, 60 ms Attack / 450 ms Release)."""
    hop = 480
    v = voice.mean(1)
    n = len(v) // hop + 1
    rms = np.sqrt(np.array([np.mean(v[i * hop:(i + 1) * hop] ** 2) if i * hop < len(v) else 0 for i in range(n)]) + 1e-12)
    active = (20 * np.log10(rms) > -42).astype(float)
    g = np.zeros(n)
    for i in range(1, n):
        k = 0.17 if active[i] > g[i - 1] else 0.022
        g[i] = g[i - 1] + k * (active[i] - g[i - 1])
    gain = 10 ** (-7 * g / 20)
    return np.repeat(gain, hop)[: len(v)]


def build_audio():
    voice_path = os.path.join(BUILD, "voice.wav")
    build_voice(voice_path)
    voice = read_wav(voice_path)
    n = int(TOTAL * SR)
    voice = np.pad(voice, ((0, max(0, n - len(voice))), (0, 0)))[:n]
    sfx = build_sfx()
    t_open = to_out(29.60)
    mus, info = music.compose(TOTAL, T_CUT, t_open)
    mus = mus[:n] * duck_gain(voice)[:, None]
    mus_level = 10 ** (-11.0 / 20)
    with_music = voice + sfx + mus * mus_level
    no_music = voice + sfx
    for x in (with_music, no_music):
        peak = np.abs(x).max()
        if peak > 0.89:
            x *= 0.89 / peak
    write_wav(os.path.join(BUILD, "mix_musik.wav"), with_music)
    write_wav(os.path.join(BUILD, "mix_ohne_musik.wav"), no_music)
    write_wav(os.path.join(BUILD, "musik_solo.wav"), mus * mus_level)
    return info


# ===========================================================================
# Render
# ===========================================================================
def vfilter():
    ass = os.path.join(HERE, "untertitel_animiert.ass")
    return f"{GRADE},ass='{ass}':fontsdir='{FONTS}',scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"


def render():
    os.makedirs(BUILD, exist_ok=True)
    write_subs()
    print("Ton …", flush=True)
    info = build_audio()
    print(f"  Musik: {info['bpm']:.1f} BPM, Takt {info['bar']:.3f} s, Teil B {info['bars_b']} Takte")
    src = source_frames()
    plan, mask = frame_plan(), gradient_mask()
    print(f"Bild … {N_FRAMES} Frames, {TOTAL:.2f} s", flush=True)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", os.path.join(BUILD, "mix_musik.wav"),
         "-vf", vfilter(), "-map", "0:v", "-map", "1:a", *X264, "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-movflags", "+faststart",
         "-metadata", "title=Paki Akin – Selbstwert", OUT_MAIN], stdin=subprocess.PIPE)
    for k, (seg, f, z) in enumerate(plan):
        enc.stdin.write(render_frame(src[f], z, k / FPS, mask).tobytes())
        if (k + 1) % 300 == 0:
            print(f"  {k + 1}/{N_FRAMES}", flush=True)
    enc.stdin.close()
    if enc.wait():
        sys.exit("Render fehlgeschlagen")
    # Version ohne Musik: identisches Bild, nur andere Tonspur
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", OUT_MAIN, "-i", os.path.join(BUILD, "mix_ohne_musik.wav"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
                    "-movflags", "+faststart", OUT_NOMUSIC], check=True)
    print("fertig:", OUT_MAIN)


def preview(t_out, path):
    write_subs()
    src = source_frames()
    plan, mask = frame_plan(), gradient_mask()
    k = min(int(round(t_out * FPS)), N_FRAMES - 1)
    seg, f, z = plan[k]
    raw = render_frame(src[f], z, k / FPS, mask)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                    "-r", str(FPS), "-i", "-", "-vf", f"setpts=PTS+{k}/{FPS}/TB,{vfilter()}",
                    "-frames:v", "1", path], input=raw.tobytes(), check=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--subs-only", action="store_true")
    ap.add_argument("--preview", type=float, nargs="+")
    ap.add_argument("--audio-only", action="store_true")
    args = ap.parse_args()
    if args.audio_only:
        os.makedirs(BUILD, exist_ok=True)
        print(build_audio())
    elif args.subs_only:
        for a, b, t in write_subs():
            print(f"{a:6.2f}-{b:6.2f}  {t}")
        print(f"Länge: {TOTAL:.2f} s, Schnitt Cold Open bei {T_CUT:.2f} s")
    elif args.preview:
        os.makedirs(BUILD, exist_ok=True)
        for t in args.preview:
            preview(t, os.path.join(BUILD, f"preview_{t:05.2f}.png"))
    else:
        render()
