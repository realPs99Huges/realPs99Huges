#!/usr/bin/env python3
"""Numerologie-Serie – Zahl 2 (geboren am 2., 11. oder 20.)  –  python3 video_zahl_2.py [--preview t …]"""
import engine
import serie
from engine import GOLD, keep_ranges
from serie import LAMP, TOP

serie.paths(globals(), 2)

TEASER = [(45.38, 47.10),     # "…Konflikt hast mit deiner Mama."
          (37.00, 38.06)]     # "Arbeite daran."
KEEP = keep_ranges(0.0, 54.85, trims=[
    (29.32, 30.04, 0.40), (38.00, 38.46, 0.30), (42.74, 43.28, 0.30), (47.06, 47.42, 0.30)])

SHOTS = [("T", 45.36, 47.12, 1.24, 1.30, "lin"), ("T", 36.98, 38.08, 1.16, 1.22, "lin")] + serie.shots([
    (0.0, 1.00), (5.00, 1.12), (7.70, 1.04), (10.20, 1.16), (12.50, 1.04), (14.60, 1.00), (18.10, 1.14),
    (20.20, 1.22), (22.50, 1.04), (27.30, 1.12), (29.90, 1.22), (31.55, 1.06), (36.95, 1.00), (38.20, 1.10),
    (43.20, 1.18), (47.30, 1.04), (51.40, 1.10)], 54.86)

CARDS = [
    (0.00, "Du bist am 2., 11.", {"2.": 0.66, "11.": 1.22}),
    (1.72, "oder am 20. geboren,", {"20.": 2.26}),
    (3.40, "dann ist dieses", {}),
    (4.04, "Video für dich.", {}),
    (5.00, "Mit der 2 bist du eine", {}),
    (6.20, "sehr feinfühlige Seele.", {"feinfühlige": 6.50}),
    (7.72, "Du spürst sehr viel,", {}),
    (8.84, "du nimmst sehr viel wahr,", {}),
    (10.20, "du hast eine", {}),
    (10.76, "sehr starke Intuition.", {"Intuition": 11.54}),
    (12.52, "Du bist ein", {}),
    (13.16, "gemeinschaftlicher Mensch.", {}),
    (14.60, "Für dich dreht sich", {}),
    (15.48, "alles um Familie,", {}),
    (16.68, "Gemeinschaft, Freunde.", {}),
    (18.12, "Bist aber auch", {}),
    (18.92, "sehr diplomatisch.", {"diplomatisch": 19.22}),
    (20.20, "Nutze deine", {}),
    (21.00, "Diplomatiekraft.", {"Diplomatiekraft": 21.06}),
    (22.52, "Mit der 2 hast du", {}),
    (24.44, "oft das Gefühl,", {}),
    (25.72, "nicht gut genug zu sein.", {"nicht gut genug": 25.80}),
    (27.32, "Mit der 2 hast du auch", {}),
    (28.44, "oft das Gefühl,", {}),
    (29.96, "nicht so viel wert zu sein.", {"nicht so viel wert": 30.02}),
    (31.56, "Du hast immer wieder", {}),
    (32.52, "das Thema mit deinen", {}),
    (33.56, "Selbstzweifeln", {"Selbstzweifeln": 33.62}),
    (34.84, "und mit deinem", {}),
    (35.64, "Selbstwertgefühl.", {"Selbstwertgefühl": 35.70}),
    # 36.98–38.14: Headline "Arbeite daran."
    (38.28, "Mit der 2 kann es", {}),
    (39.40, "auch sein,", {}),
    (39.80, "dass du dich", {}),
    (40.36, "unfassbar gut", {}),
    (41.32, "mit deiner Mama verstehst", {"Mama": 41.78}),
    (43.24, "oder aber auch einen", {}),
    (44.52, "energetischen Konflikt", {"Konflikt": 45.46}),
    (45.96, "hast mit deiner Mama.", {}),
    (47.32, "Bist du am 2., 11.", {}),
    (49.64, "oder aber auch am 20.", {}),
    (51.00, "geboren, schreib es mir", {}),
    (51.96, "sehr, sehr gerne", {}),
    (52.52, "in die Kommentare.", {}),
    (53.24, "Ich freue mich,", {}),
    (53.80, "von dir zu lesen.", {}),
]
BREAKS = {36.98}

LIGHTS = [dict(ref=("cut",), peak=0.32, rise=0.05, fall=0.9, **LAMP),
          dict(ref=("src", 37.06), peak=0.24, rise=0.40, fall=1.4, **TOP)]
SFX = [("hit", ("teaser", 1), -23.0),
       ("hit", ("cut",), -19.0),
       ("impact", ("src", 0.66), -20.0),
       ("click", ("src", 1.22), -27.0), ("click", ("src", 2.26), -27.0),
       ("rise", ("srcoff", 4.75, 0.55), -27.0),
       ("click", ("src", 16.10), -29.0), ("click", ("src", 16.74), -29.0), ("click", ("src", 17.54), -29.0),
       ("impact", ("src", 37.06), -20.0),           # "Arbeite daran." – Musik öffnet sich
       ("click", ("src", 52.74), -24.0),            # Kommentar-Symbol
       ("bell", ("src", 54.34), -27.0)]
MUSIC = {"first_beat": ("cut",), "open": ("src", 37.00), "level_db": -12.5,
         "score": {"intro": "Dm", "prog_b": ["Dm", "Bb", "F", "C"], "prog_c": ["F", "C", "Dm", "Bb"], "final": "F"}}


def specials(p):
    j1 = p.resolve(("teaser", 1))
    serie.trailer(p, [
        (0.0, j1, [([("…Konflikt", 45.46), ("hast", 46.02)], 1226, "Small"),
                   ([("mit", 46.34), ("deiner", 46.50), ("Mama.", 46.82, GOLD)], 1338, "Head")],
         "…Konflikt hast mit deiner Mama."),
        (j1, p.t_cut - 0.25, [([("Arbeite", 37.06), ("daran.", 37.70, GOLD)], 1300, "Head")], "Arbeite daran.")])
    serie.number_intro(p, "2", 0.66, [("11 → 1 + 1 = 2", 1.22), ("20 → 2 + 0 = 2", 2.26)], 4.75,
                       pulses=[5.44, 23.12, 27.76, 38.80, 48.08])
    serie.word_row(p, [("Familie", 16.10, 232), ("Gemeinschaft", 16.74, 540), ("Freunde", 17.54, 850)], p.to_out(18.10))
    p.headline(p.to_out(36.98), p.to_out(38.14), [([("Arbeite", 37.06), ("daran.", 37.70, GOLD)], 1330, "Head")],
               dur=220, settle=600, srt="Arbeite daran.")
    serie.comment_icon(p, p.to_out(52.40), p.to_out(53.24), p.to_out(52.74))


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
