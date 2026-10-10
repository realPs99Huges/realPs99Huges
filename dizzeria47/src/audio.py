"""Original score + sound design for the Dizzeria 47 reel (all synthesized)."""
import os, sys, math
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave

SR = 48000
DUR = 34.0
N = int(DUR * SR)
BEAT = 0.6
STEP = BEAT / 4
BAR = BEAT * 4
rng = np.random.default_rng(470)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio')
os.makedirs(OUT, exist_ok=True)


def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def noise(d, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    return r.standard_normal(int(d * SR))


class Bus:
    def __init__(self):
        self.b = np.zeros((N + SR * 3, 2))

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if sig.ndim == 1:
            l = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
            r = math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
            sig = np.stack([sig * l, sig * r], 1)
        if i < 0:
            sig = sig[-i:]; i = 0
        n = min(len(sig), len(self.b) - i)
        if n > 0:
            self.b[i:i + n] += sig[:n] * gain

    @property
    def x(self):
        return self.b[:N]


def svf_sweep(x, f_curve, q=0.7, mode='bp'):
    """Time-varying state-variable filter (per-sample cutoff)."""
    lo = bd = 0.0
    out = np.empty_like(x)
    damp = 1.0 / q
    fc = np.minimum(f_curve, SR / 6)
    g = 2 * np.sin(np.pi * fc / SR)
    for n in range(len(x)):
        hi_ = x[n] - lo - damp * bd
        bd += g[n] * hi_
        lo += g[n] * bd
        out[n] = bd if mode == 'bp' else (lo if mode == 'lp' else hi_)
    return out


def reverb_ir(dur=1.8, decay=0.45, seed=3, lpf=6000):
    t = tt(dur)
    ir = []
    for s in (seed, seed + 1):
        n = np.random.default_rng(s).standard_normal(len(t)) * np.exp(-t / decay)
        n = lp(n, lpf)
        n[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir.append(n / np.sqrt((n ** 2).sum()))
    return ir


IR = reverb_ir()
IR_SHORT = reverb_ir(0.6, 0.12, 9, 8000)


def reverb(x, wet=0.3, ir=None):
    ir = ir or IR
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    y = np.stack([fftconvolve(x[:, 0], ir[0])[:len(x)], fftconvolve(x[:, 1], ir[1])[:len(x)]], 1)
    return x + y * wet


# ====================================================================== instruments
def kick(vel=1.0, f0=170, f1=46, decay=0.30):
    t = tt(0.55)
    f = f1 + (f0 - f1) * np.exp(-t / 0.032)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    click = hp(noise(0.55, 1), 2500) * np.exp(-t / 0.0025) * 0.5
    return np.tanh(2.0 * (body + click)) * 0.85 * vel


def clap(vel=1.0, seed=2):
    t = tt(0.45)
    n = noise(0.45, seed)
    env = np.zeros_like(t)
    for k, o in enumerate((0, 0.009, 0.019, 0.031)):
        m = t >= o
        env[m] += np.exp(-(t[m] - o) / (0.005 if k < 3 else 0.11)) * (0.9 if k < 3 else 1.0)
    x = bp(n, 900, 4200) * env
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.03) * 0.3
    return (x + body) * 0.75 * vel


def snare(vel=1.0, seed=None):
    t = tt(0.25)
    n = bp(noise(0.25, seed), 1200, 9000) * np.exp(-t / 0.07)
    tone = np.sin(2 * np.pi * 195 * t) * np.exp(-t / 0.05) * 0.6
    return (n + tone) * 0.5 * vel


def hat(vel=1.0, open_=False, seed=None):
    d = 0.32 if open_ else 0.06
    t = tt(d)
    n = hp(noise(d, seed), 7500, 4) * np.exp(-t / (0.11 if open_ else 0.018))
    # metallic partials
    m = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (5410, 7350, 8920)) * 0.05 * np.exp(-t / 0.02)
    return (n + m) * 0.32 * vel


def crash(vel=1.0, d=2.6):
    t = tt(d)
    n = hp(noise(d, 77), 3800, 2) * (np.exp(-t / 0.9) * 0.8 + np.exp(-t / 0.08) * 0.6)
    ring = sum(np.sin(2 * np.pi * f * t + p) for f, p in ((3120, 0), (4790, 1), (6230, 2), (8010, 3))) \
        * 0.04 * np.exp(-t / 1.0)
    return (n + ring) * 0.45 * vel


def bass808(freq, d, vel=1.0, glide_from=None, glide_t=0.06):
    t = tt(d)
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t / glide_t)
    else:
        f = np.full_like(t, freq)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(t / 0.004, 1) * np.exp(-t / max(d * 0.7, 0.25))
    rel = np.clip((d - t) / 0.03, 0, 1)
    x = np.sin(ph) + 0.18 * np.sin(2 * ph)
    return np.tanh(2.2 * x * env) * rel * 0.55 * vel


def ks(freq, d, vel=1.0, bright=0.6, decay=0.9965, seed=None):
    """Karplus-Strong plucked string (vectorized per period)."""
    n = int(d * SR)
    P = max(int(round(SR / freq)), 2)
    y = np.zeros(n + P + 1)
    r = np.random.default_rng(seed)
    exc = r.uniform(-1, 1, P)
    exc = lp(exc, 1500 + 7000 * bright, 1)
    y[1:P + 1] = exc
    i = P + 1
    while i < len(y):
        j = min(i + P, len(y))
        y[i:j] = decay * 0.5 * (y[i - P:j - P] + y[i - P - 1:j - P - 1])
        i = j
    out = y[1:n + 1]
    fade = np.clip((d - tt(d)) / 0.02, 0, 1)[:len(out)]
    return out * fade * vel * 0.5


def mandolin(m, d, vel=1.0, seed=0):
    f = mtof(m)
    a = ks(f * 2 ** (3.5 / 1200), d, vel, 0.75, 0.9955, seed)
    b = ks(f * 2 ** (-3.5 / 1200), d, vel, 0.7, 0.9955, seed + 1000)
    body = bp(a + b, 180, 6500, 1)
    return a, b, body


def reed(freqs, d, vel=1.0, detune=(0, 9, -7), vib=5.6):
    """Musette-style accordion: three detuned reeds, additive saw-ish, gentle vibrato."""
    t = tt(d)
    out = np.zeros_like(t)
    for f in freqs:
        for k, dc in enumerate(detune):
            ff = f * 2 ** (dc / 1200) * (1 + 0.0025 * np.sin(2 * np.pi * vib * t + k))
            ph = 2 * np.pi * np.cumsum(ff) / SR
            for h in range(1, 9):
                out += np.sin(h * ph) / (h ** 1.15) * (0.6 if h % 2 == 0 else 1.0)
    env = np.minimum(t / 0.12, 1) * np.clip((d - t) / 0.25, 0, 1)
    out = lp(out, 2400, 2) * env
    return out / (len(freqs) * len(detune) * 3.0) * vel


def fm_bell(freq, d=1.2, vel=1.0, ratio=3.5, index=3.0):
    t = tt(d)
    mod = np.sin(2 * np.pi * freq * ratio * t) * index * np.exp(-t / 0.18)
    x = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / 0.45)
    return x * 0.3 * vel


# ====================================================================== sound effects
def crunch(seed, d=0.13, density=1100, vel=1.0, tone=1.0):
    """Crispy crust crunch: dense cluster of tiny cracks + a little body."""
    r = np.random.default_rng(seed)
    x = np.zeros(int((d + 0.05) * SR))
    t = np.arange(len(x)) / SR
    nev = int(density * d)
    times = d * r.power(0.55, nev)  # denser at the start
    for tm in times:
        L = int(r.uniform(0.0004, 0.0035) * SR)
        g = r.standard_normal(L) * np.hanning(L) * r.exponential(1.0) ** 1.6
        i = int(tm * SR)
        x[i:i + L] += g[:len(x) - i]
    env = np.exp(-t / (d * 0.55)) * np.minimum(t / 0.002, 1)
    crisp = bp(x, 1600 * tone, 9500, 2) * env
    body = lp(r.standard_normal(len(x)), 700) * np.exp(-t / 0.025) * 0.5
    y = crisp * 1.0 + body * 0.6
    return y / (np.abs(y).max() + 1e-9) * 0.9 * vel


def tsch(seed, n=3, gap=0.12, vel=1.0):
    out = np.zeros(int((gap * n + 0.25) * SR))
    for k in range(n):
        c = crunch(seed + k * 13, d=0.10 + 0.03 * (k % 2), vel=vel * (1.0 - 0.12 * k), tone=1.0 + 0.15 * k)
        i = int(k * gap * SR)
        out[i:i + len(c)] += c
    return out


def whoosh(d=0.45, f0=250, f1=4500, peak=0.55, vel=1.0, seed=None, q=1.3):
    t = tt(d)
    pk = peak * d
    f = np.where(t < pk, f0 * (f1 / f0) ** (t / pk), f1 * (f0 * 1.5 / f1) ** ((t - pk) / (d - pk)))
    x = svf_sweep(noise(d, seed), f, q=q)
    env = np.where(t < pk, (t / pk) ** 2.2, np.exp(-(t - pk) / (d * 0.18)))
    return x * env * 0.9 * vel


def impact(vel=1.0, sub=52, big=False):
    d = 2.2 if big else 1.3
    t = tt(d)
    f = sub * 0.6 + sub * 1.8 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.9 if big else 0.5))
    hit = lp(noise(d, 5), 3500) * np.exp(-t / 0.05)
    crack = hp(noise(d, 6), 2000) * np.exp(-t / 0.012) * 0.7
    x = np.tanh(1.8 * (boom * 1.1 + hit * 0.8 + crack))
    return x * 0.75 * vel


def riser(d=2.2, vel=1.0):
    t = tt(d)
    f = 250 * (9000 / 250) ** ((t / d) ** 1.6)
    n = svf_sweep(noise(d, 31), f, q=2.0)
    tone_f = 180 * (1400 / 180) ** ((t / d) ** 1.4)
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * (4 + 14 * t / d) * t))
    env = (t / d) ** 2.0
    return (n * 0.8 + tone * 0.25) * env * vel


def tick(vel=0.3, f=4200, seed=None):
    t = tt(0.012)
    return bp(noise(0.012, seed), f * 0.6, min(f * 1.6, 20000)) * np.exp(-t / 0.0018) * vel


def pop(f0=900, vel=0.3):
    t = tt(0.06)
    f = f0 * 0.4 + f0 * 0.6 * np.exp(-t / 0.012)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.018) * vel


def puff_sfx(vel=1.0, d=0.7, seed=12):
    t = tt(d)
    env = np.minimum(t / 0.012, 1) * np.exp(-t / 0.2)
    x = lp(noise(d, seed), 1500) * env + bp(noise(d, seed + 1), 2000, 6000) * env * 0.15
    return x * 0.8 * vel


def thud(vel=1.0, f=85, d=0.35):
    t = tt(d)
    x = np.sin(2 * np.pi * np.cumsum(f * (0.7 + 0.6 * np.exp(-t / 0.03))) / SR) * np.exp(-t / 0.09)
    x += lp(noise(d, 44), 900) * np.exp(-t / 0.02) * 0.6
    return np.tanh(1.5 * x) * 0.8 * vel


def paper(vel=1.0, d=0.38, seed=50):
    t = tt(d)
    base = bp(noise(d, seed), 1800, 9000)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    crinkle = crunch(seed + 1, d=d * 0.8, density=300, vel=0.25)
    x = base * env * 0.5
    x[:len(crinkle)] += crinkle[:len(x)]
    return x * vel


def flap(vel=1.0):
    t = tt(0.18)
    x = lp(noise(0.18, 61), 1800) * np.exp(-t / 0.03)
    x += np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.04) * 0.6
    return x * vel


def vinyl(d):
    x = np.zeros(int(d * SR))
    r = np.random.default_rng(90)
    for tm in r.uniform(0, d, int(d * 9)):
        i = int(tm * SR)
        L = r.integers(20, 120)
        x[i:i + L] += r.standard_normal(min(L, len(x) - i)) * r.exponential(0.5)
    x = bp(x, 800, 8000) + lp(r.standard_normal(len(x)), 300) * 0.02
    return x * 0.25


# ====================================================================== score
CH = {  # (bass midi, mandolin tones r,t,f,o, pad voicing)
    'Am': (33, [69, 72, 76, 81], [57, 60, 64]),
    'E': (40, [64, 68, 71, 76], [56, 59, 64]),
    'E7': (40, [64, 68, 74, 76], [56, 62, 64]),
    'Dm': (38, [62, 65, 69, 74], [57, 62, 65]),
    'G': (31, [67, 71, 74, 79], [55, 59, 62]),
    'F': (41, [65, 69, 72, 77], [57, 60, 65]),
}
PROG = ['Am', 'E', 'Am', 'Dm', 'G', 'E', 'Am', 'F', 'Am', 'Dm', 'E7', 'F', 'E', 'Am']
RA = [3, 2, 1, 2, 0, 2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]
RB = [0, -1, 2, -1, 3, -1, 2, 1, 0, -1, 2, -1, 3, 2, 1, 2]
RC = [3, -1, 2, 3, -1, 2, 1, -1, 0, 1, 2, -1, 3, 2, 1, 0]


def build_music():
    drums = Bus(); bass = Bus(); mandL = Bus(); mandR = Bus(); pad = Bus(); fx = Bus(); pre = Bus()
    kick_times = []

    def K(t, v=1.0):
        drums.add(t, kick(v)); kick_times.append(t)

    for b, chn in enumerate(PROG):
        T = b * BAR
        root, tones, voicing = CH[chn]
        full = b in (2, 3, 4, 5, 8, 9, 10, 12)
        half = b in (6, 7)
        # ---------------- mandolin
        if b < 13:
            if b in (6, 7, 11):  # tremolo melody bars
                mel = {6: [(81, 0, 8), (84, 8, 4), (83, 12, 4)], 7: [(81, 0, 8), (80, 8, 8)],
                       11: [(84, 0, 4), (81, 4, 4), (77, 8, 8)]}[b]
                for m, s0, ln in mel:
                    for k in range(ln * 2):
                        tt0 = T + s0 * STEP + k * STEP / 2
                        v = 0.55 + 0.15 * (k % 2 == 0)
                        a, bb, _ = mandolin(m, 0.35, v, seed=b * 100 + s0 * 10 + k)
                        mandL.add(tt0, a); mandR.add(tt0 + 0.004, bb)
            else:
                pat = RB if b in (0, 1) else (RC if b in (5, 10) else RA)
                for s, idx in enumerate(pat):
                    if idx < 0:
                        continue
                    if b == 1 and s >= 15:
                        continue
                    m = tones[idx]
                    acc = 1.0 if s % 4 == 0 else (0.8 if s % 2 == 0 else 0.62)
                    a, bb, _ = mandolin(m, 0.42, acc, seed=b * 100 + s)
                    mandL.add(T + s * STEP, a); mandR.add(T + s * STEP + 0.006, bb)
        else:  # final bar: arpeggio up + held tremolo
            arp = [69, 72, 76, 81, 84, 88]
            for k, m in enumerate(arp):
                a, bb, _ = mandolin(m, 1.6, 0.9, seed=900 + k)
                mandL.add(T + k * STEP / 2, a); mandR.add(T + k * STEP / 2 + 0.005, bb)
            for k in range(20):
                a, bb, _ = mandolin(81, 0.3, 0.5 * (1 - k / 20), seed=950 + k)
                mandL.add(T + 0.9 + k * STEP / 2, a); mandR.add(T + 0.9 + k * STEP / 2 + 0.004, bb)
        # ---------------- pad
        if b == 13:
            pad.add(T, reed([mtof(m) for m in voicing], 2.8, 1.0))
        elif b > 0:
            pad.add(T, reed([mtof(m) for m in voicing], BAR + 0.05, 0.8 if not half else 1.0))
        else:
            pad.add(T, reed([mtof(m) for m in voicing], BAR + 0.05, 0.6))
        # ---------------- drums
        if full or b in (0, 1):
            dbus, bbus = (drums, bass) if full else (pre, pre)
            kp = [0, 6, 10] if b % 2 == 0 else [0, 3, 8, 11]
            if b == 1:
                kp = [0, 6, 10]
            for s in kp:
                if full:
                    K(T + s * STEP)
                else:
                    pre.add(T + s * STEP, kick(1.0))
            for s in (4, 12):
                dbus.add(T + s * STEP, clap(1.0, seed=b * 7 + s), pan=0.05)
            for s in range(0, 16, 2):
                if b % 2 == 1 and s >= 12:
                    continue
                dbus.add(T + s * STEP, hat(0.9 if s % 4 == 2 else 0.6, seed=b * 31 + s), pan=0.25)
            if b % 2 == 1 and full:  # hat roll last beat
                for k in range(6):
                    drums.add(T + 12 * STEP + k * BEAT / 6, hat(0.4 + 0.08 * k, seed=b * 50 + k), pan=0.25)
                drums.add(T + 14 * STEP, hat(0.5, True, seed=b), pan=-0.2)
            # 808 following kicks
            for j, s in enumerate(kp):
                nxt = kp[j + 1] if j + 1 < len(kp) else 16
                prev_root = CH[PROG[b - 1]][0] if (j == 0 and b > 0) else None
                g = mtof(prev_root) if prev_root and prev_root != root else None
                bbus.add(T + s * STEP, bass808(mtof(root), (nxt - s) * STEP, 1.0, glide_from=g))
        elif half:
            K(T)
            drums.add(T + 8 * STEP, clap(1.0, seed=b), pan=0.05)
            for s in range(0, 16, 4):
                drums.add(T + s * STEP + 2 * STEP, hat(0.45, seed=b * 9 + s), pan=0.25)
            bass.add(T, bass808(mtof(root), BAR * 0.95, 0.9))
            if b == 7:  # build into cards
                for k in range(8):
                    drums.add(T + 12 * STEP + k * STEP / 2, snare(0.25 + 0.09 * k, seed=700 + k), pan=-0.05)
        if b == 1:  # build to drop
            for k in range(8):
                drums.add(T + 8 * STEP + k * STEP, snare(0.2 + 0.07 * k, seed=400 + k))
            for k in range(8):
                if T + 12 * STEP + k * STEP / 2 < 4.65:
                    drums.add(T + 12 * STEP + k * STEP / 2, snare(0.6 + 0.05 * k, seed=500 + k))
        elif b == 11:  # slow-mo bar: heartbeat kick, muffled
            for s in (0, 2, 8, 10):
                K(T + s * STEP, 0.7 if s in (0, 8) else 0.45)
            bass.add(T, bass808(mtof(root), BAR * 0.9, 0.85))
        elif b == 13:  # final hit
            K(T, 1.1)
            drums.add(T, crash(1.0, 3.0), pan=0.1)
            bass.add(T, bass808(mtof(33), 2.6, 1.1, glide_from=mtof(40)))
    # ---------------- shaping
    # intro beat: muffled, filter opens towards the drop
    tp = np.arange(int(4.62 * SR)) / SR
    cut = 320 * (2600 / 320) ** ((tp / 4.62) ** 1.7)
    px = pre.x[:len(tp)]
    pf = np.stack([svf_sweep(px[:, 0], cut, 0.75, 'lp'), svf_sweep(px[:, 1], cut, 0.75, 'lp')], 1)
    drums.b[:len(tp)] += pf * 0.6
    d = drums.x.copy(); bs = bass.x.copy(); md = np.stack([mandL.x[:, 0] + mandL.x[:, 1], mandR.x[:, 0] + mandR.x[:, 1]], 1) * 0.5
    pd = pad.x.copy()
    t = np.arange(N) / SR
    # sidechain envelope from kicks
    sc = np.ones(N)
    for kt in kick_times:
        i = int(kt * SR)
        L = int(0.28 * SR)
        e = 1 - 0.55 * np.exp(-np.arange(L) / SR / 0.09)
        j = min(i + L, N)
        sc[i:j] = np.minimum(sc[i:j], e[:j - i])
    # mandolin: hook bar lowpassed (radio/phone feel), opening over bar 2
    md_l = np.stack([lp(md[:, 0], 1400, 2), lp(md[:, 1], 1400, 2)], 1) * 1.4
    open_ = np.clip((t - 2.4) / 2.2, 0, 1)[:, None] ** 1.5
    md = md_l * (1 - open_) + md * open_
    # slow-mo bar 12 (26.4-28.8): heavy lowpass on everything musical
    slow = ((t >= 26.4) & (t < 28.8)).astype(float)
    sm = np.convolve(slow, np.ones(2400) / 2400, 'same')[:, None]

    def muffle(x, f=480):
        y = np.stack([lp(x[:, 0], f, 2), lp(x[:, 1], f, 2)], 1)
        return x * (1 - sm) + y * sm
    md = muffle(md, 900); pd = muffle(pd, 600); d = muffle(d, 400)
    # stereo widen mandolin (already L/R), reverbs
    md = reverb(md, 0.35)
    pd = reverb(pd, 0.45)
    d = d + (reverb(d, 1.0, IR_SHORT) - d) * 0.12
    mix = (d * 1.0 + bs * 0.95 + md * 0.85 * sc[:, None] ** 0.5 + pd * 0.55 * sc[:, None])
    # drop gap: brief silence before the drop
    gap = np.ones(N)
    g0, g1 = int(4.62 * SR), int(4.8 * SR)
    gap[g0:g1] = 0.0
    mix *= gap[:, None]
    # end fade
    mix *= np.clip((DUR - t) / 0.6, 0, 1)[:, None]
    return mix, sc


def place_sfx():
    S = Bus()
    # --- hook
    S.add(0.03, impact(1.0, 50), 0.9)
    S.add(0.03, crunch(1, 0.12), 0.45, pan=-0.1)
    S.add(1.05, whoosh(0.2, 600, 5000, 0.8, seed=2), 0.5, pan=-0.3)
    S.add(1.2, tick(0.8, 2600, 3), 1.0)
    S.add(1.2, tsch(10, 3, 0.11), 0.8, pan=0.1)
    S.add(1.22, thud(0.6, 110), 0.7)
    for k in range(13):  # "( JA, MIT D. )" typewriter
        S.add(1.55 + k / 30, tick(0.18, 5200, 100 + k), 1.0, pan=0.2)
    S.add(2.1, whoosh(0.32, 300, 6000, 0.85, seed=4), 0.8, pan=0.4)
    # --- dinkel
    S.add(2.4, puff_sfx(1.0), 0.9)
    S.add(2.4, thud(0.7, 70, 0.5), 0.8)
    for k in range(7):
        S.add(2.54 + k * 0.045, whoosh(0.12, 1500, 6000, 0.3, seed=60 + k), 0.12, pan=-0.3 + k * 0.1)
    for j in range(12):
        S.add(2.4 + 0.35 + (0.25 + j * 0.055) * 1.1, pop(700 + 60 * j, 0.22), 1.0, pan=(-1) ** j * 0.3)
    for k in range(20):
        S.add(3.65 + k / 34, tick(0.15, 5200, 200 + k), 1.0, pan=0.1)
    S.add(2.6, riser(2.05, 0.55), 1.0)
    # --- drop / storefront
    S.add(4.8, impact(1.2, 45, big=True), 1.0)
    S.add(4.8, crash(1.0, 2.5), 0.6, pan=-0.1)
    S.add(4.8, puff_sfx(0.6, seed=13), 0.5)
    for k in range(11):
        S.add(4.85 + k * 0.032, whoosh(0.1, 1800, 7000, 0.3, seed=80 + k), 0.08, pan=-0.4 + k * 0.08)
    for k in range(17):
        S.add(4.92 + k / 40, tick(0.12, 5600, 300 + k), 1.0)
    for k in range(32):
        S.add(5.6 + k / 48, tick(0.1, 5600, 340 + k), 1.0, pan=-0.1)
    # --- montage
    S.add(7.0, whoosh(0.3, 200, 5000, 0.75, seed=90), 0.9, pan=0.6)
    S.add(7.22, thud(0.5, 95), 0.6)
    S.add(8.33, whoosh(0.15, 800, 7000, 0.7, seed=91), 0.5, pan=-0.3)
    S.add(8.42, thud(0.45, 100), 0.5)
    S.add(9.4, whoosh(0.3, 200, 5000, 0.75, seed=92), 0.9, pan=0.6)
    S.add(9.62, tsch(30, 3, 0.1, 1.0), 0.8, pan=-0.1)
    S.add(12.0, flap(1.0), 0.9)
    S.add(11.92, whoosh(0.16, 500, 6000, 0.6, seed=93), 0.5)
    S.add(14.2, whoosh(0.32, 200, 4500, 0.75, seed=94), 0.9, pan=-0.4)
    # --- rating
    for k in range(17):
        S.add(14.45 + k / 40, tick(0.13, 5200, 400 + k), 1.0, pan=0.15)
    # slot reel ticks: digit boundary crossings of pos = 15*eout3(prog(u,0.1,1.02))
    for d_ in range(1, 16):
        x = 1 - (1 - d_ / 15) ** (1 / 3)
        S.add(14.4 + 0.1 + x * 0.92, tick(0.5, 3000, 450 + d_), 1.0)
    S.add(15.42, thud(0.9, 90), 0.8)
    S.add(15.42, impact(0.5, 60), 0.5)
    S.add(15.5, whoosh(0.5, 2500, 9000, 0.4, seed=95), 0.25, pan=0.5)  # shine
    bells = [81, 84, 86, 88, 93]
    for j in range(5):
        ts = 14.4 + 1.15 + j * 0.15
        S.add(ts, crunch(500 + j, 0.09, vel=1.0, tone=1.0 + 0.1 * j), 0.75, pan=-0.5 + j * 0.25)
        S.add(ts, fm_bell(mtof(bells[j]), 1.4, 0.8), 0.5, pan=-0.5 + j * 0.25)
    S.add(16.6, whoosh(0.3, 400, 5000, 0.6, seed=96), 0.4)
    last = -1
    for k in range(120):  # counter 0 -> 300
        x = k / 119
        u = 2.25 + x * 0.85
        n = int(round(300 * (1 - (1 - x) ** 3)))
        if n // 10 != last:
            last = n // 10
            S.add(14.4 + u, tick(0.12, 4500, 600 + k), 1.0, pan=0.1)
    S.add(18.0, whoosh(0.5, 300, 3000, 0.5, seed=97), 0.3)
    S.add(19.0, whoosh(0.28, 200, 5000, 0.7, seed=98), 0.8, pan=0.2)
    # --- cards
    for j in range(3):
        tin = 19.2 + 2.4 * j
        S.add(tin - 0.1, paper(1.0, seed=50 + j * 3), 0.9, pan=(-1) ** j * 0.3)
        S.add(tin + 0.3, thud(0.55, 120, 0.25), 0.6)
        S.add(tin + 0.3, crunch(800 + j, 0.06, 500, 0.4), 0.3)
    S.add(25.28, whoosh(0.1, 800, 4000, 0.8, seed=99), 0.6)
    S.add(25.38, thud(1.2, 70, 0.5), 1.0)
    S.add(25.38, impact(0.6, 55), 0.6)
    S.add(25.38, tsch(40, 2, 0.08, 0.8), 0.6)
    # --- lust auf dizza (slow-mo bar)
    S.add(26.2, whoosh(0.35, 200, 4000, 0.6, seed=101), 0.8, pan=-0.3)
    S.add(26.42, whoosh(0.4, 300, 3000, 0.4, seed=102), 0.6, pan=-0.6)
    S.add(26.98, impact(1.0, 50), 0.9)
    S.add(27.0, tsch(60, 4, 0.115, 1.0), 0.95, pan=0.05)
    r = np.random.default_rng(5)
    for k in range(26):  # crumbs landing
        S.add(27.4 + r.uniform(0, 0.9), crunch(900 + k, 0.025, 600, r.uniform(0.15, 0.4), 1.4), 0.6,
              pan=r.uniform(-0.7, 0.7))
    S.add(27.6, whoosh(0.6, 300, 2500, 0.5, seed=103), 0.25)
    S.add(28.3, riser(0.5, 0.4), 1.0)
    S.add(28.62, whoosh(0.28, 200, 5000, 0.7, seed=104), 0.8, pan=0.5)
    # --- info rows
    S.add(28.8, whoosh(0.4, 400, 3000, 0.4, seed=105), 0.3)
    for j in range(3):
        t0 = 28.8 + 0.2 + j * 0.3
        S.add(t0 - 0.03, whoosh(0.22, 600, 6000, 0.5, seed=110 + j), 0.45, pan=0.4)
        S.add(t0 + 0.05, pop(1300 + 200 * j, 0.3), 1.0)
    # --- end
    S.add(31.0, whoosh(0.25, 200, 5000, 0.8, seed=120), 0.8)
    S.add(31.2, impact(1.1, 45, big=True), 0.95)
    S.add(31.2, puff_sfx(0.9, 1.0, seed=14), 0.6)
    for k, m in enumerate([93, 96, 100, 105]):
        S.add(31.35 + k * 0.08, fm_bell(mtof(m), 1.5, 0.35, ratio=2.0, index=1.5), 0.5, pan=-0.4 + k * 0.27)
    for k in range(43):
        S.add(32.5 + k / 50, tick(0.08, 5600, 1000 + k), 1.0)
    return S.x


def ambience():
    """Real in-store sound from the clips, very low, under the footage scenes."""
    A = Bus()
    U = '/root/.claude/uploads/65c5a26f-38b0-53b3-8ea7-4f4a5a430212'
    import subprocess
    segs = [('1146', 4.8, 20 / 60, 2.4, 0.5), ('1154', 9.6, 40 / 60, 2.4, 0.35), ('1155', 12.0, 8 / 60, 2.4, 0.3)]
    for name, at, src, d, g in segs:
        f = [x for x in os.listdir(U) if x.endswith(f'IMG_{name}.mov')][0]
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(src), '-t', str(d), '-i', os.path.join(U, f),
                              '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
        x = np.stack([hp(x[:, 0], 120), hp(x[:, 1], 120)], 1)
        rms = np.sqrt((x ** 2).mean()) + 1e-9
        x = x / rms * 0.02 * g / 0.35
        fade = np.minimum(np.arange(len(x)) / (0.08 * SR), 1) * np.minimum((len(x) - np.arange(len(x))) / (0.08 * SR), 1)
        A.add(at, x * fade[:, None])
    return A.x


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


def main():
    music, sc = build_music()
    sfx = place_sfx()
    amb = ambience()
    vin = vinyl(DUR)
    vin_env = np.where(np.arange(N) / SR < 4.8, 1.0, 0.35)
    music = music / (np.abs(music).max() + 1e-9) * 0.7
    sfx = sfx / (np.abs(sfx).max() + 1e-9) * 0.85
    print('music rms', rms_db(music), 'sfx rms', rms_db(sfx), 'amb rms', rms_db(amb))
    mix = music * 1.0 + sfx * 0.8 + amb + np.stack([vin * vin_env] * 2, 1) * 0.5
    # master: gentle glue + soft limiter
    mix = mix / (np.abs(mix).max() + 1e-9)
    drive = 1.6
    mix = np.tanh(mix * drive) / np.tanh(drive)
    mix *= 0.93
    print('master rms', rms_db(mix), 'peak', 20 * np.log10(np.abs(mix).max()))
    for name, x in (('mix', mix), ('music', music), ('sfx', sfx)):
        x = np.clip(x, -1, 1)
        with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((x * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    main()
