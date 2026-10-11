"""Synth + SFX toolkit for reel #2 (nu-disco palette + pizza-cutter foley). All synthesized."""
import math
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000


def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def noise(d, seed=None):
    return np.random.default_rng(seed).standard_normal(int(d * SR))


class Bus:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.b = np.zeros((self.n + SR * 4, 2))

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
        return self.b[:self.n]


def svf(x, f_curve, q=0.7, mode='lp'):
    """Time-varying Chamberlin state-variable filter."""
    lo = bd = 0.0
    out = np.empty_like(x)
    damp = 1.0 / q
    if np.isscalar(f_curve):
        f_curve = np.full(len(x), f_curve)
    g = 2 * np.sin(np.pi * np.minimum(f_curve, SR / 6.5) / SR)
    for n in range(len(x)):
        h = x[n] - lo - damp * bd
        bd += g[n] * h
        lo += g[n] * bd
        out[n] = lo if mode == 'lp' else (bd if mode == 'bp' else h)
    return out


def reverb_ir(dur=2.0, decay=0.5, seed=3, lpf=7000, pre=0.012):
    t = tt(dur)
    ir = []
    for s in (seed, seed + 1):
        n = np.random.default_rng(s).standard_normal(len(t)) * np.exp(-t / decay)
        n = lp(n, lpf)
        k = int(pre * SR)
        n = np.concatenate([np.zeros(k), n[:-k]])
        ir.append(n / np.sqrt((n ** 2).sum()))
    return ir


IR = reverb_ir()
IR_ROOM = reverb_ir(0.5, 0.09, 9, 9000, 0.004)


def reverb(x, wet=0.3, ir=None):
    ir = ir or IR
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    y = np.stack([fftconvolve(x[:, 0], ir[0])[:len(x)], fftconvolve(x[:, 1], ir[1])[:len(x)]], 1)
    return x + y * wet


def blep_saw(freq, t):
    """Band-limited-ish saw via polyBLEP. freq may be array."""
    f = np.broadcast_to(freq, t.shape).astype(float)
    ph = np.cumsum(f / SR) % 1.0
    dt = f / SR
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt[m]; y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt[m]; y[m] -= x * x + x + x + 1
    return y


def adsr(n, a=0.005, d=0.1, s=0.6, r=0.1, gate=None):
    gate = gate if gate is not None else n / SR - r
    t = np.arange(n) / SR
    env = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = np.clip(1 - (t - gate) / r, 0, 1)
    return env * np.where(t > gate, rel, 1)


# ------------------------------------------------------------------ drums
def kick(vel=1.0, f0=150, f1=48, decay=0.28, click=0.45):
    t = tt(0.5)
    f = f1 + (f0 - f1) * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    cl = hp(noise(0.5, 1), 3000) * np.exp(-t / 0.002) * click
    return np.tanh(2.2 * (body + cl)) * 0.85 * vel


def clap(vel=1.0, seed=2, tail=0.13):
    t = tt(0.5)
    n = noise(0.5, seed)
    env = np.zeros_like(t)
    for k, o in enumerate((0, 0.008, 0.017, 0.028)):
        m = t >= o
        env[m] += np.exp(-(t[m] - o) / (0.005 if k < 3 else tail))
    x = bp(n, 1000, 5000) * env
    return x * 0.7 * vel


def hat(vel=1.0, open_=False, seed=None):
    d = 0.35 if open_ else 0.07
    t = tt(d)
    n = hp(noise(d, seed), 7000, 4) * np.exp(-t / (0.12 if open_ else 0.02))
    m = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (5150, 7240, 8890, 10430)) * 0.04 * np.exp(-t / 0.03)
    return (n + m) * 0.3 * vel


def shaker(vel=1.0, seed=None):
    t = tt(0.09)
    n = bp(noise(0.09, seed), 5000, 14000) * (np.minimum(t / 0.02, 1) * np.exp(-t / 0.03))
    return n * 0.35 * vel


def crash(vel=1.0, d=2.6, seed=77):
    t = tt(d)
    n = hp(noise(d, seed), 3500, 2) * (np.exp(-t / 0.9) * 0.8 + np.exp(-t / 0.06) * 0.6)
    ring = sum(np.sin(2 * np.pi * f * t + p) for f, p in ((3120, 0), (4790, 1), (6230, 2), (8010, 3))) \
        * 0.04 * np.exp(-t / 1.0)
    return (n + ring) * 0.45 * vel


def tom(freq=110, vel=1.0):
    t = tt(0.5)
    f = freq * (1 + 0.6 * np.exp(-t / 0.04))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.7 * vel


# ------------------------------------------------------------------ synths
def bass_note(m, d, vel=1.0, cutoff=900, res=1.4):
    t = tt(d)
    f = mtof(m)
    x = blep_saw(f, t) * 0.6 + blep_saw(f * 1.005, t) * 0.4
    env = adsr(len(t), 0.003, 0.12, 0.55, 0.03, d - 0.03)
    fenv = cutoff * (0.35 + 1.4 * np.exp(-t / 0.08))
    y = svf(x, fenv, res, 'lp')
    y += np.sin(2 * np.pi * f * t) * 0.6  # sub
    return np.tanh(1.5 * y * env) * 0.5 * vel


def pluck(m, d=0.25, vel=1.0, bright=3500):
    t = tt(d)
    f = mtof(m)
    x = blep_saw(f, t) + 0.6 * blep_saw(f * 2.003, t) * 0.5
    fenv = 300 + bright * np.exp(-t / 0.05)
    y = svf(x, fenv, 1.2, 'lp')
    env = np.exp(-t / 0.09) * np.minimum(t / 0.002, 1)
    return y * env * 0.35 * vel


def supersaw(ms, d, vel=1.0, cutoff=2600, detune=0.12, voices=5, att=0.02, rel=0.25, seed=0):
    t = tt(d)
    out = np.zeros((len(t), 2))
    r = np.random.default_rng(seed)
    for m in ms:
        f = mtof(m)
        for v in range(voices):
            dc = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune
            ff = f * 2 ** (dc / 12)
            ph0 = r.uniform(0, 1)
            s = blep_saw(ff, t + ph0 / ff)
            pan = (v / (voices - 1)) * 2 - 1
            out[:, 0] += s * (1 - pan) / 2
            out[:, 1] += s * (1 + pan) / 2
    env = adsr(len(t), att, 0.2, 0.85, rel, d - rel)
    out = np.stack([lp(out[:, 0], cutoff, 2), lp(out[:, 1], cutoff, 2)], 1)
    return out * env[:, None] / (len(ms) * voices) * 1.6 * vel


def ep(m, d, vel=1.0):
    """FM electric piano stab."""
    t = tt(d)
    f = mtof(m)
    mod = np.sin(2 * np.pi * f * 1.0 * t) * 1.8 * np.exp(-t / 0.25)
    x = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.05)
    env = np.minimum(t / 0.002, 1) * np.exp(-t / 0.5) * np.clip((d - t) / 0.05, 0, 1)
    return x * env * 0.3 * vel


def bell(freq, d=1.2, vel=1.0, ratio=3.5, index=2.5):
    t = tt(d)
    mod = np.sin(2 * np.pi * freq * ratio * t) * index * np.exp(-t / 0.18)
    return np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / 0.45) * 0.3 * vel


# ------------------------------------------------------------------ foley / sfx
def crunch(seed, d=0.13, density=1100, vel=1.0, tone=1.0):
    r = np.random.default_rng(seed)
    x = np.zeros(int((d + 0.05) * SR))
    t = np.arange(len(x)) / SR
    for tm in d * r.power(0.55, int(density * d)):
        L = int(r.uniform(0.0004, 0.0035) * SR)
        g = r.standard_normal(L) * np.hanning(L) * r.exponential(1.0) ** 1.6
        i = int(tm * SR)
        x[i:i + L] += g[:len(x) - i]
    env = np.exp(-t / (d * 0.55)) * np.minimum(t / 0.002, 1)
    crisp = bp(x, 1600 * tone, 9500) * env
    body = lp(r.standard_normal(len(x)), 700) * np.exp(-t / 0.025) * 0.5
    y = crisp + body * 0.6
    return y / (np.abs(y).max() + 1e-9) * 0.9 * vel


def tsch(seed, n=3, gap=0.12, vel=1.0):
    out = np.zeros(int((gap * n + 0.25) * SR))
    for k in range(n):
        c = crunch(seed + k * 13, d=0.10 + 0.03 * (k % 2), vel=vel * (1.0 - 0.12 * k), tone=1.0 + 0.15 * k)
        i = int(k * gap * SR)
        out[i:i + len(c)] += c
    return out


def cutter(d=0.32, seed=0, vel=1.0):
    """Pizza-cutter wheel rolling through crust & cheese: 'zzzip' + crunchy entry/exit."""
    r = np.random.default_rng(seed)
    n = int((d + 0.2) * SR)
    t = np.arange(n) / SR
    # rolling grain: crackles at a rising roll rate
    x = np.zeros(n)
    tm = 0.0
    while tm < d:
        rate = 90 + 160 * (tm / d)
        i = int(tm * SR)
        L = int(r.uniform(0.0005, 0.002) * SR)
        x[i:i + L] += r.standard_normal(L) * np.hanning(L) * r.exponential(0.8)
        tm += r.exponential(1 / rate)
    roll_env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.6
    grit = bp(x, 1200, 9000) * roll_env
    # metallic wheel resonance (sweeping)
    f = 2600 + 900 * (t / d)
    ring = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.06 * roll_env * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t))
    # sticky cheese swish
    sw = svf(r.standard_normal(n) * roll_env, 600 + 2500 * np.clip(t / d, 0, 1), 1.6, 'bp') * 0.5
    y = grit * 1.0 + ring + sw
    # crust crunch at entry & exit
    c1 = crunch(seed + 100, 0.08, 1300, 0.9)
    c2 = crunch(seed + 200, 0.11, 1300, 1.0)
    y[:len(c1)] += c1
    j = int(d * 0.85 * SR)
    y[j:j + len(c2)] += c2[:n - j]
    return y / (np.abs(y).max() + 1e-9) * 0.9 * vel


def whoosh(d=0.45, f0=250, f1=4500, peak=0.55, vel=1.0, seed=None, q=1.3):
    t = tt(d)
    pk = peak * d
    f = np.where(t < pk, f0 * (f1 / f0) ** (t / pk), f1 * (f0 * 1.5 / f1) ** ((t - pk) / (d - pk)))
    x = svf(noise(d, seed), f, q, 'bp')
    env = np.where(t < pk, (t / pk) ** 2.2, np.exp(-(t - pk) / (d * 0.18)))
    return x * env * 0.9 * vel


def impact(vel=1.0, sub=50, big=False, seed=5):
    d = 2.4 if big else 1.3
    t = tt(d)
    f = sub * 0.6 + sub * 1.8 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (1.0 if big else 0.5))
    hit = lp(noise(d, seed), 3500) * np.exp(-t / 0.05)
    crack = hp(noise(d, seed + 1), 2000) * np.exp(-t / 0.012) * 0.7
    return np.tanh(1.8 * (boom * 1.1 + hit * 0.8 + crack)) * 0.75 * vel


def explosion(vel=1.0, seed=9):
    """'BUMM': sub drop + noise burst + debris crackle."""
    d = 2.6
    t = tt(d)
    base = impact(1.0, 42, True, seed)
    base = np.pad(base, (0, max(0, len(t) - len(base))))[:len(t)]
    burst = lp(noise(d, seed + 3), 2500) * np.exp(-t / 0.35) * np.minimum(t / 0.004, 1)
    deb = np.zeros_like(t)
    r = np.random.default_rng(seed)
    for tm in r.exponential(0.35, 120):
        if tm < d - 0.05:
            c = crunch(int(r.integers(0, 1e6)), 0.03, 500, r.uniform(0.1, 0.5), 1.3)
            i = int(tm * SR); deb[i:i + len(c)] += c[:len(deb) - i]
    y = base + burst * 0.5 + deb * 0.35
    return np.tanh(1.3 * y) * vel


def riser(d=2.0, vel=1.0, seed=31):
    t = tt(d)
    f = 250 * (9000 / 250) ** ((t / d) ** 1.6)
    n = svf(noise(d, seed), f, 2.0, 'bp')
    tf = 200 * (1600 / 200) ** ((t / d) ** 1.4)
    tone = blep_saw(tf, t) * 0.15
    return (n * 0.8 + lp(tone, 3000)) * (t / d) ** 2.0 * vel


def reverse_cymbal(d=1.2, vel=1.0):
    c = crash(1.0, d)[::-1]
    return c * vel


def tick(vel=0.3, f=4200, seed=None):
    t = tt(0.012)
    return bp(noise(0.012, seed), f * 0.6, min(f * 1.6, 20000)) * np.exp(-t / 0.0018) * vel


def pop(f0=900, vel=0.3):
    t = tt(0.07)
    f = f0 * 0.4 + f0 * 0.6 * np.exp(-t / 0.012)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.02) * vel


def thud(vel=1.0, f=85, d=0.35, seed=44):
    t = tt(d)
    x = np.sin(2 * np.pi * np.cumsum(f * (0.7 + 0.6 * np.exp(-t / 0.03))) / SR) * np.exp(-t / 0.09)
    x += lp(noise(d, seed), 900) * np.exp(-t / 0.02) * 0.6
    return np.tanh(1.5 * x) * 0.8 * vel


def puff(vel=1.0, d=0.7, seed=12):
    t = tt(d)
    env = np.minimum(t / 0.012, 1) * np.exp(-t / 0.2)
    return (lp(noise(d, seed), 1500) * env + bp(noise(d, seed + 1), 2000, 6000) * env * 0.15) * 0.8 * vel


def sizzle(d=1.5, vel=1.0, seed=70):
    """Oven/fire crackle bed."""
    r = np.random.default_rng(seed)
    n = int(d * SR)
    x = bp(r.standard_normal(n), 2500, 9000) * 0.05
    for tm in r.uniform(0, d, int(d * 40)):
        i = int(tm * SR); L = int(r.uniform(0.0005, 0.004) * SR)
        x[i:i + L] += r.standard_normal(min(L, n - i)) * r.exponential(0.4)
    x = bp(x, 800, 10000)
    env = np.minimum(np.arange(n) / (0.15 * SR), 1) * np.minimum((n - np.arange(n)) / (0.3 * SR), 1)
    return x * env * vel


def marker(d=0.35, vel=1.0, seed=80):
    """Felt-tip marker squeak/scratch for hand-drawn annotations."""
    r = np.random.default_rng(seed)
    t = tt(d)
    f = 1800 + 700 * np.sin(2 * np.pi * 3 * t + r.uniform(0, 6))
    x = svf(r.standard_normal(len(t)), f, 3.0, 'bp')
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    return x * env * 0.5 * vel


def tape_stop(x, d=0.5):
    """Apply a tape-stop (pitch/speed ramp down) to the end of a stereo signal segment."""
    n = len(x)
    k = int(d * SR)
    out = x.copy()
    seg = x[n - k:]
    pos = np.cumsum(np.linspace(1, 0, k))
    pos = pos / pos[-1] * (k * 0.5)
    idx = np.clip(pos.astype(int), 0, k - 1)
    out[n - k:] = seg[idx] * np.linspace(1, 0, k)[:, None]
    return out
