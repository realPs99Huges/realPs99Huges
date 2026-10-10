"""Score + sound design for reel #2 "8 STÜCKE" — nu-disco, 120 BPM, A minor. All synthesized."""
import os, math, subprocess, wave
import numpy as np
from synth import *

DUR = 34.0
N = int(DUR * SR)
BEAT = 0.5
STEP = BEAT / 4
BAR = 2.0
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio2')
os.makedirs(OUT, exist_ok=True)
U = '/root/.claude/uploads/65c5a26f-38b0-53b3-8ea7-4f4a5a430212'

CH = {  # root (bass midi), chord tones for arp/stabs
    'Am': (45, [57, 60, 64, 69]), 'F': (41, [53, 57, 60, 65]), 'C': (48, [55, 60, 64, 67]),
    'G': (43, [55, 59, 62, 67]), 'Dm': (50, [57, 62, 65, 69]), 'E': (40, [56, 59, 64, 68]),
}
PROG = ['Am', 'F', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Dm|E', 'Am', 'F', 'G', 'Am', 'F', 'Am']
GROOVE = {2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15}
HOOK = {  # bar -> list of (step16, midi, len16)
    4: [(0, 76, 2), (3, 76, 1), (4, 74, 2), (6, 72, 2), (10, 72, 2), (12, 71, 2), (14, 67, 2)],
    5: [(0, 71, 3), (4, 74, 2), (8, 71, 2), (10, 69, 2), (12, 67, 4)],
    6: [(0, 76, 2), (3, 76, 1), (4, 74, 2), (6, 72, 2), (10, 72, 2), (12, 71, 2), (14, 72, 2)],
    7: [(0, 69, 6), (8, 72, 2), (10, 74, 2), (12, 76, 4)],
    12: [(0, 76, 2), (3, 76, 1), (4, 74, 2), (6, 72, 2), (10, 72, 2), (12, 71, 2), (14, 67, 2)],
    13: [(0, 71, 3), (4, 74, 2), (8, 74, 2), (10, 76, 2), (12, 79, 4)],
    14: [(0, 81, 4), (4, 79, 2), (6, 76, 2), (8, 76, 4), (12, 74, 2), (14, 72, 2)],
    15: [(0, 72, 6), (8, 71, 2), (10, 69, 6)],
}


def chord_at(b, half):
    c = PROG[b]
    if '|' in c:
        c = c.split('|')[half]
    return CH[c]


def lead(m, d, vel=1.0):
    t = tt(d)
    f = mtof(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.12) / 0.2, 0, 1))
    x = blep_saw(f, t) * 0.5 + np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25
    y = svf(x, 1800 + 1600 * np.exp(-t / 0.15), 1.1, 'lp')
    env = adsr(len(t), 0.006, 0.15, 0.7, 0.06, d - 0.06)
    return y * env * 0.28 * vel


def build_music():
    drums = Bus(DUR); bass = Bus(DUR); arp = Bus(DUR); keys = Bus(DUR); pad = Bus(DUR); ld = Bus(DUR)
    intro = Bus(DUR)
    kicks = []
    nb = int(DUR / BAR) + 1
    for b in range(min(nb, len(PROG))):
        T = b * BAR
        groove = b in GROOVE
        for half in (0, 1):
            root, tones = chord_at(b, half)
            Th = T + half * BAR / 2
            # pad (supersaw) always, softer in intro
            if b not in (0,):
                lvl = 0.55 if groove else (0.8 if b in (10, 16) else 0.45)
                pad.add(Th, supersaw(tones[:3], BAR / 2 + 0.06, lvl, 2400, seed=b * 2 + half))
            # bass: disco octaves on 8ths
            if groove or b == 1 or b == 11:
                for s in range(0, 8, 1):
                    if b == 1 and half == 1 and s >= 6:
                        continue
                    m = root if s % 2 == 0 else root + 12
                    bass.add(Th + s * BEAT / 2, bass_note(m, BEAT / 2 * 0.85, 0.95 if s % 2 == 0 else 0.75,
                                                          cutoff=1100))
            # arp 16ths
            if groove or b in (1, 10):
                pat = [0, 1, 2, 3, 2, 1, 2, 3] * 2
                for s in range(16 if half == 0 else 16):
                    if s >= 8:
                        continue
                    idx = pat[(s + half * 8) % 16]
                    m = tones[idx] + 12
                    vel = 0.9 if s % 2 == 0 else 0.65
                    arp.add(Th + s * STEP, pluck(m, 0.22, vel, 3800 if groove else 1800), pan=0.35 if s % 2 else -0.35)
            # EP stabs on offbeats
            if groove:
                for bt in (0.5, 1.5):
                    for m in tones[:3]:
                        keys.add(Th + bt * BEAT, ep(m + 12, 0.32, 0.55), pan=-0.15)
        # drums
        if groove:
            for k in range(4):
                drums.add(T + k * BEAT, kick(1.0)); kicks.append(T + k * BEAT)
            for k in (1, 3):
                drums.add(T + k * BEAT, clap(0.9, seed=b * 5 + k), pan=0.05)
            for k in range(4):
                drums.add(T + k * BEAT + BEAT / 2, hat(0.75, True, seed=b * 9 + k), pan=0.25)
            for s in range(16):
                drums.add(T + s * STEP, shaker(0.5 if s % 2 else 0.3, seed=b * 40 + s), pan=-0.3)
            if b in (5, 9, 13):  # fill
                for k in range(4):
                    drums.add(T + 3 * BEAT + k * STEP, tom(170 - k * 25, 0.6), pan=-0.4 + k * 0.25)
        elif b == 0:
            for k in range(4):
                intro.add(T + k * BEAT, kick(0.9)); kicks.append(T + k * BEAT)
            for k in range(4):
                intro.add(T + k * BEAT + BEAT / 2, hat(0.5, True, seed=900 + k))
        elif b == 1:
            for k in range(4):
                if T + k * BEAT < 3.85:
                    intro.add(T + k * BEAT, kick(0.95)); kicks.append(T + k * BEAT)
            for s in range(8, 16):
                tt0 = T + s * STEP
                if tt0 < 3.85:
                    drums.add(tt0, clap(0.25 + 0.06 * (s - 8), seed=700 + s, tail=0.06), pan=0.05)
            for s in range(12, 16):
                for half in (0, 1):
                    tt0 = T + s * STEP + half * STEP / 2
                    if tt0 < 3.85:
                        drums.add(tt0, clap(0.5, seed=760 + s * 2 + half, tail=0.04))
        elif b == 10:  # breakdown: no kick, sparse
            for k in range(4):
                drums.add(T + k * BEAT + BEAT / 2, hat(0.35, True, seed=1000 + k), pan=0.25)
        elif b == 16:  # final bar: one hit and ring
            drums.add(T, kick(1.1)); kicks.append(T)
            drums.add(T, crash(0.9, 2.5), pan=0.1)
            bass.add(T, bass_note(45, 1.2, 1.0, 600))
            for m in (57, 60, 64, 69):
                keys.add(T, ep(m + 12, 1.6, 0.7))
        # lead hook
        for s0, m, ln in HOOK.get(b, []):
            ld.add(T + s0 * STEP, lead(m, ln * STEP * 0.95, 0.9), pan=0.0)
    # ---------------------------------------------------- mix shaping
    t = np.arange(N) / SR
    sc = np.ones(N)
    for kt in kicks:
        i = int(kt * SR); L = int(0.22 * SR)
        e = 1 - 0.6 * np.exp(-np.arange(L) / SR / 0.07)
        j = min(i + L, N)
        sc[i:j] = np.minimum(sc[i:j], e[:j - i])
    scv = sc[:, None]
    # intro: everything lowpassed with opening filter 0..3.85
    ix = intro.x
    k3 = int(3.85 * SR)
    cut = 350 * (3000 / 350) ** ((np.arange(k3) / k3) ** 1.6)
    il = np.zeros_like(ix)
    il[:k3, 0] = svf(ix[:k3, 0], cut, 0.8, 'lp'); il[:k3, 1] = svf(ix[:k3, 1], cut, 0.8, 'lp')
    d = drums.x + il * 0.5
    d = d + (reverb(d, 1.0, IR_ROOM) - d) * 0.15
    bs = bass.x
    ar = reverb(arp.x, 0.35)
    ky = reverb(keys.x, 0.4)
    pd = reverb(pad.x, 0.5)
    lead_ = reverb(ld.x, 0.45)
    # breakdown bar 10 (20-22): lowpass arp/pad
    bd = ((t >= 20.0) & (t < 22.0)).astype(float)
    bd = np.convolve(bd, np.ones(1200) / 1200, 'same')[:, None]

    def muffle(x, f):
        y = np.stack([lp(x[:, 0], f), lp(x[:, 1], f)], 1)
        return x * (1 - bd) + y * bd
    ar = muffle(ar, 900); pd = muffle(pd, 700)
    mix = d * 1.0 + bs * 0.85 * scv ** 0.6 + ar * 0.5 * scv + ky * 0.45 * scv + pd * 0.42 * scv + lead_ * 0.6
    gap = np.ones(N); gap[int(3.85 * SR):int(4.0 * SR)] = 0.0
    mix *= gap[:, None]
    mix *= np.clip((DUR - t) / 0.5, 0, 1)[:, None]
    return mix


def clip_audio(name, src_t, d):
    f = [x for x in os.listdir(U) if x.endswith(f'IMG_{name}.mov')][0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(src_t), '-t', str(d), '-i', os.path.join(U, f),
                          '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    x = np.stack([hp(x[:, 0], 100), hp(x[:, 1], 100)], 1)
    n = len(x)
    fade = np.minimum(np.arange(n) / (0.06 * SR), 1) * np.minimum((n - np.arange(n)) / (0.12 * SR), 1)
    return x * fade[:, None] / (np.sqrt((x ** 2).mean()) + 1e-9)


def sfx():
    S = Bus(DUR)
    # ---------------- hook
    S.add(0.0, whoosh(0.45, 5000, 300, 0.25, seed=1), 0.7)
    S.add(0.44, impact(0.8, 55), 0.75)
    S.add(0.44, thud(0.8, 80), 0.7)
    S.add(0.44, puff(0.7), 0.5)
    S.add(0.5, thud(0.55, 120, 0.25), 0.6)
    S.add(0.98, thud(0.55, 110, 0.25), 0.6)
    for k, tc in enumerate([1.0, 1.25, 1.5, 1.75]):
        S.add(tc - 0.01, cutter(0.2, seed=10 + k), 1.7, pan=[-0.2, 0.25, -0.1, 0.15][k])
    S.add(2.05, tsch(30, 2, 0.07, 0.9), 1.1)
    for k in range(9):
        S.add(2.02 + k * 0.035, pop(1100 + k * 40, 0.12), 1.0)
    S.add(2.35, marker(0.5, 0.6, 81), 0.5, pan=-0.2)
    S.add(2.5, riser(1.45, 0.7), 1.0)
    rum = lp(noise(0.5, 99), 200) * np.linspace(0, 1, int(0.5 * SR)) ** 2
    S.add(3.48, rum, 0.6)
    # ---------------- BUMM
    S.add(4.0, explosion(1.0), 1.0)
    S.add(4.0, crash(1.0, 2.6), 0.55)
    for k in range(8):
        S.add(4.02 + k * 0.03, whoosh(0.35, 1500, 400, 0.15, seed=40 + k), 0.18, pan=-0.8 + k * 0.23)
    # ---------------- reasons
    REAS = [(1, 4.0, 'strike'), (2, 6.0, 'arrow'), (3, 8.0, 'under'), (4, 10.0, 'circle'), (5, 12.0, 'arrow2'),
            (6, 14.0, 'sun')]
    for k, T0, ann in REAS:
        if k > 1:
            S.add(T0 - 0.09, whoosh(0.28, 400, 6000, 0.7, seed=60 + k), 0.75, pan=0.5)
            S.add(T0, crunch(200 + k, 0.09, 1200, 0.8), 0.85, pan=0.6)   # HUD bite
            S.add(T0 - 0.16 + 0.0, whoosh(0.2, 3000, 500, 0.3, seed=70 + k), 0.4, pan=-0.6)
        for j in range(6):
            S.add(T0 + 0.05 + j * 0.035, pop(900 + j * 60, 0.1), 1.0)
        S.add(T0 + 0.32, marker(0.38, 0.6, 82 + k), 0.45, pan=-0.3)
        if k in (4, 6):
            S.add(T0 + 0.1, whoosh(0.4, 150, 1500, 0.6, seed=80 + k, q=0.9), 0.6)
        if ann == 'strike':
            S.add(T0 + 0.85, marker(0.25, 0.9, 90), 0.55)
            S.add(T0 + 0.85, crunch(91, 0.05, 600, 0.3), 0.3)
        elif ann in ('arrow', 'arrow2'):
            S.add(T0 + 0.75, marker(0.3, 0.7, 92 + k), 0.5, pan=0.3)
        elif ann == 'under':
            S.add(T0 + 0.75, marker(0.2, 0.7, 95), 0.5); S.add(T0 + 0.95, marker(0.17, 0.6, 96), 0.45)
        elif ann == 'circle':
            S.add(T0 + 0.75, marker(0.4, 0.7, 97), 0.5)
        elif ann == 'sun':
            S.add(T0 + 0.7, marker(0.25, 0.6, 98), 0.45)
            for j in range(8):
                S.add(T0 + 0.95 + j * 0.03, tick(0.12, 5000, 300 + j), 1.0)
    S.add(10.0, sizzle(2.0, 1.0), 0.18)
    # ---------------- rating mosaic
    for k in range(8):
        S.add(16.0 + k * 0.04, whoosh(0.35, 3000, 300, 0.75, seed=110 + k), 0.22, pan=-0.8 + k * 0.22)
    S.add(16.42, thud(0.8, 90), 0.6)
    S.add(16.45, pop(700, 0.5), 1.0)
    bells = [81, 84, 86, 88, 93]
    for j in range(5):
        ts = 16.9 + j * 0.125
        S.add(ts, bell(mtof(bells[j]), 1.3, 0.8), 0.45, pan=-0.5 + j * 0.25)
        S.add(ts, crunch(300 + j, 0.07, 1100, 0.7, 1.1 + 0.08 * j), 0.75)
    S.add(17.5, marker(0.4, 0.7, 120), 0.5)
    S.add(16.5, marker(0.45, 0.6, 121), 0.4)
    # ---------------- last slice
    for j in range(7):
        tj = 20.05 + j * 0.25
        S.add(tj, whoosh(0.3, 600, 5000, 0.6, seed=130 + j), 0.45, pan=[-0.7, 0.7, -0.4, 0.4, -0.2, 0.2, 0][j])
        S.add(tj + 0.04, crunch(400 + j, 0.08, 1300, 0.85, 1.0 + 0.06 * j), 0.95)
        S.add(tj + 0.04, pop(500 * 2 ** (j / 7), 0.35), 1.0)
    S.add(20.5, thud(0.7, 100, 0.3), 0.6)
    S.add(21.55, riser(0.45, 0.6), 1.0)
    S.add(22.0, impact(1.0, 50), 0.85)
    S.add(22.0, crash(0.9, 2.4), 0.5)
    S.add(22.25, thud(0.9, 90), 0.7)
    S.add(22.55, whoosh(0.4, 150, 1500, 0.6, seed=140, q=0.9), 0.6)
    S.add(22.7, marker(0.4, 0.7, 141), 0.5)
    S.add(23.0, marker(0.3, 0.7, 142), 0.45)
    # ---------------- info
    S.add(24.05, marker(0.45, 0.7, 150), 0.5)
    for j in range(3):
        t0 = 24.35 + j * 0.5
        S.add(t0 - 0.03, whoosh(0.25, 600, 6000, 0.5, seed=151 + j), 0.5, pan=0.4)
        S.add(t0 + 0.06, pop(1200 + 200 * j, 0.3), 1.0)
        S.add(t0 + 0.35, marker(0.25, 0.5, 155 + j), 0.4)
    # ---------------- end
    S.add(27.95, whoosh(0.4, 4000, 300, 0.4, seed=160), 0.6)
    for k in range(8):
        S.add(28.1 + k * 0.06, whoosh(0.5, 300, 4000, 0.85, seed=161 + k), 0.25, pan=(-1) ** k * 0.5)
    S.add(28.88, impact(0.9, 50), 0.8)
    S.add(28.88, crunch(170, 0.1, 1200, 0.8), 0.5)
    S.add(28.9, puff(0.7, seed=171), 0.4)
    for k in range(11):
        S.add(28.95 + k * 0.03, pop(1000 + k * 30, 0.1), 1.0)
    S.add(29.2, marker(0.6, 0.6, 172), 0.4)
    S.add(29.4, marker(0.5, 0.6, 173), 0.45)
    for k in range(31):
        S.add(29.9 + k / 45, tick(0.1, 5600, 400 + k), 1.0)
    for k in range(37):
        S.add(30.5 + k / 45, tick(0.1, 5600, 500 + k), 1.0)
    for k in range(19):
        S.add(31.2 + k / 40, tick(0.12, 5000, 600 + k), 1.0)
    for k in range(8):
        S.add(20.02 + k / 40, tick(0.12, 5200, 700 + k), 1.0)
    S.add(33.15, tsch(180, 3, 0.11, 0.9), 1.1)
    # ---------------- real ambience from the iPhone clips
    S.add(10.0, clip_audio('1169', 0.0, 2.0), 0.035)
    S.add(14.0, clip_audio('1172', 150 / 60, 2.0), 0.035)
    S.add(22.6, clip_audio('1146', 0.6, 2.6), 0.02)
    return S.x


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


def main():
    music = build_music()
    fx = sfx()
    music = music / (np.abs(music).max() + 1e-9) * 0.7
    fx = fx / (np.abs(fx).max() + 1e-9) * 0.85
    print('music', rms_db(music), 'sfx', rms_db(fx))
    # duck music under sound effects
    env = np.abs(fx).max(axis=1)
    k = int(0.03 * SR)
    env = np.convolve(env, np.ones(k) / k, 'same')
    rel = np.exp(-1 / (0.12 * SR))
    sm = np.empty_like(env); acc = 0.0
    for i in range(0, len(env), 64):
        v = env[i]
        acc = max(v, acc * rel ** 64)
        sm[i:i + 64] = acc
    duck = 1 - 0.5 * np.clip(sm / 0.35, 0, 1)
    mix = music * duck[:, None] + fx * 0.95
    mix = mix / (np.abs(mix).max() + 1e-9)
    drive = 1.7
    mix = np.tanh(mix * drive) / np.tanh(drive) * 0.93
    print('master', rms_db(mix))
    for name, x in (('mix', mix), ('music', music), ('sfx', fx)):
        with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    main()
