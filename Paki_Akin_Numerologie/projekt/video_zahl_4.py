#!/usr/bin/env python3
"""Numerologie-Serie – Zahl 4 (geboren am 4., 13. oder 22.)  –  python3 video_zahl_4.py [--preview t …]"""
import engine
import serie
from engine import GOLD, WHITE, keep_ranges
from serie import LAMP, TOP

serie.paths(globals(), 4)

TEASER = [(38.86, 41.62),     # "sehr ehrlich oder sehr lügnerisch,"
          (10.26, 12.12)]     # "Du gehörst auf die Bühne"
KEEP = keep_ranges(0.0, 67.25, trims=[
    (8.24, 8.68, 0.30), (19.52, 19.92, 0.30), (31.94, 32.34, 0.30), (38.48, 38.92, 0.30), (46.84, 47.24, 0.30),
    (47.60, 48.10, 0.25), (50.60, 51.04, 0.30), (62.94, 63.36, 0.30)])

SHOTS = [("T", 38.84, 41.64, 1.22, 1.28, "lin"), ("T", 10.24, 12.14, 1.14, 1.22, "lin")] + serie.shots([
    (0.0, 1.00), (6.90, 1.12), (10.20, 1.00), (11.98, 1.08), (14.85, 1.16), (17.40, 1.06), (19.85, 1.12),
    (24.20, 1.02), (30.20, 1.16), (33.40, 1.24), (35.95, 1.04), (38.80, 1.00), (41.55, 1.14), (42.90, 1.22),
    (43.95, 1.00), (47.15, 1.10), (50.90, 1.04), (55.55, 1.00), (58.70, 1.08), (60.90, 1.14), (63.10, 1.04)], 67.26)

CARDS = [
    (0.00, "Du bist am 4., 13.", {"4.": 0.82, "13.": 1.62}),
    (2.68, "oder aber auch am 22.", {"22.": 3.94}),
    (4.92, "geboren, dann ist", {}),
    (5.80, "dieses Video für dich.", {}),
    (6.92, "Du bist der Künstler,", {"Künstler": 7.70}),
    (8.60, "der Diplomat.", {"Diplomat": 8.98}),
    # 10.20–11.98: Headline "Du gehörst auf die Bühne"
    (12.00, "und ja, du kannst", {}),
    (12.92, "Menschenleben", {}),
    (13.80, "transformieren.", {"transformieren": 13.86}),
    (14.84, "Wenn wir einen Plan wollen,", {}),
    (16.44, "kommen wir zu dir,", {}),
    (17.40, "denn du hast", {}),
    (18.20, "immer einen Plan.", {"Plan": 19.06}),
    (19.88, "Gerade mit der 4", {}),
    (21.48, "stehst du für Umsetzung,", {"Umsetzung": 23.30}),
    (24.20, "du stehst für die Planung,", {}),
    (25.64, "für die Organisation,", {}),
    (26.92, "für Recht,", {}),
    (27.96, "für Unternehmertum.", {}),
    (30.20, "Deswegen ist es", {}),
    (31.08, "auch selten,", {}),
    (32.36, "dass du für einen Chef", {}),
    (34.04, "arbeiten kannst,", {}),
    (34.76, "der dir im Nacken sitzt,", {}),
    (35.96, "denn du bist sehr", {}),
    (36.60, "freiheitsliebend,", {"freiheitsliebend": 36.66}),
    (37.64, "sehr kreativ,", {"kreativ": 37.94}),
    (38.84, "sehr ehrlich", {}),
    (39.88, "oder sehr lügnerisch,", {}),
    (41.56, "wenn du im Minus lebst.", {"im Minus": 41.94}),
    (42.92, "Entweder oder.", {}),
    (43.96, "Entweder bist du", {}),
    (44.68, "sehr ehrlich", {}),
    (45.40, "oder du lügst sehr viel.", {}),
    (47.16, "Du hast ebenso", {}),
    (48.96, "schauspielerisches Talent.", {"schauspielerisches Talent": 49.22}),
    (50.92, "Ja, du bist Künstler", {"Künstler": 51.62}),
    (52.20, "und du hast", {}),
    (52.92, "schauspielerisches Talent,", {}),
    (54.44, "musikalisches Talent.", {"musikalisches": 54.50}),
    (55.56, "Vielleicht kannst du", {}),
    (56.20, "singen, tanzen, malen,", {}),
    # 58.76–60.90: Headline "du bist der geborene Künstler"
    (60.92, "mit der starken Intuition.", {"Intuition": 62.10}),
    (63.16, "Schreib mir gerne", {}),
    (64.04, "in die Kommentare rein,", {}),
    (64.92, "was du darüber sagst.", {}),
    (65.96, "Ich freue mich,", {}),
    (66.44, "von dir zu lesen.", {}),
]
BREAKS = {10.20, 58.76}

SPOT = dict(cx=540, cy=-120, rx=380, ry=1000)      # schmaler Bühnen-Spot von oben
LIGHTS = [dict(ref=("cut",), peak=0.32, rise=0.05, fall=0.9, **LAMP),
          dict(ref=("src", 11.46), peak=0.30, rise=0.30, fall=1.0, **SPOT),
          dict(ref=("src", 47.20), peak=0.22, rise=0.40, fall=1.4, **LAMP),
          dict(ref=("src", 60.26), peak=0.20, rise=0.30, fall=1.0, **SPOT)]
SFX = [("hit", ("teaser", 1), -23.0),
       ("hit", ("cut",), -19.0),
       ("impact", ("src", 0.82), -20.0),
       ("click", ("src", 1.62), -27.0), ("click", ("src", 3.94), -27.0),
       ("rise", ("srcoff", 6.66, 0.55), -27.0),
       ("impact", ("src", 11.46), -21.0),           # "Bühne"
       ("click", ("src", 25.14), -29.0), ("click", ("src", 26.02), -29.0),
       ("click", ("src", 27.30), -29.0), ("click", ("src", 28.66), -29.0),
       ("click", ("src", 39.22), -27.0), ("click", ("src", 40.66), -27.0),
       ("impact", ("src", 47.20), -20.0),           # Talent – Musik öffnet sich
       ("click", ("src", 56.26), -29.0), ("click", ("src", 56.98), -29.0), ("click", ("src", 57.94), -29.0),
       ("click", ("src", 64.18), -24.0),
       ("bell", ("src", 66.98), -27.0)]
MUSIC = {"first_beat": ("cut",), "open": ("src", 47.16), "level_db": -12.5,
         "score": {"intro": "Em", "prog_b": ["Em", "C", "G", "D"], "prog_c": ["G", "D", "Em", "C"], "final": "G"}}

GRID = [("Planung", 25.14, 330, 1124), ("Organisation", 26.02, 750, 1124),
        ("Recht", 27.30, 330, 1200), ("Unternehmertum", 28.66, 750, 1200)]


def specials(p):
    j1 = p.resolve(("teaser", 1))
    serie.trailer(p, [
        (0.0, j1, [([("sehr", 38.92), ("ehrlich", 39.22, GOLD)], 1226, "Small"),
                   ([("oder", 39.94), ("sehr", 40.34), ("lügnerisch,", 40.66)], 1338, "Head")],
         "sehr ehrlich oder sehr lügnerisch,"),
        (j1, p.t_cut - 0.25, [([("Du", 10.30), ("gehörst", 10.42)], 1226, "Small"),
                              ([("auf", 11.06), ("die", 11.30), ("Bühne", 11.48, GOLD)], 1338, "Head")],
         "Du gehörst auf die Bühne")])
    serie.number_intro(p, "4", 0.82, [("13 → 1 + 3 = 4", 1.62), ("22 → 2 + 2 = 4", 3.94)], 6.66, pulses=[20.80])
    p.headline(p.to_out(10.20), p.to_out(11.98), [
        ([("Du", 10.30), ("gehörst", 10.42)], 1262, "Head"),
        ([("auf", 11.06), ("die", 11.30), ("Bühne", 11.48, GOLD)], 1396, "Head"),
    ], dur=220, settle=600, srt="Du gehörst auf die Bühne")
    for word, wt, x, y in GRID:     # Planung · Organisation · Recht · Unternehmertum
        t0 = p.to_out(wt) - 0.05
        p.ev(t0, p.to_out(30.10), "Label", "{\\an5\\pos(%d,%d)\\fscx70\\fscy70\\t(0,170,\\fscx100\\fscy100)\\fad(0,300)}"
             % (x, y) + p.focus_words([(word, wt, GOLD)], t0, dur=160, blur=6), 3)
    # ehrlich | lügnerisch – zwei Seiten, beim zweiten "Entweder … oder" leuchtet jede Seite noch einmal auf
    s0, s1 = p.to_out(39.18), p.to_out(46.84)
    for word, wt, x, col, again in (("ehrlich", 39.22, 300, GOLD, 44.90), ("lügnerisch", 40.66, 780, WHITE, 45.86)):
        t0 = p.to_out(wt) - 0.05
        m = round((p.to_out(again) - t0) * 1000)
        p.ev(t0, s1, "Label", "{\\an5\\pos(%d,1160)\\fad(0,300)\\t(%d,%d,\\fscx118\\fscy118)\\t(%d,%d,\\fscx100\\fscy100)}"
             % (x, m, m + 160, m + 160, m + 520) + p.focus_words([(word, wt, col)], t0, dur=200, blur=6), 3)
    p.shape(p.to_out(39.92), s1, 540, 1160, "m 0 0 l 3 0 l 3 110 l 0 110", filled=True,
            extra="\\fad(250,300)", layer=3)
    serie.word_row(p, [("singen", 56.26, 270), ("tanzen", 56.98, 540), ("malen", 57.94, 810)], p.to_out(58.70))
    p.headline(p.to_out(58.76), p.to_out(60.90), [
        ([("du", 58.82), ("bist", 58.98), ("der", 59.22)], 1250, "Small"),
        ([("geborene", 59.46), ("Künstler", 60.26, GOLD)], 1362, "Head"),
    ], settle=1000, srt="du bist der geborene Künstler")
    serie.comment_icon(p, p.to_out(63.96), p.to_out(64.90), p.to_out(64.18))


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
