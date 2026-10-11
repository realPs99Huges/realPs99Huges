"""Original cinematic score for the Dizzeria 47 premium edit. 100 BPM, D minor, ~33 s. All synthesized.

Form (bars of 2.4 s):
  1-2   intro      felt piano + warm pad, no drums
  3-4   build      soft kick, sub bass, hats enter
  5     lift       snare roll, filter rise, one beat of silence before the drop
  6-9   main       full groove
  10    breakdown  drums out, piano + pad, riser
  11-12 climax     full groove + lead
  13    ending     final chord hit (logo), long tail
"""
import os, math, wave
import numpy as np
from synth import *

DUR = 33.0
BPM = 100.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
STEP = BEAT / 4
N = int(DUR * SR)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio4')
os.makedirs(OUT, exist_ok=True)

# chord per bar: (bass root midi, piano voicing, pad voicing)
CH = {
    'Dm': (38, [62, 65, 69, 72, 76], [50, 57, 60, 65]),
    'Bb': (34, [58, 62, 65, 69, 74], [46, 53, 57, 62]),
    'F': (41, [60, 65, 69, 72, 76], [48, 53, 57, 64]),
    'C': (36, [60, 64, 67, 71, 74], [48, 55, 59, 64]),
    'Gm': (43, [62, 65, 67, 70, 74], [50, 55, 58, 62]),
}
PROG = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Dm', 'Bb', 'F', 'C', 'Bb', 'Dm', 'Gm', 'Dm']
IR_LONG = reverb_ir(3.2, 0.9, 21, 6000, 0.02)
IR_MED = reverb_ir(1.6, 0.4, 31, 7000, 0.012)


def piano(m, d, vel=1.0, seed=0):
    """Felt piano: inharmonic additive partials + soft hammer, warm low-passed."""
    t = tt(d + 1.2)
    f = mtof(m)
    B = 0.00035
    out = np.zeros_like(t)
    bright = 0.5 + 0.5 * vel
    for k in range(1, 11):
        fk = k * f * math.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = (1 / k ** 1.35) * math.exp(-(k - 1) * (0.32 - 0.16 * bright))
        tau = 3.2 / (1 + 0.55 * k) * (1.0 if m < 72 else 0.75)
        det = 1 + 0.0007 * ((k % 3) - 1)
        out += amp * np.sin(2 * np.pi * fk * det * t + k) * np.exp(-t / tau)
    att = np.minimum(t / 0.006, 1)
    rel = np.clip(1 - (t - d) / 0.35, 0, 1)
    out *= att * rel
    r = np.random.default_rng(seed)
    ham = lp(r.standard_normal(len(t)), 1200) * np.exp(-t / 0.012) * 0.08
    y = lp(out + ham, 2600 + 1800 * vel)
    return y * 0.22 * vel


def pad(ms, d, vel=1.0, cutoff=1500, seed=0):
    x = supersaw(ms, d, vel, cutoff, detune=0.10, voices=5, att=0.6, rel=0.9, seed=seed)
    return x * 0.8


def sub(m, d, vel=1.0):
    t = tt(d)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    env = np.minimum(t / 0.01, 1) * np.clip((d - t) / 0.05, 0, 1)
    return np.tanh(1.6 * x * env) * 0.42 * vel


def soft_kick(vel=1.0):
    return kick(vel, f0=120, f1=44, decay=0.34, click=0.12)


def snare(vel=1.0, seed=0):
    t = tt(0.4)
    n = bp(noise(0.4, seed), 1500, 7000) * np.exp(-t / 0.09)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.5
    return (n * 0.6 + body) * 0.55 * vel


def lead(m, d, vel=1.0):
    t = tt(d)
    f = mtof(m) * (1 + 0.003 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.15) / 0.2, 0, 1))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * blep_saw(f, t) * 0.5
    y = lp(x, 3200)
    env = adsr(len(t), 0.02, 0.2, 0.75, 0.15, d - 0.15)
    return y * env * 0.2 * vel


ARP = [0, 2, 1, 3, 2, 4, 3, 1]          # piano arpeggio pattern over voicing indices
LEAD = {10: [(0, 76, 6), (6, 74, 2), (8, 72, 4), (12, 69, 4)],
        11: [(0, 70, 6), (6, 69, 2), (8, 67, 4), (12, 69, 4)]}


def build():
    P = Bus(DUR); PD = Bus(DUR); BS = Bus(DUR); DR = Bus(DUR); LD = Bus(DUR); FX = Bus(DUR)
    kicks = []
    for b, name in enumerate(PROG):
        T = b * BAR
        root, pv, padv = CH[name]
        # ---- piano
        if b in (0, 1, 9):          # sparse arpeggio in 8ths
            for s in range(8):
                m = pv[ARP[s] % len(pv)]
                P.add(T + s * BEAT / 2, piano(m, BEAT * 1.6, 0.55 + 0.15 * (s % 2 == 0), seed=b * 10 + s),
                      pan=-0.25 + 0.5 * (s % 2))
        elif b == 12:               # final chord
            for j, m in enumerate([50] + pv):
                P.add(T + j * 0.012, piano(m, 3.4, 0.9, seed=900 + j), pan=-0.3 + 0.12 * j)
        elif b == 4:                # lift bar: repeated chord stabs, rising
            for s in range(6):
                for j, m in enumerate(pv[:4]):
                    P.add(T + s * BEAT / 2, piano(m, BEAT * 0.45, 0.5 + 0.08 * s, seed=400 + s * 5 + j))
        else:                       # rhythmic chords (8ths with syncopation)
            for s in (0, 3, 6, 8, 11, 14):
                for j, m in enumerate(pv[:4]):
                    P.add(T + s * STEP, piano(m + (12 if b >= 10 and j == 3 else 0), BEAT * 0.9,
                                              0.6 if s in (0, 8) else 0.45, seed=b * 50 + s + j))
        # ---- pad
        if b in range(1, 12):
            PD.add(T, pad([m for m in padv], BAR + 0.4, 0.55 if b < 5 else 0.75, 1300 if b < 5 else 2000, seed=b))
        elif b == 12:
            PD.add(T, pad(padv, 3.6, 0.8, 1800, seed=99))
        # ---- bass
        if b in (2, 3):
            BS.add(T, sub(root, BAR * 0.95, 0.8))
        elif b in (5, 6, 7, 8, 10, 11):
            for s, ln in ((0, 6), (6, 4), (10, 6)):
                BS.add(T + s * STEP, sub(root, ln * STEP * 0.92, 1.0))
        elif b == 9:
            BS.add(T, sub(root, BAR * 0.95, 0.7))
        elif b == 12:
            BS.add(T, sub(38, 3.0, 1.0))
        # ---- drums
        if b in (2, 3):
            for k in (0, 2):
                DR.add(T + k * BEAT, soft_kick(0.75)); kicks.append(T + k * BEAT)
            if b == 3:
                for s in range(2, 16, 4):
                    DR.add(T + s * STEP, hat(0.35, seed=b * 9 + s), pan=0.3)
        elif b == 4:  # lift: snare roll rising, kick on 1 only
            DR.add(T, soft_kick(0.8)); kicks.append(T)
            for s in range(12):
                DR.add(T + s * STEP, snare(0.12 + 0.05 * s, seed=500 + s), pan=-0.1)
        elif b in (5, 6, 7, 8, 10, 11):
            for k in range(4):
                DR.add(T + k * BEAT, soft_kick(1.0)); kicks.append(T + k * BEAT)
            for k in (1, 3):
                DR.add(T + k * BEAT, clap(0.75, seed=b * 3 + k), pan=0.05)
                DR.add(T + k * BEAT, snare(0.35, seed=b * 7 + k))
            for s in range(16):
                DR.add(T + s * STEP, hat(0.42 if s % 4 == 2 else 0.22, seed=b * 31 + s), pan=0.3)
            for s in range(1, 16, 2):
                DR.add(T + s * STEP, shaker(0.35, seed=b * 17 + s), pan=-0.35)
            if b in (8, 11):  # fill
                for s in range(12, 16):
                    DR.add(T + s * STEP, tom(150 - (s - 12) * 22, 0.55), pan=-0.4 + (s - 12) * 0.25)
        elif b == 12:
            DR.add(T, soft_kick(1.1)); kicks.append(T)
            DR.add(T, crash(0.55, 3.0), pan=0.1)
        # ---- lead
        for s0, m, ln in LEAD.get(b, []):
            LD.add(T + s0 * STEP, lead(m, ln * STEP * 0.95, 0.9))
    # ---- transitions / fx
    FX.add(4 * BAR, riser(BAR - BEAT, 0.5), 1.0)                       # lift riser into the drop
    FX.add(5 * BAR, impact(0.55, 46), 0.8)                              # drop accent
    FX.add(9 * BAR + 2 * BEAT, riser(2 * BEAT, 0.45), 1.0)             # breakdown riser into climax
    FX.add(10 * BAR, impact(0.45, 50), 0.7)
    FX.add(12 * BAR - 1.2, reverse_cymbal(1.2, 0.5), 1.0)              # into the final chord
    FX.add(12 * BAR, impact(0.6, 42, big=True), 0.8)
    t = np.arange(N) / SR
    sc = np.ones(N)
    for kt in kicks:
        i = int(kt * SR); L = int(0.26 * SR)
        e = 1 - 0.55 * np.exp(-np.arange(L) / SR / 0.08)
        j = min(i + L, N)
        sc[i:j] = np.minimum(sc[i:j], e[:j - i])
    scv = sc[:, None]
    # intro filter: piano warmer in bars 1-2, opens over the build
    p = P.x
    open_ = np.clip((t - 2 * BAR) / (3 * BAR), 0, 1)[:, None]
    pl = np.stack([lp(p[:, 0], 1400), lp(p[:, 1], 1400)], 1)
    p = pl * (1 - open_) + p * open_
    p = reverb(p, 0.38, IR_LONG)
    pd_ = reverb(PD.x, 0.5, IR_LONG)
    dr = DR.x + (reverb(DR.x, 1.0, IR_MED) - DR.x) * 0.12
    ld = reverb(LD.x, 0.45, IR_MED)
    mix = p * 1.0 * (0.75 + 0.25 * scv) + pd_ * 0.5 * scv + BS.x * 0.9 * scv ** 0.7 + dr * 0.85 + ld * 0.7 + FX.x * 0.6
    # lift the soft intro so it carries on a phone speaker
    ig = 1 + 0.7 * np.clip(1 - (t - 2 * BAR) / BAR, 0, 1)
    mix *= ig[:, None]
    # breath: one beat of near-silence right before the drop
    g = np.ones(N)
    a, b_ = int((5 * BAR - BEAT * 0.5) * SR), int(5 * BAR * SR)
    g[a:b_] = np.linspace(1, 0.05, b_ - a)
    mix *= g[:, None]
    mix *= np.clip((DUR - t) / 1.2, 0, 1)[:, None]
    return mix


def main():
    mix = build()
    mix = mix / (np.abs(mix).max() + 1e-9)
    drive = 1.5
    mix = np.tanh(mix * drive) / np.tanh(drive) * 0.92
    with wave.open(os.path.join(OUT, 'score.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    print('written', os.path.join(OUT, 'score.wav'))


if __name__ == '__main__':
    main()
