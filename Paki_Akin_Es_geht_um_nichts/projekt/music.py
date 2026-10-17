"""Eigens komponierte, vollständig synthetisierte Hintergrundmusik (rechtefrei).

Aufbau, passend zur Dramaturgie des jeweiligen Videos:
  Teil A  Intro / Cold Open     leise Klangfläche, Riser in den ersten Taktschlag
  Teil B  Zweifel / Hinführung  Moll-Kadenz, ruhige Einzeltöne, gedämpft
  Teil C  Wendepunkt            öffnet sich: Dur-Kadenz, Klavier-Arpeggien, Bass

Das Tempo wird so gewählt, dass Teil B exakt eine ganze Zahl Takte lang ist:
der erste Taktschlag und die Öffnung fallen damit genau auf die Schnitt- bzw.
Wendepunkte des Videos.
"""
import numpy as np
from scipy.signal import fftconvolve

SR = 48000
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name):
    n, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (octave + 1) - 69) / 12)


# Akkorde: (Bass, Flächen-Stimmen, Klavier-Arpeggio) – je Video eine eigene Tonart
CHORDS = {
    # D-Dur / h-Moll – "Gott sagt niemals nein"
    "Bm": ("B1", ["F#3", "B3", "D4"], ["B3", "F#4", "B4", "D5", "F#5", "D5", "B4", "F#4"]),
    "G":  ("G1", ["G3", "B3", "D4"], ["G3", "D4", "G4", "B4", "D5", "B4", "G4", "D4"]),
    "D":  ("D2", ["F#3", "A3", "D4"], ["D4", "A4", "D5", "F#5", "A5", "F#5", "D5", "A4"]),
    "A":  ("A1", ["E3", "A3", "C#4"], ["A3", "E4", "A4", "C#5", "E5", "C#5", "A4", "E4"]),
    # c-Moll / Es-Dur – "Selbstsabotage"
    "Cm": ("C2", ["G3", "C4", "D#4"], ["C4", "G4", "C5", "D#5", "G5", "D#5", "C5", "G4"]),
    "Ab": ("G#1", ["G#3", "C4", "D#4"], ["G#3", "D#4", "G#4", "C5", "D#5", "C5", "G#4", "D#4"]),
    "Eb": ("D#2", ["G3", "A#3", "D#4"], ["D#4", "A#4", "D#5", "G5", "A#5", "G5", "D#5", "A#4"]),
    # G-Dur / e-Moll – "Es geht um nichts"
    "Em": ("E2", ["E3", "G3", "B3"], ["E3", "B3", "E4", "G4", "B4", "G4", "E4", "B3"]),
    # F-Dur / d-Moll – "Topf und Deckel"
    "Dm": ("D2", ["F3", "A3", "D4"], ["D4", "A4", "D5", "F5", "A5", "F5", "D5", "A4"]),
    "Bb": ("A#1", ["F3", "A#3", "D4"], ["A#3", "F4", "A#4", "D5", "F5", "D5", "A#4", "F4"]),
    "F":  ("F1", ["F3", "A3", "C4"], ["F3", "C4", "F4", "A4", "C5", "A4", "F4", "C4"]),
    "C":  ("C2", ["E3", "G3", "C4"], ["C4", "G4", "C5", "E5", "G5", "E5", "C5", "G4"]),
}


def _env(n, attack, release, total):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(attack, 1e-3))
    tail = total - release
    e *= np.where(t > tail, np.clip(1 - (t - tail) / release, 0, 1), 1.0)
    return e


def pad_voice(freq, dur, rng, attack=0.9, release=1.2):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for detune, pan in ((-0.0028, 0.3), (0.0031, 0.7)):
        f = freq * (1 + detune)
        sig = np.zeros(n)
        for h in range(1, 9):
            if h * f > 2400:
                break
            sig += np.sin(2 * np.pi * h * f * t + rng.uniform(0, 2 * np.pi)) / h ** 1.5
        out[:, 0] += sig * (1 - pan)
        out[:, 1] += sig * pan
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.17 * t + rng.uniform(0, 6.28))
    return out * (_env(n, attack, release, dur + release) * trem)[:, None]


def piano_note(freq, vel, rng, length=3.5):
    """Gedämpftes ("Felt"-)Klavier: inharmonische Teiltöne, höhere klingen schneller ab."""
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    B = 0.00035
    tau1 = 2.4 * (220 / freq) ** 0.35
    for k in range(1, 13):
        fk = k * freq * np.sqrt(1 + B * k * k)
        if fk > 5000:
            break
        amp = (1 / k ** 1.7) * (vel ** (0.6 + 0.25 * k))
        sig += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau1 / k ** 0.75))
    hammer = rng.standard_normal(n) * np.exp(-t / 0.004) * 0.02 * vel
    sig += np.convolve(hammer, np.ones(24) / 24, mode="same")
    sig *= np.minimum(1, t / 0.005) * np.minimum(1, (length - t) / 0.3)
    return sig * vel


def bass_note(freq, dur, vel=1.0):
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(4 * np.pi * freq * t)
    env = np.minimum(1, t / 0.03) * (0.55 + 0.45 * np.exp(-t / 0.6))
    env *= np.clip((dur + 0.6 - t) / 0.6, 0, 1)
    return sig * env * vel


def riser(dur, rng):
    """Leiser Rauschanstieg mit steigendem Bandpass – endet exakt am Synchronpunkt."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    fc = 300 + 3200 * (t / dur) ** 2
    out, lp, bp = np.zeros(n), 0.0, 0.0
    for i in range(n):
        f = 2 * np.sin(np.pi * fc[i] / SR)
        hp = x[i] - lp - 1.1 * bp
        bp += f * hp
        lp += f * bp
        out[i] = bp
    out *= (t / dur) ** 2.5
    return out / (np.abs(out).max() + 1e-9)


def reverb_ir(rng, rt=2.4, length=2.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    tau = rt / 6.9
    ir = rng.standard_normal((n, 2)) * np.exp(-t / tau)[:, None]
    k = np.ones(18) / 18          # Höhen dämpfen
    ir = np.stack([np.convolve(ir[:, c], k, mode="same") for c in range(2)], axis=1)
    ir[: int(0.018 * SR)] = 0     # Pre-Delay
    return ir / np.sqrt((ir ** 2).sum() / 2)


def add(buf, sig, start):
    a = int(round(start * SR))
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    if a < 0:
        sig, a = sig[-a:], 0
    b = min(len(buf), a + len(sig))
    if b > a:
        buf[a:b] += sig[: b - a]


def compose(total, t_cut, t_open, score, rng_seed=11):
    """total: Videolänge; t_cut: erster Taktschlag (Ende Intro/Cold Open); t_open: Öffnung der Musik.
    score: {"intro": Akkord, "prog_b": [...], "prog_c": [...], "final": Akkord}"""
    rng = np.random.default_rng(rng_seed)
    n = int((total + 3) * SR)
    pad, pno, bass, fx = (np.zeros((n, 2)) for _ in range(4))

    span = t_open - t_cut
    bars_b = max(2, int(round(span / 3.4 / 2)) * 2)
    bar = span / bars_b
    beat = bar / 4

    # Teil A – Intro: Klangfläche, Riser in den ersten Taktschlag
    bs, voices, _ = CHORDS[score["intro"]]
    for v in voices:
        add(pad, pad_voice(hz(v), t_cut + 0.4, rng, attack=0.25, release=0.9) * 0.8, 0.0)
    add(bass, bass_note(hz(bs), t_cut, 0.8), 0.0)
    rl = min(1.6, max(0.6, t_cut - 0.2))
    add(fx, riser(rl, rng) * 0.5, t_cut - rl)

    # Teil B – ruhig, Einzeltöne auf Zählzeit 1 und 3
    prog_b = score["prog_b"]
    for i in range(bars_b):
        name = prog_b[i % len(prog_b)]
        b0 = t_cut + i * bar
        bs, voices, arp = CHORDS[name]
        for v in voices:
            add(pad, pad_voice(hz(v), bar, rng) * 0.75, b0)
        add(bass, bass_note(hz(bs), bar * 0.9, 0.7), b0)
        last = i == bars_b - 1
        for j, step in enumerate((0, 2) if not last else (0,)):
            add(pno, piano_note(hz(arp[2 + 2 * j]), 0.42 + 0.06 * (j == 0), rng), b0 + step * beat)
    add(fx, riser(bar * 0.5, rng) * 0.35, t_open - bar * 0.5)

    # Teil C – Öffnung: Achtel-Arpeggien, Bass, vollere Fläche
    prog_c = score["prog_c"]
    i = 0
    while t_open + i * bar < total:
        b0 = t_open + i * bar
        last = b0 + bar >= total - 0.5
        name = score["final"] if last else prog_c[i % len(prog_c)]
        bs, voices, arp = CHORDS[name]
        dur = (total + 1.5 - b0) if last else bar
        for v in voices + [voices[0][:-1] + str(int(voices[0][-1]) + 1)]:
            add(pad, pad_voice(hz(v), dur, rng, attack=0.5) * 0.7, b0)
        add(bass, bass_note(hz(bs), dur * 0.95, 1.0), b0)
        steps = 8 if not last else 1
        for k in range(steps):
            vel = (0.5, 0.36, 0.4, 0.34, 0.46, 0.34, 0.38, 0.33)[k]
            add(pno, piano_note(hz(arp[k]), vel, rng, 3.0), b0 + k * beat / 2)
        i += 1

    ir = reverb_ir(rng)
    wet = lambda x, mix: x * (1 - mix) + np.stack(
        [fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1) * mix
    mixbus = wet(pad, 0.45) * 0.20 + wet(pno, 0.38) * 0.30 + bass * 0.22 + wet(fx, 0.3) * 0.10
    mixbus = mixbus[: int(total * SR)]
    fade = int(1.2 * SR)
    mixbus[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    return mixbus, {"bar": bar, "bpm": 60 / beat, "bars_b": bars_b}
