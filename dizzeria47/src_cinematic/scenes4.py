"""DIZZERIA 47 — premium cinematic edit (footage-first). Cuts are placed on beats measured from the score
(audio4/beatmap.json). Only real footage + the real pizza photo; the logo end scene uses the client's logo file
(assets2/logo.png) when present, otherwise the real logo sign from IMG_1151."""
import os, json, math, functools
import numpy as np
import cv2
import lib
from lib import *
from fx2 import cover

FONT_FILES['inter'] = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONT_FILES['interl'] = '/usr/share/fonts/opentype/inter/Inter-Light.otf'
FONT_FILES['serifi'] = 'InstrumentSerif-Italic.ttf'

DUR = 33.0
BM = json.load(open(os.path.join(SCR, 'audio4', 'beatmap.json')))
BEATS = np.array(BM['beats'])
D = [0.0] + [d for d in BM['downbeats']]          # D[1] = bar 2 ... ; D[i] = start of bar i+1
IBI = float(np.median(np.diff(BEATS)))
QUIET = BM['quiet'][0] if BM['quiet'] else D[5] - 0.15


def beat_after(t, n):
    """n-th detected beat after the beat nearest to t."""
    i = int(np.argmin(np.abs(BEATS - t)))
    j = min(i + n, len(BEATS) - 1)
    return float(BEATS[j])


CREAM = (0.97, 0.94, 0.88)
WARM = (0.93, 0.62, 0.30)

# ------------------------------------------------------------------ footage + grade
FPS_SRC = {'1151': 59.94, '1186': 60.0, '2914': 30.0, 'scr': 59.94, '1169': 59.94, '1172': 59.94, '1146': 59.94,
           '1155': 59.94, '1153': 59.94, '1150': 59.94, '1154': 59.94}
# per-clip primary correction: (exposure, (r,g,b) balance, saturation)
PRIMARY = {
    '2914': (1.28, (1.03, 0.95, 1.0), 1.06),
    'scr': (1.12, (1.0, 1.0, 1.02), 1.0),
    '1186': (0.92, (1.0, 1.0, 1.03), 1.02),
    '1151': (0.98, (1.0, 1.0, 1.02), 1.05),
}


def _curve():
    x = np.arange(256) / 255.0
    y = x + 0.10 * np.sin(np.pi * (x - 0.5)) * (1 - np.abs(2 * x - 1)) * 1.2   # gentle S
    y = np.clip(y, 0, 1)
    y = 0.018 + y * 0.975                                                       # slightly lifted blacks
    return y


CURVE = _curve()


@functools.lru_cache(maxsize=64)
def raw(name, i):
    p = os.path.join(CLIPS, name, f'{i:04d}.jpg')
    im = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    ex, wb, sat = PRIMARY.get(name, (1.0, (1.0, 1.0, 1.0), 1.04))
    im = im * ex * np.array(wb, np.float32)
    l = im @ np.array([0.299, 0.587, 0.114], np.float32)
    im = l[..., None] + (im - l[..., None]) * sat
    im = np.clip(im, 0, 1)
    idx = (im * 255).astype(np.int32)
    im = CURVE[idx].astype(np.float32)
    # unified look: warm highlights, neutral-cool shadows (subtle)
    l = im.mean(axis=2, keepdims=True)
    im = im + (l - 0.5) * np.array([0.03, 0.0, -0.035], np.float32)
    return np.clip(im, 0, 1)


def nframes(name):
    return len(os.listdir(os.path.join(CLIPS, name)))


def frame(name, f):
    n = nframes(name)
    f = min(max(f, 1.0), float(n))
    i0 = int(math.floor(f)); fr = f - i0
    i1 = min(i0 + 1, n)
    a = raw(name, i0)
    if fr < 0.12 or i1 == i0:
        return a
    if fr > 0.88:
        return raw(name, i1)
    return a * (1 - fr) + raw(name, i1) * fr


def shot(name, f, zoom=1.0, cx=0.5, cy=0.5, dx=0.0, dy=0.0, blur=0.0, bright=1.0):
    im = frame(name, f)
    out = cover((im * 255).astype(np.uint8), W, H, zoom=zoom, cx=cx, cy=cy, dx=dx, dy=dy, blur=blur, bright=bright,
                sharpen=0.18)
    return out


@functools.lru_cache(maxsize=1)
def photo():
    return cv2.cvtColor(cv2.imread(os.path.join(SCR, 'realpizza', 'src.jpg')), cv2.COLOR_BGR2RGB)


# ------------------------------------------------------------------ typography
@functools.lru_cache(maxsize=None)
def G(text, fname, size, color=CREAM, tracking=0.0, shadow=(10, (0, 4), 0.55)):
    return Glyphs(text, fname, int(size), color, tracking, shadow)


def cap_y(Gl, cy):
    return cy - (Gl.cap_top + Gl.cap_h / 2)


def text_reveal(dst, Gl, x, y, t0, t1, t, dur=0.7, out=0.35, alpha=1.0):
    """Elegant reveal: soft rise + fade + slight tracking settle; soft fade-out at t1."""
    p = eout3(prog(t, t0, t0 + dur))
    q = 1 - ein3(prog(t, t1 - out, t1))
    a = p * q * alpha
    if a <= 0.004:
        return
    cxw = x + Gl.width / 2
    spread = 0.035 * (1 - p)
    place_glyphs(dst, Gl, x, y + 18 * (1 - p), per_glyph=lambda k, i: {
        'dx': ((x + (Gl.xs[i] + Gl.xs[i + 1]) / 2) - cxw) * spread}, alpha=a)


# ------------------------------------------------------------------ timeline
H3 = beat_after(D[3], 2)          # half of bar 4
C1 = beat_after(D[10], 2)         # climax half-bar
C2 = beat_after(D[11], 1)
C3 = beat_after(D[11], 2)

SHOTS = [
    # (t0, t1, clip, f_start, f_end, zoom0, zoom1, cx, cy, push)
    (0.0, D[2], '1151', 340, 62, 1.14, 1.0, 0.56, 0.5, False),
    (D[2], D[3], 'scr', 1, 108, 1.08, 1.02, 0.5, 0.45, True),
    (D[3], H3, '2914', 8, 44, 1.08, 1.13, 0.5, 0.55, True),
    (H3, D[4], '2914', 100, 136, 1.10, 1.15, 0.55, 0.42, True),
    (D[4], D[5], '1186', 10, 116, 1.0, 1.06, 0.5, 0.45, True),
    (D[5], D[6], 'scr', 132, 180, 1.06, 1.0, 0.5, 0.42, False),
    (D[6], D[7], '1169', 1, 145, 1.0, 1.06, 0.5, 0.5, True),
    (D[7], D[8], '1150', 60, 200, 1.06, 1.0, 0.5, 0.5, False),
    (D[8], D[9], '2914', 262, 372, 1.0, 1.06, 0.5, 0.5, True),
    (D[9], D[10], 'photo', 0, 0, 1.0, 1.09, 0.5, 0.55, False),
    (D[10], C1, '1172', 150, 222, 1.12, 1.06, 0.45, 0.45, True),
    (C1, D[11], 'scr', 199, 269, 1.04, 1.0, 0.5, 0.5, True),
    (D[11], C2, '1155', 190, 226, 1.75, 1.8, 0.80, 0.40, True),
    (C2, C3, '2914', 378, 396, 1.08, 1.12, 0.5, 0.62, True),
    (C3, D[12], '1146', 20, 92, 1.0, 1.0, 0.5, 0.42, True),
]


def render_shot(spec, t):
    t0, t1, clip, f0, f1, z0, z1, cx, cy, push = spec
    u = prog(t, t0, t1)
    z = lerp(z0, z1, einout3(u) * 0.6 + u * 0.4)
    if push:
        z *= 1 + 0.045 * (1 - eout3(prog(t, t0, t0 + 0.4)))
    if clip == 'photo':
        img = cover(photo(), W, H, zoom=z, cx=cx, cy=cy - 0.05 * u, sharpen=0.2).astype(np.float32)
        return np.clip(img, 0, 1)
    f = f0 + (f1 - f0) * u
    return shot(clip, f, zoom=z, cx=cx, cy=cy)


def shot_at(t):
    for s in SHOTS:
        if s[0] <= t < s[1]:
            return s
    return None


def zoom_blur(img, amount, cx=W / 2, cy=H / 2, n=5):
    """Dezenter radial motion blur for the push into the logo."""
    if amount < 0.004:
        return img
    acc = np.zeros_like(img)
    for k in range(n):
        s = 1 + amount * k / (n - 1)
        M = np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]])
        acc += cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return acc / n


def dir_blur(img, px):
    if px < 2:
        return img
    k = int(px) | 1
    return cv2.blur(img, (k, 1))


# ------------------------------------------------------------------ logo end
LOGO_PATH = os.path.join(SCR, 'assets2', 'logo.png')


@functools.lru_cache(maxsize=1)
def logo_rgba():
    if not os.path.exists(LOGO_PATH):
        return None
    im = cv2.imread(LOGO_PATH, cv2.IMREAD_UNCHANGED)
    if im.ndim == 2:
        im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGRA)
    if im.shape[2] == 3:
        im = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA)
    im = cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA).astype(np.float32) / 255.0
    im[..., :3] *= im[..., 3:4]
    return im


def end_background(t):
    u = t - D[12]
    bg = shot('1151', 300 - u * 8, zoom=1.15, cx=0.5, cy=0.3, blur=38, bright=0.30)
    return bg * np.array([1.0, 0.92, 0.82], np.float32)


@functools.lru_cache(maxsize=1)
def logo_sign():
    p = os.path.join(SCR, 'assets2', 'logo_sign.npy')
    if not os.path.exists(p):
        return None
    a = np.load(p).astype(np.float32)
    a[..., :3] *= a[..., 3:4]
    return a


@functools.lru_cache(maxsize=1)
def logo_bg():
    """Very dark, heavily blurred warm glow taken from the same logo photo (no new imagery)."""
    a = np.load(os.path.join(SCR, 'assets2', 'logo_sign.npy')).astype(np.float32)[..., :3]
    bg = cover((np.clip(a, 0, 1) * 255).astype(np.uint8), W, H, zoom=1.0, blur=90, bright=0.20)
    return bg * np.array([1.0, 0.88, 0.72], np.float32) + np.array([0.012, 0.010, 0.009], np.float32)


def sc_end(t):
    u = t - D[12]
    sign = logo_sign()
    if sign is None:                                   # fallback: the real sign filmed in IMG_1151
        z = 1.18 + 0.05 * eout3(prog(u, 0, 4.0))
        img = shot('1151', 150 - u * 3, zoom=z, cx=0.5, cy=0.27)
        img *= 0.25 + 0.75 * eout3(prog(u, 0.0, 0.8))
        img *= gradient_v(1180, 1560, 1.0, 0.22)
        ylab = 1620
    else:
        img = logo_bg().copy()
        # slow warm light moving behind the logo
        lx = lerp(260, 820, einout3(prog(u, 0, DUR - D[12])))
        img += radial(int(lx) // 8 * 8, 820, 760, 1.0) * np.array([0.16, 0.09, 0.035], np.float32) * \
            eout3(prog(u, 0.0, 1.2))
        a = eout3(prog(u, 0.0, 0.9))
        sc = 820 / sign.shape[1] * (0.955 + 0.045 * eout3(prog(u, 0.0, 3.6)))
        place(img, sign, W / 2, 840, scale=sc, alpha=a)
        ylab = 840 + sign.shape[0] * sc / 2 + 70
    g1 = G('EICHENDORFFSTRASSE 25 · LIPPSTADT', 'inter', 30, CREAM, 0.22)
    g2 = G('Täglich 17 – 22 Uhr', 'serifi', 50, CREAM, 0.0)
    text_reveal(img, g1, W / 2 - g1.width / 2, cap_y(g1, ylab), D[12] + 1.2, DUR + 5, t, dur=0.9, alpha=0.88)
    text_reveal(img, g2, W / 2 - g2.width / 2, cap_y(g2, ylab + 70), D[12] + 1.5, DUR + 5, t, dur=0.9, alpha=0.88)
    img *= 1 - ein3(prog(t, DUR - 0.5, DUR))            # clean fade-out with the music tail
    return img


# ------------------------------------------------------------------ main compositor
def base(t):
    if t >= D[12]:
        return sc_end(t)
    s = shot_at(t)
    img = render_shot(s, t)
    # ---- transitions (all on measured beats)
    if s[2] == '1151' and s[0] == 0.0:                       # fade up from black with the piano
        img *= eout3(prog(t, 0.0, 1.5))
    if abs(s[0] - D[5]) < 1e-6 and t < D[5] + 0.3:           # cheese on the lens -> reveal the drop
        prev = render_shot(SHOTS[4], D[5] - 1 / 60)
        q = eout3(prog(t, D[5], D[5] + 0.3))
        img = prev * (1 - q) + img * q
    if abs(s[0] - D[7]) < 1e-6 and t < D[7] + 0.2:           # whip into the walk-through
        q = prog(t, D[7], D[7] + 0.2)
        img = dir_blur(img, 140 * (1 - eout3(q)))
    if abs(s[1] - D[7]) < 1e-6 and t > D[7] - 0.16:
        q = prog(t, D[7] - 0.16, D[7])
        img = dir_blur(img, 140 * ein3(q))
    if abs(s[0] - D[9]) < 1e-6 and t < D[9] + 0.45:          # calm dissolve into the breakdown
        prev = render_shot(SHOTS[8], D[9] - 1 / 60)
        q = einout3(prog(t, D[9], D[9] + 0.45))
        img = prev * (1 - q) + img * q
    if abs(s[1] - D[12]) < 1e-6 and t > D[12] - 0.32:        # push into the logo on the final accent
        q = ein3(prog(t, D[12] - 0.32, D[12]))
        M = 1 + 0.22 * q
        img = cv2.warpAffine(img, np.float32([[M, 0, W / 2 * (1 - M)], [0, M, H / 2 * (1 - M)]]), (W, H),
                             flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        img = zoom_blur(img, 0.06 * q) * (1 - 0.85 * q)
    # ---- typography (sparse)
    if t < D[2]:
        img *= gradient_v(1080, 1520, 1.0, 0.30)
        g1 = G('LIPPSTADT', 'inter', 30, CREAM, 0.42)
        text_reveal(img, g1, W / 2 - g1.width / 2, cap_y(g1, 1365), D[1] - 0.1, D[2] - 0.05, t, alpha=0.92)
        g2 = G('Pizza mit Dinkelmehl.', 'serifi', 82, CREAM, 0.0)
        text_reveal(img, g2, W / 2 - g2.width / 2, cap_y(g2, 1455), beat_after(D[1], 2) - 0.1, D[2] - 0.05, t)
    if D[9] <= t < D[10]:
        gq = einout3(prog(t, D[9], D[9] + 0.45))
        img *= 1 - (1 - gradient_v(380, 1250, 0.32, 1.0)) * gq
        g5 = G('5,0', 'serifr', 230, CREAM, 0.0)
        text_reveal(img, g5, W / 2 - g5.width / 2, cap_y(g5, 560), D[9] + 0.35, D[10] - 0.05, t, dur=0.9)
        for j in range(5):
            tj = D[9] + 0.75 + j * 0.08
            a = eout3(prog(t, tj, tj + 0.4)) * (1 - ein3(prog(t, D[10] - 0.35, D[10] - 0.05)))
            if a > 0:
                place(img, star_sprite(54, (0.95, 0.76, 0.36)), W / 2 + (j - 2) * 66, 742, alpha=a)
        g6 = G('BEI FAST 300 GOOGLE-BEWERTUNGEN', 'inter', 28, CREAM, 0.24)
        text_reveal(img, g6, W / 2 - g6.width / 2, cap_y(g6, 810), D[9] + 1.1, D[10] - 0.05, t, alpha=0.9)
    return img


def render(t, frame_idx):
    img = base(t)
    v = vignette()
    img = img * (1 - (1 - v) * 0.55)
    img = apply_grain(img, frame_idx, 0.012)
    return np.clip(img, 0, 1)
