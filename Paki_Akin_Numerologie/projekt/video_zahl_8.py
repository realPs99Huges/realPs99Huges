#!/usr/bin/env python3
"""Numerologie-Serie – Zahl 8 (geboren am 8., 17. oder 26.)  –  python3 video_zahl_8.py [--preview t …]"""
import engine
import serie
from engine import GOLD, WHITE, keep_ranges
from serie import LAMP, TOP

serie.paths(globals(), 8)

TEASER = [(31.80, 33.46),     # "Ich muss die Dinge kontrollieren."
          (21.04, 22.92)]     # "Dein allergrößtes Manko:"  – Cliffhanger, die Antwort kommt erst später
KEEP = keep_ranges(0.0, 66.30, trims=[
    (4.00, 4.38, 0.30), (20.68, 21.10, 0.32), (23.94, 24.28, 0.30), (33.40, 33.78, 0.30), (46.32, 46.68, 0.30),
    (48.58, 48.94, 0.30), (56.22, 56.70, 0.30), (59.64, 60.20, 0.32)])

SHOTS = [("T", 31.78, 33.48, 1.24, 1.30, "lin"), ("T", 21.02, 22.94, 1.18, 1.26, "lin")] + serie.shots([
    (0.0, 1.00), (6.70, 1.12), (8.50, 1.02), (14.80, 1.14), (18.10, 1.22), (21.00, 1.00), (27.45, 1.10),
    (30.25, 1.18), (31.75, 1.26), (33.85, 1.00), (37.40, 1.08), (39.80, 1.14), (42.70, 1.04), (46.50, 1.16),
    (48.80, 1.04), (53.15, 1.14), (56.50, 1.06), (60.10, 1.14), (63.60, 1.00)], 66.31)

CARDS = [
    (0.00, "Du bist am 8., 17.", {"8.": 0.58, "17.": 0.98}),
    (1.56, "oder am 26. geboren,", {"26.": 2.10}),
    (4.28, "dann bist du eine", {}),
    (5.24, "sehr starke Persönlichkeit.", {"starke Persönlichkeit": 5.54}),
    (6.76, "Du stehst für Materie.", {"Materie": 7.54}),
    (8.52, "Bei dir dreht sich", {}),
    (9.64, "alles um Wohlstand,", {}),
    (11.16, "Materie, Wahrnehmung,", {}),
    (13.08, "aber auch um die Wahrheit.", {}),
    (14.84, "Du bist jemand, der immer", {}),
    (16.28, "nach der Wahrheit strebt.", {"Wahrheit": 16.82}),
    (18.12, "Du bist aber auch jemand,", {}),
    (19.40, "der sehr extrem ist.", {"extrem": 19.86}),
    # 21.04–24.10: Headline "Dein allergrößtes Manko: Gleichgewicht."
    (24.12, "Dir fällt es", {}),
    (24.92, "absolut schwer,", {}),
    (26.12, "ins Gleichgewicht", {"Gleichgewicht": 26.42}),
    (27.08, "zu kommen.", {}),
    (27.48, "Dir fällt es", {}),
    (28.20, "sowas von schwer,", {}),
    (29.40, "loszulassen.", {"loszulassen": 29.46}),
    (30.28, "Du hast auch oft", {}),
    (31.00, "das Gefühl:", {}),
    (31.72, "„Ich muss die Dinge", {}),
    (32.60, "kontrollieren.“", {"kontrollieren": 32.66}),
    (33.88, "Was du lernen darfst,", {}),
    (35.64, "ist Kontrolle abgeben.", {"Kontrolle abgeben": 36.10}),
    (37.40, "Was du lernen darfst,", {}),
    (38.52, "ist in die Führung gehen.", {"Führung": 39.06}),
    (39.80, "Du gehörst in die Führung,", {}),
    (41.08, "du bist hier, um zu leaden.", {"leaden": 41.94}),
    (42.68, "Du bist hier, um andere", {}),
    (44.36, "Menschen in ihre Kraft", {"Kraft": 45.38}),
    (45.80, "zu bringen.", {}),
    (46.52, "Ja, du bist auch", {}),
    (47.48, "sehr spirituell.", {"spirituell": 47.78}),
    (48.84, "Mit der 8 solltest du", {}),
    (50.12, "aber auch Acht geben", {"Acht": 50.74}),
    (51.72, "auf deine Gesundheit.", {"Gesundheit": 52.42}),
    (53.16, "Denn du neigst dazu,", {}),
    (54.44, "in Extremen zu verweilen.", {"Extremen": 54.74}),
    (56.52, "Mit der 8 interessierst du", {}),
    (58.28, "dich auch für das", {}),
    (58.84, "Thema Gesundheit.", {}),
    (60.12, "Mit der 8 stehst du", {}),
    (61.96, "für die absolute Wahrheit,", {"absolute Wahrheit": 62.42}),
    # ab 63.64: Schluss-Headline "deswegen bist du immer ein Wahrheitssuchender."
]
BREAKS = {21.04, 63.64}

LIGHTS = [dict(ref=("cut",), peak=0.32, rise=0.05, fall=0.9, **LAMP),
          dict(ref=("src", 33.92), peak=0.22, rise=0.40, fall=1.4, **LAMP),
          dict(ref=("src", 65.14), peak=0.20, rise=0.40, fall=1.2, **TOP)]
SFX = [("hit", ("teaser", 1), -23.0),
       ("hit", ("cut",), -19.0),
       ("impact", ("src", 0.58), -20.0),
       ("click", ("src", 0.98), -27.0), ("click", ("src", 2.10), -27.0),
       ("rise", ("srcoff", 6.62, 0.55), -27.0),
       ("click", ("src", 10.34), -29.0), ("click", ("src", 11.22), -29.0),
       ("click", ("src", 12.18), -29.0), ("click", ("src", 14.02), -29.0),
       ("impact", ("src", 23.14), -22.0),           # "Gleichgewicht."
       ("impact", ("src", 33.92), -20.0),           # "Was du lernen darfst" – Musik öffnet sich
       ("bell", ("src", 65.16), -26.0)]
MUSIC = {"first_beat": ("cut",), "open": ("src", 33.90), "level_db": -12.5,
         "score": {"intro": "Cm", "prog_b": ["Cm", "Ab", "Eb", "Bb"], "prog_c": ["Eb", "Bb", "Cm", "Ab"], "final": "Eb"}}

GRID = [("Wohlstand", 10.34, 330, 1124), ("Materie", 11.22, 750, 1124),
        ("Wahrnehmung", 12.18, 330, 1200), ("Wahrheit", 14.02, 750, 1200)]


def specials(p):
    j1 = p.resolve(("teaser", 1))
    serie.trailer(p, [
        (0.0, j1, [([("„Ich", 31.86), ("muss", 31.94), ("die", 32.18)], 1226, "Small"),
                   ([("Dinge", 32.34), ("kontrollieren.“", 32.66, GOLD)], 1338, "Head")],
         "„Ich muss die Dinge kontrollieren.“"),
        (j1, p.t_cut - 0.25, [([("Dein", 21.12), ("allergrößtes", 21.38)], 1226, "Small"),
                              ([("Manko:", 22.26, GOLD)], 1338, "Head")], "Dein allergrößtes Manko:")])
    serie.number_intro(p, "8", 0.58, [("17 → 1 + 7 = 8", 0.98), ("26 → 2 + 6 = 8", 2.10)], 6.62,
                       pulses=[49.20, 56.96, 60.64])
    for word, wt, x, y in GRID:     # Wohlstand · Materie · Wahrnehmung · Wahrheit
        t0 = p.to_out(wt) - 0.05
        p.ev(t0, p.to_out(14.80), "Label", "{\\an5\\pos(%d,%d)\\fscx70\\fscy70\\t(0,170,\\fscx100\\fscy100)\\fad(0,300)}"
             % (x, y) + p.focus_words([(word, wt, GOLD)], t0, dur=160, blur=6), 3)
    # "Dein allergrößtes Manko: Gleichgewicht." + Waage, die nie zur Ruhe kommt
    p.headline(p.to_out(21.04), p.to_out(24.10), [
        ([("Dein", 21.12), ("allergrößtes", 21.38), ("Manko:", 22.26)], 1250, "Small"),
        ([("Gleichgewicht.", 23.14, GOLD)], 1362, "Head"),
    ], settle=900, srt="Dein allergrößtes Manko: Gleichgewicht.")
    w0, w1 = p.to_out(23.10), p.to_out(27.40)
    swing = [-9, 7, -6, 8, -7, 5, -8, 6, -5, 7]
    tr = "".join("\\t(%d,%d,0.6,\\frz%d)" % (k * 420, (k + 1) * 420, a) for k, a in enumerate(swing))
    beam = "m 0 0 l 380 0 l 380 6 l 0 6"
    p.shape(w0, w1, 540, 1112, beam, filled=True, color=GOLD,
            extra="\\org(540,1115)\\fad(250,300)" + tr, layer=5)
    p.shape(w0, w1, 540, 1140, "m 22 0 l 44 40 l 0 40 l 22 0", width=3, extra="\\fad(250,300)", layer=5)
    # Schluss
    p.headline(p.to_out(63.64), p.total, [
        ([("deswegen", 63.70), ("bist", 64.10), ("du", 64.42), ("immer", 64.58), ("ein", 64.90)], 1250, "Small"),
        ([("Wahrheitssuchender.", 65.16, GOLD)], 1362, "Head"),
    ], settle=1400, dur=300, fade_out=300, srt="deswegen bist du immer ein Wahrheitssuchender.")


if __name__ == "__main__":
    import sys
    engine.main(sys.modules[__name__])
