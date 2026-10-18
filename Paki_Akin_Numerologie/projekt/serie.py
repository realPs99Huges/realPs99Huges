"""Gemeinsame Gestaltung der Numerologie-Serie (Zahl 2, 3, 4, 8).

Wiedererkennbare Elemente jeder Folge:
  * Trailer aus 2 Fragmenten mit Mikro-Blitz, Abdunklung, Lichtblitz in den Einstieg
  * große goldene Zahl beim Datum, darunter die Quersummen (z. B. 12 -> 1 + 2 = 3)
  * die Zahl schrumpft zu einem Badge oben links, das bis zum Ende bleibt und
    bei jeder Erwähnung der Zahl kurz pulsiert
"""
import os

import engine
from engine import GOLD, WHITE, FPS

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SUB_Y = 1330
GRADIENT = (1060, 0.34)
ANCHOR = (400.0, 410.0)
DIP = (0.40, 0.65)
LAMP = dict(cx=-260, cy=760, rx=620, ry=900, drift=260)
TOP = dict(cx=540, cy=-220, rx=650, ry=950)

BIG = (890, 470, 380)       # große Zahl: x, y, Schriftgröße
BADGE = (128, 300, 112)     # Badge oben links


def paths(cfg_globals, zahl):
    """Setzt die Ausgabepfade einer Folge."""
    out = os.path.join(ROOT, f"Zahl_{zahl}")
    os.makedirs(out, exist_ok=True)
    cfg_globals.update(
        SLUG=f"zahl_{zahl}", TITLE=f"Paki Akin – Numerologie: Zahl {zahl}",
        SRC=os.path.join(HERE, "source", f"original_zahl_{zahl}.mp4"),
        FACE_TRACK=os.path.join(HERE, f"face_track_zahl_{zahl}.json"),
        OUT_MAIN=os.path.join(out, f"Paki_Akin_Zahl_{zahl}_1080x1920.mp4"),
        OUT_NOMUSIC=os.path.join(out, f"Paki_Akin_Zahl_{zahl}_ohne_Musik_1080x1920.mp4"),
        OUT_SRT=os.path.join(out, f"Paki_Akin_Zahl_{zahl}_Untertitel.srt"),
        ASS=os.path.join(HERE, f"untertitel_zahl_{zahl}.ass"),
        SUB_Y=SUB_Y, GRADIENT=GRADIENT, ANCHOR=ANCHOR, DIP=DIP)


def shots(points, end, drift=0.025):
    """[(Quellzeit, Zoom), …] -> Einstellungen mit leichter Drift bis zur nächsten Marke."""
    out = []
    for (a, z), (b, _) in zip(points, points[1:] + [(end, None)]):
        out.append(("M", a, b, z, z * (1 + drift), "lin"))
    return out


def circle(r):
    """Kreis mit Mittelpunkt (r, r) – nur positive Koordinaten, damit \\an5 exakt zentriert."""
    k = 0.5523 * r
    pts = [(0, -r), (k, -r), (r, -k), (r, 0), (r, k), (k, r), (0, r), (-k, r), (-r, k), (-r, 0), (-r, -k), (-k, -r), (0, -r)]
    f = lambda i: f"{pts[i][0] + r:.1f} {pts[i][1] + r:.1f}"
    return f"m {f(0)} b {f(1)} {f(2)} {f(3)} b {f(4)} {f(5)} {f(6)} b {f(7)} {f(8)} {f(9)} b {f(10)} {f(11)} {f(12)}"


def slam(p, t0, t1, lines, seg="T"):
    """Trailer-Typografie: Wörter schnappen schnell und scharf ins Bild."""
    for words, y, style in lines:
        p.ev(t0, t1, style, "{\\an5\\q2\\pos(540,%d)\\fscx108\\fscy108\\t(0,180,0.5,\\fscx100\\fscy100)\\fad(0,60)}" % y
             + p.focus_words(words, t0, seg, dur=110, blur=5), 2)


def trailer(p, frags):
    """frags: [(t0_out, t1_out, lines, srt_text)]"""
    for t0, t1, lines, text in frags:
        slam(p, t0, t1, lines)
        p.srt.append((t0 + 0.02, t1, text))


def number_intro(p, num, t_num, eqs, t_shrink, pulses=()):
    """Große Zahl beim Datum, Quersummen darunter, dann Flug zum Badge (bleibt bis zum Ende)."""
    bx, by, bfs = BIG
    sx, sy, sfs = BADGE
    look = "\\1c%s\\3c&H000000&\\3a&H60&\\bord5\\blur2\\shad0" % GOLD
    t0, t1 = p.to_out(t_num) - 0.04, p.to_out(t_shrink)
    p.ev(t0, t1, "Head", "{\\an5\\pos(%d,%d)\\fs%d%s\\alpha&HFF&\\fscx140\\fscy140"
         "\\t(0,240,0.5,\\fscx100\\fscy100\\alpha&H00&)}%s" % (bx, by, bfs, look, num), 5)
    for k, (text, ts) in enumerate(eqs):
        e0 = p.to_out(ts) - 0.04
        p.ev(e0, t1 + 0.15, "Label", "{\\an5\\pos(%d,%d)\\fs52\\alpha&HFF&\\blur5\\t(0,220,\\alpha&H00&\\blur0.6)"
             "\\fad(0,180)}%s" % (bx, by + 235 + 70 * k, text), 4)
    fly = 0.55
    def frame(u):
        e = engine.ease(u)
        return "{\\an5\\pos(%d,%d)\\fs%d%s}%s" % (round(bx + (sx - bx) * e), round(by + (sy - by) * e),
                                                 round(bfs + (sfs - bfs) * e), look, num)
    p.frames(t1, t1 + fly, "Head", frame, 5)
    # Badge: Zahl + Kreis, pulsiert bei jeder Erwähnung der Zahl
    pul = "".join("\\t(%d,%d,\\fscx124\\fscy124)\\t(%d,%d,\\fscx100\\fscy100)"
                  % (m, m + 140, m + 140, m + 420) for m in [round((p.to_out(tp) - (t1 + fly)) * 1000) for tp in pulses] if m > 0)
    p.ev(t1 + fly, p.total, "Head", "{\\an5\\pos(%d,%d)\\fs%d%s\\fad(0,250)%s}%s" % (sx, sy, sfs, look, pul, num), 6)
    p.ev(t1 + fly - 0.15, p.total, "Shape", "{\\an5\\pos(%d,%d)\\p1\\1c&H000000&\\1a&H60&\\3c%s\\bord3\\shad0"
         "\\fad(250,250)%s}%s" % (sx, sy, GOLD, pul, circle(60)), 5)


def comment_icon(p, t0, t1, t_pop, y=1222):
    bubble = ("m 16 0 l 56 0 b 65 0 72 7 72 16 l 72 38 b 72 47 65 54 56 54 l 30 54 l 15 67 l 17 54 "
              "l 16 54 b 7 54 0 47 0 38 l 0 16 b 0 7 7 0 16 0")
    tp = round((t_pop - t0) * 1000)
    pop = "\\fscx60\\fscy60\\t(%d,%d,\\fscx110\\fscy110)\\t(%d,%d,\\fscx100\\fscy100)\\fad(120,120)" % (tp, tp + 140, tp + 140, tp + 260)
    p.shape(t0, t1, 540, y, bubble, width=3.2, extra=pop, layer=5)


def word_row(p, words, t_end, y=1196):
    """Stichworte erscheinen nacheinander in einer Reihe: [(Wort, Quellzeit, x)]"""
    for word, wt, x in words:
        t0 = p.to_out(wt) - 0.05
        p.ev(t0, t_end, "Label", "{\\an5\\pos(%d,%d)\\fscx70\\fscy70\\t(0,170,\\fscx100\\fscy100)\\fad(0,300)}" % (x, y)
             + p.focus_words([(word, wt, GOLD)], t0, dur=160, blur=6), 3)
