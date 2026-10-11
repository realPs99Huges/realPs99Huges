"""SFX-only track for reel #3 (no music, no melody) — every sound sits on a visual event.
Leaves headroom so a 120-BPM sound can be laid on top in Instagram/TikTok."""
import os, sys, subprocess, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *

DUR = 30.0
N = int(DUR * SR)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio6')
os.makedirs(OUT, exist_ok=True)
U = '/root/.claude/uploads/65c5a26f-38b0-53b3-8ea7-4f4a5a430212'


def noise_riser(d, vel=1.0, seed=31, f0=300, f1=9000):
    t = tt(d)
    f = f0 * (f1 / f0) ** ((t / d) ** 1.6)
    n = svf(noise(d, seed), f, 2.0, 'bp')
    return n * (t / d) ** 2.2 * vel


def rev_whoosh(d=0.4, vel=1.0, seed=5):
    return whoosh(d, 300, 6000, 0.92, vel, seed)


def shutter(vel=1.0):
    a = tick(1.0, 3000, 1) * 1.5
    b = tick(0.8, 2200, 2) * 1.2
    out = np.zeros(int(0.12 * SR))
    out[:len(a)] += a
    i = int(0.055 * SR)
    out[i:i + len(b)] += b
    return lp(out, 9000) * vel


def scratch(d=0.32, vel=1.0, seed=8):
    """Record-scratch style: fast filtered noise sweep down + up."""
    t = tt(d)
    f = 3500 * np.exp(-((t - d * 0.35) / (d * 0.25)) ** 2) + 600
    x = svf(noise(d, seed), f, 4.5, 'bp')
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7
    return x * env * 1.2 * vel


def glitch(d=0.18, vel=1.0, seed=3):
    r = np.random.default_rng(seed)
    x = np.zeros(int(d * SR))
    k = 0
    while k < len(x):
        L = int(r.uniform(0.006, 0.02) * SR)
        f = r.uniform(400, 4000)
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(L) / SR)) * r.uniform(0.2, 0.6)
        x[k:k + L] = seg[:len(x) - k]
        k += L + int(r.uniform(0.0, 0.01) * SR)
    return bp(x, 300, 8000) * vel


def slam_sfx(vel=1.0, seed=0):
    out = np.zeros(int(0.6 * SR))
    th = thud(vel, 70, 0.4, seed=seed)
    out[:len(th)] += th
    w = whoosh(0.18, 2500, 500, 0.12, 0.35 * vel, seed + 1)
    out[:len(w)] += w
    return out


def typer_ticks(S, t0, n, cps, vel=0.22, seed=0):
    for k in range(n):
        S.add(t0 + k / cps, tick(vel, 5200 + 300 * (k % 3), seed + k), 1.0, pan=0.15)


def build_sfx():
    S = Bus(DUR)
    # ---------------- hook (HUD boots)
    S.add(0.0, glitch(0.12, 0.5, 1), 0.5)
    S.add(0.0, slam_sfx(0.8, 1), 0.85)
    S.add(0.0, whoosh(0.4, 300, 3000, 0.2, 0.4, 2), 0.5)
    S.add(0.5, slam_sfx(1.0, 3), 0.95)
    S.add(1.0, slam_sfx(0.9, 4), 0.9)
    S.add(1.0, scratch(0.22, 0.6, 5), 0.5)
    typer_ticks(S, 0.02, 22, 60, vel=0.12, seed=10)
    S.add(1.6, noise_riser(0.4, 0.6, 6), 1.0)
    # ---------------- 4K scan capture
    S.add(2.0, shutter(1.0), 1.0)
    S.add(2.0, impact(0.7, 55), 0.7)
    S.add(2.0, whoosh(0.7, 4000, 300, 0.1, 0.6, 7), 0.6)
    for k, tc in enumerate((2.6, 3.0, 3.4)):
        S.add(tc, pop(900, 0.35), 1.0)
        S.add(tc + 0.05, whoosh(0.2, 1500, 6000, 0.7, 0.35, 20 + k), 0.6, pan=0.3 * (k - 1))
        typer_ticks(S, tc + 0.2, 14, 55, vel=0.12, seed=40 + k * 20)
        S.add(tc + 0.5, tick(0.6, 3000, 90 + k), 1.0)
    # ---------------- oven
    S.add(3.8, rev_whoosh(0.2, 0.6, 8), 0.7)
    S.add(4.0, thud(0.8, 85), 0.8)
    S.add(4.0, sizzle(2.0, 1.0, 71), 0.22)
    for k, tc in enumerate((4.25, 4.75)):
        S.add(tc, pop(900, 0.35), 1.0)
        typer_ticks(S, tc + 0.2, 14, 55, vel=0.12, seed=120 + k * 20)
        S.add(tc + 0.5, tick(0.6, 3000, 130 + k), 1.0)
    typer_ticks(S, 5.5, 21, 60, vel=0.14, seed=160)
    S.add(5.85, noise_riser(0.15, 0.4, 9), 1.0)
    # ---------------- table
    S.add(6.0, slam_sfx(1.0, 10), 0.95)
    S.add(6.12, slam_sfx(0.8, 11), 0.8)
    for k in range(4):
        tk = 6.5 + k * 0.5
        typer_ticks(S, tk, 8, 60, vel=0.12, seed=200 + k * 10)
        S.add(tk + 0.12, thud(0.75, 110, 0.25, seed=210 + k), 0.75)
        S.add(tk + 0.15, glitch(0.05, 0.4, 220 + k), 0.35)      # red cross
        S.add(tk + 0.25, tick(0.7, 2600, 230 + k), 1.0)          # check
    S.add(8.6, noise_riser(0.4, 0.6, 12), 1.0)
    S.add(9.0, impact(1.0, 45, big=True), 0.95)
    S.add(9.0, thud(1.0, 70, 0.4), 0.9)                          # stamp
    # ---------------- montage (zoom transitions)
    for k, t0 in enumerate((10.0, 11.0, 12.0, 13.0)):
        S.add(t0 - 0.14, whoosh(0.18, 500, 7000, 0.9, 0.7, 300 + k), 0.8, pan=(-1) ** k * 0.4)
        S.add(t0, slam_sfx(0.9, 310 + k), 0.9)
    S.add(13.6, noise_riser(0.4, 0.6, 13), 1.0)
    # ---------------- rating
    S.add(14.0, impact(0.7, 50), 0.7)
    S.add(14.0, whoosh(0.3, 6000, 400, 0.1, 0.5, 14), 0.5)
    typer_ticks(S, 14.02, 20, 60, vel=0.12, seed=400)
    for d_ in range(1, 15):
        x = 1 - (1 - d_ / 14) ** (1 / 3)
        S.add(14.25 + x * 0.75, tick(0.55, 3000, 450 + d_), 1.0)
    S.add(15.0, thud(0.9, 85), 0.8)
    for j in range(5):
        S.add(15.0 + j * 0.125, crunch(500 + j, 0.05, 1000, 0.6, 1.2), 0.5, pan=-0.5 + 0.25 * j)
        S.add(15.0 + j * 0.125, tick(0.5, 6000, 520 + j), 1.0, pan=-0.5 + 0.25 * j)
    S.add(15.75, whoosh(0.4, 400, 3000, 0.5, 0.35, 15), 0.5)
    typer_ticks(S, 16.5, 19, 40, vel=0.14, seed=560)
    # ---------------- where are we
    S.add(17.75, rev_whoosh(0.25, 0.6, 16), 0.7)
    S.add(18.0, thud(0.8, 60, 0.5), 0.8)
    S.add(18.25, slam_sfx(0.9, 17), 0.9)
    S.add(18.75, slam_sfx(1.0, 18), 0.95)
    S.add(18.9, noise_riser(1.1, 0.8, 19), 1.0)
    S.add(19.5, whoosh(0.5, 200, 7000, 0.95, 1.0, 20), 0.9)
    S.add(20.0, explosion(0.9, 21), 0.9)                          # BUFF
    S.add(20.0, crash(0.7, 2.4), 0.45)
    # ---------------- address
    S.add(20.2, pop(500, 0.6), 1.0)
    S.add(20.2, thud(0.5, 140, 0.2), 0.6)
    S.add(20.3, whoosh(0.3, 600, 4000, 0.5, 0.45, 22), 0.6)
    typer_ticks(S, 20.75, 15, 40, seed=600)
    S.add(22.85, whoosh(0.3, 3000, 500, 0.2, 0.5, 23), 0.6)
    # ---------------- hours
    S.add(23.0, slam_sfx(0.7, 24), 0.7)
    typer_ticks(S, 23.1, 16, 45, seed=700)
    S.add(23.5, slam_sfx(1.0, 25), 0.95)
    S.add(25.75, rev_whoosh(0.25, 0.6, 26), 0.7)
    # ---------------- diagnosis + end
    S.add(26.0, glitch(0.12, 0.5, 27), 0.5)
    S.add(26.0, thud(0.7, 85), 0.7)
    typer_ticks(S, 26.05, 9, 40, seed=800)
    S.add(26.4, noise_riser(0.1, 0.5, 28), 1.0)
    S.add(26.5, impact(1.0, 46, big=True), 0.95)
    S.add(26.5, slam_sfx(1.0, 29), 0.9)
    S.add(27.4, whoosh(0.3, 3000, 500, 0.2, 0.5, 30), 0.6)
    S.add(27.5, whoosh(0.5, 300, 3000, 0.5, 0.6, 31), 0.6)
    S.add(27.6, impact(0.5, 50), 0.6)
    S.add(28.0, whoosh(0.5, 400, 2500, 0.4, 0.35, 32), 0.5)
    return S.x


SRCF = {'1147': '5f11dd14-IMG_1147.mov', '1148': '992e19d8-IMG_1148.mov', '1150': 'b33607ca-IMG_1150.mov',
        '1154': 'edfda088-IMG_1154.mov', '1170': '7244ad20-IMG_1170.mov', '1172': 'c68857be-IMG_1172.mov',
        '1146': '477746dc-IMG_1146.mov', '1197': 'cd9228c3-IMG_1197.mov', '1155': '3e7d3d1e-IMG_1155.mov', '1149': 'bd7d7acc-IMG_1149.mov', '1151': '379303a9-IMG_1151.mov'}
AMB = [  # out t0, t1, clip, source start frame, speed, level
    (0.0, 2.0, '1154', 40, 1.0, 1.0), (4.0, 6.0, '1170', 40, 1.0, 1.2), (6.0, 10.0, '1150', 1, 1.0, 0.7),
    (10.0, 11.0, '1148', 150, 1.6, 0.8), (11.0, 12.0, '1150', 300, 1.0, 0.8), (12.0, 13.0, '1172', 30, 1.0, 0.8),
    (13.0, 14.0, '1154', 150, 1.0, 0.8), (14.0, 18.0, '1155', 150, 1.0, 0.7), (18.0, 19.5, '1151', 30, 1.0, 0.7),
    (20.0, 23.0, '1146', 8, 1.0, 1.0), (23.0, 26.0, '1147', 220, 1.0, 1.0), (26.0, 30.0, '1149', 190, 1.0, 1.0)]


def ambience():
    A = np.zeros((N, 2))
    for t0, t1, name, f0, sp, lvl in AMB:
        d = (t1 - t0) * sp
        af = f'atempo={sp:.3f}' if abs(sp - 1) > 0.01 else 'anull'
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{f0 / 59.94:.3f}', '-t', f'{d:.3f}', '-i',
                              os.path.join(U, SRCF[name]), '-vn', '-ac', '2', '-ar', str(SR), '-af', af, '-f', 'f32le',
                              '-'], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
        if len(x) < 100:
            continue
        x = np.stack([hp(x[:, 0], 120), hp(x[:, 1], 120)], 1)
        x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.02 * lvl
        n = len(x)
        f = np.minimum(np.arange(n) / (0.03 * SR), 1) * np.minimum((n - np.arange(n)) / (0.03 * SR), 1)
        i = int(t0 * SR)
        j = min(i + n, N)
        A[i:j] += (x * f[:, None])[:j - i]
    return A


def main():
    sfx = build_sfx()
    sfx = sfx / (np.abs(sfx).max() + 1e-9) * 0.9
    mix = sfx + ambience()
    t = np.arange(N) / SR
    mix *= np.clip((DUR - t) / 0.45, 0, 1)[:, None]
    mix = mix / max(1.0, np.abs(mix).max() / 0.89)
    mix = np.tanh(mix * 2.6) / np.tanh(2.6) * 0.72
    with wave.open(os.path.join(OUT, 'sfx.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    print('ok')


if __name__ == '__main__':
    main()
