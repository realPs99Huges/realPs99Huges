#!/usr/bin/env python3
"""Numerologie-Serie – Zahl 3 (geboren am 3., 12. oder 30.)  –  python3 video_zahl_3.py [--preview t …]"""
import engine
import serie
from engine import GOLD, keep_ranges
from serie import LAMP, TOP

serie.paths(globals(), 3)

TEASER = [(31.40, 33.76),     # "Hör auf zu prokrastinieren."
          (37.38, 38.74)]     # "Das ist ein Manko von dir."
KEEP = keep_ranges(0.0, 63.40, trims=[
    (1.38, 1.76, 0.30), (6.60, 7.42, 0.34), (11.06, 11.64, 0.34), (33.70, 34.12, 0.30), (36.94, 37.44, 0.30),
    (42.30, 42.82, 0.30), (47.02, 47.48, 0.30), (48.04, 48.94, 0.34), (60.64, 61.02, 0.30)])

SHOTS = [("T", 31.38, 33.78, 1.22, 1.28, "lin"), ("T", 37.36, 38.76, 1.28, 1.34, "lin")] + serie.shots([
    (0.0, 1.00), (7.30, 1.12), (11.50, 1.04), (16.00, 1.16), (18.30, 1.06), (21.60, 1.20), (23.75, 1.04),
    (26.30, 1.10), (31.20, 1.00), (33.90, 1.16), (37.20, 1.26), (38.80, 1.06), (42.60, 1.20), (45.50, 1.04),
    (49.00, 1.12), (53.20, 1.00), (57.60, 1.10), (59.20, 1.18), (60.95, 1.00)], 63.41)

CARDS = [
    (0.00, "Du bist am 3., 12.", {"3.": 0.82, "12.": 1.70}),
    (2.50, "oder aber auch am 30.", {"30.": 3.62}),
    (4.50, "geboren, dann ist", {}),
    (5.80, "dieses Video für dich.", {}),
    (7.34, "Unsere Dreier gelten", {"Dreier": 7.94}),
    (9.16, "als die schlauesten", {"schlauesten": 9.62}),
    (10.58, "Menschen.", {}),
    (11.58, "Als Dreier bist du jemand,", {}),
    (13.80, "der sehr lustig ist,", {"lustig": 14.18}),
    (14.92, "sehr humorvoll ist,", {"humorvoll": 15.22}),
    (16.04, "denn du stehst für", {}),
    (17.00, "die kindliche Energie.", {"kindliche Energie": 17.14}),
    (18.36, "Ja, du bist sehr kindlich,", {}),
    (20.20, "sehr humorvoll.", {}),
    (21.64, "Du liebst Spaß", {"Spaß": 22.34}),
    (22.68, "und Abenteuer.", {"Abenteuer": 22.90}),
    (23.80, "Aber zugleich liebst du", {}),
    (25.08, "auch den Ausdruck.", {"Ausdruck": 25.62}),
    (26.36, "Du brauchst Ausdruck,", {}),
    (27.80, "du brauchst Kommunikation,", {"Kommunikation": 28.10}),
    (29.64, "du brauchst Gemeinschaft", {"Gemeinschaft": 30.42}),
    # 31.24–33.95: Headline "und hör auf zu prokrastinieren."
    (33.96, "Denn du schiebst deine", {}),
    (35.32, "Sachen immer wieder auf.", {}),
    (37.24, "Das ist ein Manko von dir.", {"Manko": 37.86}),
    (38.84, "Ein Manko ist", {}),
    (39.64, "auch von dir,", {}),
    (40.20, "dass du von jedem", {}),
    (41.16, "akzeptiert werden musst.", {}),
    (42.76, "Du musst nicht", {"nicht": 43.46}),
    (43.64, "von jedem akzeptiert werden.", {}),
    (45.56, "Du bist sehr tolerant,", {"tolerant": 46.50}),
    (47.56, "aber du hast gleichzeitig", {}),
    (49.84, "auch das Verlangen,", {"Verlangen": 50.34}),
    (50.92, "von jedem akzeptiert", {}),
    (52.28, "werden zu wollen.", {}),
    (53.24, "Gleichzeitig stehst du", {}),
    (54.44, "aber auch für die Umsetzung", {"Umsetzung": 55.14}),
    (55.88, "und für die Materie.", {"Materie": 56.50}),
    (57.72, "Geh in die Umsetzung,", {}),
    (59.24, "bleib in Aktion", {"Aktion": 60.02}),
    # ab 61.00: Schluss-Headline "und drück dich aus."
]
BREAKS = {31.24, 61.00}

LIGHTS = [dict(ref=("cut",), peak=0.32, rise=0.05, fall=0.9, **LAMP),
          dict(ref=("src", 53.28), peak=0.22, rise=0.40, fall=1.4, **LAMP),
          dict(ref=("src", 62.82), peak=0.20, rise=0.40, fall=1.2, **TOP)]
SFX = [("hit", ("teaser", 1), -23.0),
       ("heartbeat", ("teaser", 1, 1.32), -20.0),
       ("hit", ("cut",), -19.0),
       ("impact", ("src", 0.82), -20.0),            # große Zahl
       ("click", ("src", 1.70), -27.0), ("click", ("src", 3.62), -27.0),
       ("rise", ("srcoff", 6.70, 0.55), -27.0),     # Zahl fliegt zum Badge
       ("impact", ("src", 32.76), -22.0),           # "prokrastinieren."
       ("impact", ("src", 53.28), -20.0),           # Wendepunkt – Musik öffnet sich
       ("bell", ("src", 62.84), -26.0)]
MUSIC = {"first_beat": ("cut",), "open": ("src", 53.24), "level_db": -12.5,
         "score": {"intro": "D", "prog_b": ["D", "A", "Bm", "G"], "prog_c": ["G", "A", "D", "Bm"], "final": "D"}}


def specials(p):
    j1 = p.resolve(("teaser", 1))
    serie.trailer(p, [
        (0.0, j1, [([("Hör", 31.60), ("auf", 32.16), ("zu", 32.48)], 1226, "Small"),
                   ([("prokrastinieren.", 32.76, GOLD)], 1338, "Head")], "Hör auf zu prokrastinieren."),
        (j1, p.t_cut - 0.25, [([("Das", 37.44), ("ist", 37.54), ("ein", 37.70)], 1226, "Small"),
                              ([("Manko", 37.88, GOLD), ("von", 38.40), ("dir.", 38.58)], 1338, "Head")],
         "Das ist ein Manko von dir.")])
    serie.number_intro(p, "3", 0.82, [("12 → 1 + 2 = 3", 1.70), ("30 → 3 + 0 = 3", 3.62)], 6.70,
                       pulses=[7.94, 12.10])
    p.headline(p.to_out(31.24), p.to_out(33.95), [
        ([("und", 31.30), ("hör", 31.60), ("auf", 32.16), ("zu", 32.48)], 1262, "Head"),
        ([("prokrastinieren.", 32.76, GOLD)], 1396, "Head"),
    ], settle=900, srt="und hör auf zu prokrastinieren.")
    p.headline(p.to_out(61.00), p.total, [
        ([("und", 61.06), ("drück", 61.40)], 1262, "Head"),
        ([("dich", 62.18), ("aus.", 62.84, GOLD)], 1396, "Head"),
    ], settle=1400, dur=300, fade_out=300, srt="und drück dich aus.")


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
