"""DIZZERIA 47 — Reel #2 (v3, footage-first) "8 STÜCKE". 120 BPM, 34.0 s.

Principles: the client's footage is the hero (iPhone clips full-screen at native resolution, low-res WA clips as
wide cinema bands so they stay sharp), one rendered hero pizza, transitions are blade cuts through the frame."""
import math, functools
import numpy as np
import cv2
from lib import *
from fx2 import *

DUR = 34.0
SH = (12, (0, 8), 0.6)
SH_S = (7, (0, 4), 0.5)
GOLD2 = (1.0, 0.76, 0.25)

IMPACTS = [(0.45, 10), (4.0, 22), (22.0, 10), (28.85, 12)]
CUT_T = [1.0, 1.25, 1.5, 1.75]
CUT_ANG = [90, 0, 45, 135]
CUT_DUR = 0.2
# blade transitions: (time, angle of the cut line in degrees)
BLADES = [(6.0, 22), (8.0, -28), (10.0, 90), (12.0, 32), (14.0, -18), (16.0, 0), (20.0, 28), (28.0, -32)]
BL_PRE, BL_POST = 0.12, 0.40


@functools.lru_cache(maxsize=None)
def G(text, fname, size, color=CREAM2, tracking=0.0, shadow=SH):
    return Glyphs(text, fname, int(size), color, tracking, shadow)


@functools.lru_cache(maxsize=None)
def GW(text, fname, width, color=CREAM2, tracking=0.0, shadow=SH, max_size=400):
    return Glyphs(text, fname, fit_size(text, fname, width, tracking, max_size), color, tracking, shadow)


def cap_y(Gl, cy):
    return cy - (Gl.cap_top + Gl.cap_h / 2)


DST = [None]


def pop_in(Gl, x, y, t0, t, stagger=0.03, dur=0.32, **kw):
    a0 = kw.pop('alpha', 1.0)

    def pg(k, i):
        p = prog(t, t0 + k * stagger, t0 + k * stagger + dur)
        if p <= 0:
            return {'alpha': 0}
        e = eback(p, 2.0)
        return {'scale': 0.4 + 0.6 * e, 'dy': 36 * (1 - eout3(p)), 'alpha': min(p * 4, 1) * a0}
    place_glyphs(DST[0], Gl, x, y, per_glyph=pg, **kw)


def slam(Gl, x, y, t0, t, dur=0.22, s0=1.7, **kw):
    p = prog(t, t0, t0 + dur)
    if p <= 0:
        return
    s = 1 + (s0 - 1) * (1 - eoutexpo(p))
    cxw = x + Gl.width / 2
    a0 = kw.pop('alpha', 1.0)
    place_glyphs(DST[0], Gl, x, y, per_glyph=lambda k, i: {
        'dx': ((x + (Gl.xs[i] + Gl.xs[i + 1]) / 2) - cxw) * (s - 1)}, scale=s, alpha=min(p * 5, 1) * a0, **kw)


def type_on(Gl, x, y, t0, t, cps=30, **kw):
    n = int(max(0, t - t0) * cps)
    if n <= 0:
        return
    a0 = kw.pop('alpha', 1.0)
    place_glyphs(DST[0], Gl, x, y, per_glyph=lambda k, i: {'alpha': a0 if i < n else 0.0}, **kw)


def fade_up(Gl, x, y, t0, t, dur=0.45, dist=26, **kw):
    p = eout3(prog(t, t0, t0 + dur))
    if p <= 0:
        return
    a0 = kw.pop('alpha', 1.0)
    place_glyphs(DST[0], Gl, x, y + dist * (1 - p), alpha=a0 * p, **kw)


# ------------------------------------------------------------------ assets
@functools.lru_cache(maxsize=1)
def pizza_premul():
    a = np.load(os.path.join(ASSETS, 'pizza_hq.npy')).astype(np.float32)
    a[..., :3] *= a[..., 3:4]
    return a


@functools.lru_cache(maxsize=1)
def pizza_shadow():
    a = pizza_premul()[..., 3]
    pad = 120
    s = np.pad(a, pad)
    s = cv2.GaussianBlur(s, (0, 0), 34) * 0.78
    return colorize(s.astype(np.float32), (0.0, 0.0, 0.0))


@functools.lru_cache(maxsize=8)
def pizza_slice(k):
    P = pizza_premul()
    n = P.shape[0]
    c = n / 2
    a0 = -90 - 22.5 + k * 45
    m = poly_mask(wedge_pts(c, c, c * 1.05, a0, a0 + 45, 64), n, n)
    m = cv2.erode(m, np.ones((3, 3), np.uint8))
    return P * m[..., None]


@functools.lru_cache(maxsize=1)
def board_img():
    return np.load(os.path.join(ASSETS, 'board.npy')).astype(np.float32)


def draw_pizza(dst, cx, cy, diam, rot, gap=0.0, keep=range(8), offsets=None, shadow=1.0, alpha=1.0):
    sc = diam / 1600.0
    keep = list(keep)
    if shadow > 0 and len(keep) == 8 and gap < 30 and offsets is None:
        place(dst, pizza_shadow(), cx + 10 * sc * 2, cy + 34 * sc * 2, scale=sc, rot=rot, alpha=shadow * alpha)
    if gap < 0.3 and len(keep) == 8 and offsets is None:
        place(dst, pizza_premul(), cx, cy, scale=sc, rot=rot, alpha=alpha)
        return
    for k in keep:
        mid = math.radians(-90 + k * 45 + rot)
        ox, oy, orot, osc, oal = (offsets[k] if offsets and k in offsets else (0, 0, 0, 1, 1))
        px = cx + math.cos(mid) * gap + ox
        py = cy + math.sin(mid) * gap + oy
        if shadow > 0:
            sh = pizza_slice(k)[..., 3]
            # cheap per-slice shadow: reuse sprite alpha darkened & offset
            place(dst, colorize(cv2.GaussianBlur(sh[::8, ::8], (0, 0), 3) * 0.7, (0, 0, 0)), px + 14 * sc * 2,
                  py + 30 * sc * 2, scale=sc * 8 * osc, rot=rot + orot, alpha=shadow * alpha * oal)
        place(dst, pizza_slice(k), px, py, scale=sc * osc, rot=rot + orot, alpha=alpha * oal)


def draw_cuts(dst, t, cx, cy, diam, rot, gap):
    R = diam / 2 * 0.985
    for k in range(4):
        p = eout3(prog(t, CUT_T[k], CUT_T[k] + CUT_DUR))
        if p <= 0:
            continue
        ang = math.radians(CUT_ANG[k] + rot)
        c, s = math.cos(ang), math.sin(ang)
        x0, y0 = cx - c * R, cy - s * R
        xe, ye = x0 + 2 * R * c * p, y0 + 2 * R * s * p
        lay = np.zeros((H, W), np.float32)
        cv2.line(lay, (int(x0 * 4), int(y0 * 4)), (int(xe * 4), int(ye * 4)), 1.0, 12, cv2.LINE_AA, shift=2)
        crease = max(0.0, 1 - gap / 8)
        if crease > 0:
            dst *= (1 - 0.7 * crease * lay[..., None])
        fresh = 1 - prog(t, CUT_T[k] + CUT_DUR, CUT_T[k] + CUT_DUR + 0.4)
        if fresh > 0:
            g = cv2.GaussianBlur(lay, (0, 0), 6)
            dst += g[..., None] * np.array([1.0, 0.55, 0.2], np.float32) * 1.1 * fresh
        if 0 < p < 1:  # glowing blade tip
            tip = np.zeros((H, W), np.float32)
            cv2.circle(tip, (int(xe * 4), int(ye * 4)), 4 * 6, 1.0, -1, cv2.LINE_AA, shift=2)
            tip = cv2.GaussianBlur(tip, (0, 0), 10) * 2.2
            dst += tip[..., None] * np.array([1.0, 0.8, 0.55], np.float32)


class CutCrumbs:
    def __init__(self, seed, n=40):
        r = np.random.default_rng(seed)
        self.n = n
        self.s = r.uniform(-0.95, 0.95, n)
        self.t0 = (self.s + 1) / 2 * CUT_DUR
        self.vn = r.normal(0, 480, n); self.vt = r.normal(0, 140, n); self.vu = r.uniform(-650, -150, n)
        self.rot = r.uniform(0, 360, n); self.w = r.normal(0, 700, n)
        self.sc = r.uniform(0.25, 0.7, n); self.k = r.integers(0, 10, n)

    def draw(self, dst, age, cx, cy, ang, R):
        if age < 0 or age > 1.3:
            return
        from fx_particles import crumb_sprites
        sp = crumb_sprites()
        a = math.radians(ang); c, s = math.cos(a), math.sin(a)
        for j in range(self.n):
            tt_ = age - self.t0[j]
            if tt_ < 0:
                continue
            bx, by = cx + c * self.s[j] * R, cy + s * self.s[j] * R
            x = bx - s * self.vn[j] * tt_ + c * self.vt[j] * tt_
            y = by + c * self.vn[j] * tt_ + s * self.vt[j] * tt_ + self.vu[j] * tt_ + 1300 * tt_ * tt_
            if y > H + 40:
                continue
            place(dst, sp[self.k[j]], x, y, scale=self.sc[j], rot=self.rot[j] + self.w[j] * tt_,
                  alpha=min(1, 2 * (1.3 - tt_)))


CRUMBS = [CutCrumbs(300 + k) for k in range(4)]


# ------------------------------------------------------------------ hook (0–4)
def hook_geom(t):
    p = prog(t, 0.0, 0.45)
    diam0 = 760
    zin = lerp(1.55, 1.0, eoutexpo(p)) if p < 1 else 1.0
    rot_in = -120 * (1 - eout3(p))
    zb = 1 + 0.32 * einout3(prog(t, 2.6, 3.95))
    trem = 5 * prog(t, 3.5, 3.98) if t > 3.5 else 0
    cx = 540 + trem * math.sin(t * 90)
    cy = 1080 + trem * math.cos(t * 77)
    spin = 6 * math.sin(t * 1.1) + 24 * einout3(prog(t, 2.6, 3.95))
    gap = 8 * eout3(prog(t, 2.05, 2.35)) + 46 * einout3(prog(t, 2.6, 3.9))
    return cx, cy, diam0 * zin * zb, rot_in + spin, gap


def sc_hook(t):
    img = board_img().copy()
    DST[0] = img
    cx, cy, diam, rot, gap = hook_geom(t)
    draw_pizza(img, cx, cy, diam, rot, gap=gap)
    draw_cuts(img, t, cx, cy, diam, rot, gap)
    for k in range(4):
        CRUMBS[k].draw(img, t - CUT_T[k], cx, cy, CUT_ANG[k] + rot, diam / 2)
    gl = G('WERKZEUG 1/5: DER PIZZASCHNEIDER', 'smono', 30, CREAM2, 0.06, SH_S)
    type_on(gl, 540 - gl.width / 2, cap_y(gl, 252), 0.1, t, cps=55, alpha=0.8 * (1 - prog(t, 3.4, 3.6)))
    a1 = 1 - prog(t, 1.9, 2.02)
    g1 = G('1 DIZZA.', 'unb900', 118, CREAM2)
    slam(g1, 540 - g1.width / 2, cap_y(g1, 380), 0.5, t, alpha=a1)
    g2 = G('8 STÜCKE.', 'unb900', 118, OVEN)
    slam(g2, 540 - g2.width / 2, cap_y(g2, 525), 0.98, t, alpha=a1)
    a2 = 1 - prog(t, 3.55, 3.75)
    g3 = G('8 GRÜNDE,', 'unb900', 112, CREAM2)
    pop_in(g3, 540 - g3.width / 2, cap_y(g3, 380), 2.02, t, alpha=a2)
    g4 = G('warum wir anders sind.', 'serif', 88, CREAM2, 0, SH_S)
    fade_up(g4, 540 - g4.width / 2, cap_y(g4, 515), 2.35, t, alpha=a2)
    return img


def sc_boom(t):
    under = sc_reason(t, REASONS[0])
    p = prog(t, 4.0, 4.75)
    if p >= 1:
        return under
    cx, cy, diam, rot, gap = hook_geom(3.999)
    sc = diam / 1600
    r = np.random.default_rng(4)
    for k in range(8):
        mid = math.radians(-90 + k * 45 + rot)
        sp = r.uniform(0.85, 1.2)
        d = gap + (220 * eout3(min(p * 3, 1)) + 1700 * p * p) * sp
        vx, vy = math.cos(mid), math.sin(mid)
        rr = r.uniform(-1, 1) * 70 * p
        mb = 40 * (1 - p) + 20
        place(under, pizza_slice(k), cx + vx * d, cy + vy * d + 500 * p * p, scale=sc * (1 + 0.5 * p),
              rot=rot + rr, mblur=(vx * mb, vy * mb), alpha=1 - prog(p, 0.75, 1.0))
    DST[0] = under
    return under


# ------------------------------------------------------------------ reasons (4–16)
REASONS = [
    dict(k=1, t0=4.0, t1=6.0, big='DINKEL', sub='Teig mit Dinkelmehl.', clip='wa', f0=252, rate=50, lo=212, hi=383,
         kw=dict(cx=0.5, cy=0.5), mode='band'),
    dict(k=2, t0=6.0, t1=8.0, big='VON HAND', sub='geworfen.', clip='wa', f0=696, rate=17, lo=684, hi=731,
         kw=dict(cx=0.5, cy=0.35), mode='window', win=6),
    dict(k=3, t0=8.0, t1=10.0, big='BELEGT', sub='Stück für Stück.', clip='wa', f0=462, rate=20, lo=462, hi=503,
         kw=dict(cx=0.45, cy=0.55), mode='band'),
    dict(k=4, t0=10.0, t1=12.0, big='HEISS', sub='aus dem Ofen.', clip='1169', f0=1, rate=60,
         kw=dict(cx=0.5, cy=0.5), mode='full'),
    dict(k=5, t0=12.0, t1=14.0, big='FERTIG', sub='und dann: 8 Stücke.', clip='wa', f0=552, rate=38, lo=540, hi=646,
         kw=dict(cx=0.42, cy=0.5), mode='window', win=1),
    dict(k=6, t0=14.0, t1=16.0, big='SONNE', sub='auf der Terrasse.', clip='1172', f0=150, rate=52,
         kw=dict(cx=0.42, cy=0.42, zoom=1.15), mode='full'),
]
BAND_Y0, BAND_H = 600, 1000

# ---- refined slice window: a real slice of the client's pizza, footage inside the crust
R_IN = 0.875


@functools.lru_cache(maxsize=8)
def real_window_parts(k):
    P = pizza_premul()
    N = P.shape[0]
    c = N / 2
    mid = -90 + k * 45
    rot = -90 - mid
    M = cv2.getRotationMatrix2D((c, c), -rot, 1.0)
    Rp = cv2.warpAffine(P, M, (N, N), flags=cv2.INTER_LINEAR)
    wm = poly_mask(wedge_pts(c, c, c * 1.05, -112.5, -67.5, 96), N, N)
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    rr = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / c
    ring = np.clip((rr - R_IN) / 0.006 + 0.5, 0, 1)
    crust = Rp * (wm * ring)[..., None]
    inner = wm * (1 - ring) * np.clip(Rp[..., 3] * 4, 0, 1)
    edge = cv2.GaussianBlur(ring, (0, 0), 14) * inner
    x0, x1, y0, y1 = 470, 1130, 0, 812
    crust = crust[y0:y1, x0:x1].copy()
    inner = inner[y0:y1, x0:x1].copy()
    edge = edge[y0:y1, x0:x1].copy()
    sil = np.clip(crust[..., 3] + inner, 0, 1)
    pad = 80
    sh = cv2.GaussianBlur(np.pad(sil, pad), (0, 0), 24) * 0.65
    return crust, inner, edge, colorize(sh.astype(np.float32), (0, 0, 0)), (c - x0, c - y0), pad


def real_slice_window(dst, k, content_fn, ax, ay, s, rot, alpha=1.0):
    crust, inner, edge, shadow, (apx, apy), pad = real_window_parts(k)
    place(dst, shadow, ax + 14, ay + 34, ax=apx + pad, ay=apy + pad, scale=s, rot=rot, alpha=alpha)
    cr, sr = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    A = np.array([[cr * s, -sr * s], [sr * s, cr * s]])
    tvec = np.array([ax, ay]) - A @ np.array([apx, apy])
    h, w = inner.shape
    corners = A @ np.array([[0, w, 0, w], [0, 0, h, h]], float) + tvec[:, None]
    X0, Y0 = max(int(corners[0].min()) - 2, 0), max(int(corners[1].min()) - 2, 0)
    X1, Y1 = min(int(corners[0].max()) + 3, W), min(int(corners[1].max()) + 3, H)
    if X1 - X0 < 4 or Y1 - Y0 < 4:
        return
    Ml = np.hstack([A, (tvec - [X0, Y0])[:, None]]).astype(np.float32)
    m = cv2.warpAffine(inner, Ml, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR)
    e = cv2.warpAffine(edge, Ml, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR)
    cont = content_fn(X1 - X0, Y1 - Y0)
    reg = dst[Y0:Y1, X0:X1]
    shade = (1 - 0.55 * e)[..., None]
    reg[...] = reg * (1 - m[..., None] * alpha) + cont * shade * m[..., None] * alpha
    place(dst, crust, ax, ay, ax=apx, ay=apy, scale=s, rot=rot, alpha=alpha)


def window_frame(spec, t, u):
    f = spec['f0'] + u * spec['rate']
    src = frame('wa', f, spec.get('lo'), spec.get('hi'))
    bg = cover(src, W, H, zoom=1.3, blur=40, bright=0.2)
    bg = bg * np.array([1.0, 0.9, 0.8], np.float32) + np.array(CHAR, np.float32) * 0.55
    p = prog(u, 0.0, 0.42)
    side = 1 if spec['k'] % 2 else -1
    ay = 1800 + 1150 * (1 - eback(p, 1.3))
    rot = side * (2.2 + 14 * (1 - eout3(p))) + 0.7 * math.sin(u * 2.1)
    z = 1.0 + 0.06 * u / 2.0
    kw = dict(spec['kw'])

    def content(bw, bh):
        return cover(src, bw, bh, zoom=z * kw.get('zoom', 1.0), cx=kw.get('cx', 0.5), cy=kw.get('cy', 0.5),
                     sharpen=0.35)
    real_slice_window(bg, spec['win'], content, 540, ay, 1.5, rot)
    return bg


def band_frame(spec, t, u):
    f = spec['f0'] + u * spec['rate']
    kw = dict(spec['kw'])
    z = kw.pop('zoom', 1.0) * (1.0 + 0.07 * u / 2.0)
    src = frame('wa', f, spec.get('lo'), spec.get('hi'))
    # ambient background: same clip, huge blur, dark
    bg = cover(src, W, H, zoom=1.3, blur=40, bright=0.22)
    bg = bg * np.array([1.0, 0.9, 0.8], np.float32) + np.array(CHAR, np.float32) * 0.5
    band = cover(src, W, BAND_H, zoom=z, sharpen=0.35, **kw)
    bg[BAND_Y0:BAND_Y0 + BAND_H] = band
    # soft shadow lines above/below the band
    for y, sgn in ((BAND_Y0, -1), (BAND_Y0 + BAND_H, 1)):
        for d in range(1, 26):
            yy = y + sgn * d - (1 if sgn > 0 else 0)
            if 0 <= yy < H:
                bg[yy] *= 1 - 0.45 * (1 - d / 26) ** 2
    return bg


def sc_reason(t, spec):
    T0, T1 = spec['t0'], spec['t1']
    u = t - T0
    if spec['mode'] == 'full':
        img = vid(spec['clip'], spec['f0'] + u * spec['rate'], sharpen=0.2, **spec['kw'])
        img *= gradient_v(150, 820, 0.32, 1.0)
    elif spec['mode'] == 'window':
        img = window_frame(spec, t, u)
    else:
        img = band_frame(spec, t, u)
    DST[0] = img
    lab = G(f'GRUND {spec["k"]:02d}', 'smono', 30, OVEN, 0.18, SH_S)
    type_on(lab, 84, cap_y(lab, 252), T0 + 0.02, t, cps=40)
    gb = GW(spec['big'], 'unb900', 780, CREAM2, 0.0, SH, max_size=170)
    pop_in(gb, 84, cap_y(gb, 392), T0 + 0.06, t, stagger=0.035)
    gs = G(spec['sub'], 'serif', 86, CREAM2, 0, SH)
    fade_up(gs, 88, cap_y(gs, 522), T0 + 0.35, t)
    return img


# ------------------------------------------------------------------ rating (16–20)
@functools.lru_cache(maxsize=1)
def table_photo():
    im = cv2.cvtColor(cv2.imread(os.path.join(SCR, 'realpizza', 'src.jpg')), cv2.COLOR_BGR2RGB)
    return im


def sc_rating(t):
    u = t - 16.0
    z = 1.0 + 0.10 * einout3(prog(u, 0, 4.0))
    img = cover(table_photo(), W, H, zoom=z, cx=0.5, cy=0.5 + 0.06 * prog(u, 0, 4.0), sharpen=0.25)
    img *= gradient_v(560, 1320, 0.13, 1.0)
    img *= 1 - 0.25 * (1 - gradient_v(1500, 1920, 1.0, 0.0))
    DST[0] = img
    lab = G('GRUND 07', 'smono', 30, OVEN, 0.18, SH_S)
    type_on(lab, 84, cap_y(lab, 252), 16.02, t, cps=40)
    gu = G('UNTERM STRICH:', 'unb900', 64, CREAM2, 0, SH)
    pop_in(gu, 84, cap_y(gu, 360), 16.06, t, stagger=0.02)
    g5 = G('5,0', 'unb900', 300, CREAM2)
    slam(g5, 80, cap_y(g5, 590), 16.35, t, s0=1.5)
    for j in range(5):
        ts = 16.9 + j * 0.125
        q = prog(t, ts, ts + 0.28)
        if q > 0:
            place(img, star_sprite(78, GOLD2), 128 + j * 92, 800, scale=eback(q, 3.0), rot=(1 - eout3(q)) * -60)
    gs = G('bei fast 300 Google-Bewertungen.', 'serif', 70, CREAM2, 0, SH)
    fade_up(gs, 88, cap_y(gs, 905), 17.3, t)
    gst = G('STAND 10/2026', 'smonor', 26, CREAM2, 0.12, SH_S)
    type_on(gst, 90, cap_y(gst, 972), 17.6, t, cps=30, alpha=0.7)
    return img


# ------------------------------------------------------------------ last slice (20–24)
def storefront_bg(t, blur=0.0, bright=1.0):
    f = 20 + (t - 20.0) * 21
    img = vid('1146', f, zoom=1.0, cx=0.5, cy=0.5, dy=400, border=cv2.BORDER_CONSTANT, blur=blur, bright=bright,
              sharpen=0.2)
    gtop = gradient_v(380, 760, 0.0, 1.0)
    return img * gtop + (1 - gtop) * np.array(CHAR, np.float32)


LAST_ORDER = [0, 4, 2, 6, 1, 5, 3]
LAST_KEEP = 7


def sc_last(t):
    u = t - 20.0
    if u < 2.0:
        img = board_img().copy()
        DST[0] = img
        cx, cy, diam = 540, 1080, 760
        rot = 6 * u
        offsets = {}
        keep = []
        for k in range(8):
            if k in LAST_ORDER:
                j = LAST_ORDER.index(k)
                q = ein3(prog(u, 0.05 + j * 0.25, 0.42 + j * 0.25))
                if q >= 1:
                    continue
                mid = math.radians(-90 + k * 45 + rot)
                offsets[k] = (math.cos(mid) * 1300 * q, math.sin(mid) * 1300 * q + 400 * q * q, 80 * q, 1 + 0.2 * q, 1)
            keep.append(k)
        wob = 0
        if u > 1.8:
            wob = 4 * math.sin((u - 1.8) * 40) * (1 - prog(u, 1.8, 2.0))
        if LAST_KEEP in offsets:
            pass
        offsets[LAST_KEEP] = (0, 0, wob, 1, 1)
        draw_pizza(img, cx, cy, diam, rot, gap=6, keep=keep, offsets=offsets)
    else:
        img = storefront_bg(t)
        DST[0] = img
        # the last slice flies into the camera, revealing the shop
        q = prog(u, 2.0, 2.45)
        if q < 1:
            rot = 6 * 2.0
            sc = 760 / 1600 * (1 + 7 * ein3(q))
            mid = math.radians(-90 + LAST_KEEP * 45 + rot)
            place(img, pizza_slice(LAST_KEEP), 540 - math.cos(mid) * 380 * ein3(q), 1080 - math.sin(mid) * 380 * ein3(q),
                  scale=sc, rot=rot + 40 * q, alpha=1 - prog(q, 0.55, 1.0), mblur=(0, 30 * q))
    a1 = 1 - prog(t, 21.85, 22.0)
    lab = G('GRUND 08', 'smono', 30, OVEN, 0.18, SH_S)
    if t < 23.96:
        place_glyphs(img, lab, 84, cap_y(lab, 252), alpha=min(1, (t - 20.02) * 6) * (1 - prog(t, 23.74, 23.96)))
    g1 = G('DAS LETZTE', 'unb900', 104, CREAM2)
    pop_in(g1, 84, cap_y(g1, 385), 20.05, t, alpha=a1)
    g2 = G('STÜCK?', 'unb900', 150, OVEN)
    slam(g2, 84, cap_y(g2, 535), 20.5, t, alpha=a1)
    if t >= 22.0:
        a2 = 1 - prog(t, 23.74, 23.96)
        g3 = G('GEHÖRT', 'unb900', 130, CREAM2)
        slam(g3, 84, cap_y(g3, 385), 22.05, t, alpha=a2)
        g4 = G('DIR.', 'unb900', 170, OVEN)
        slam(g4, 84, cap_y(g4, 552), 22.3, t, s0=2.0, alpha=a2)
        gm = G('Komm vorbei.', 'serif', 84, CREAM2, 0, SH)
        fade_up(gm, 560, cap_y(gm, 560), 22.7, t, alpha=a2)
    return img


# ------------------------------------------------------------------ info (24–28)
INFO = [('ADRESSE', 'Eichendorffstraße 25', '59555 Lippstadt'),
        ('ÖFFNUNGSZEITEN', 'Täglich 17–22 Uhr', 'Montag bis Sonntag'),
        ('TELEFON', '01522 3795241', None)]


def sc_info(t):
    u = t - 24.0
    e = eout3(prog(u, 0.0, 0.4))
    img = storefront_bg(t, blur=5 * e, bright=lerp(1.0, 0.45, e))
    DST[0] = img
    ax_ = 1 - prog(t, 27.78, 27.96)
    gh = G('So findest du uns.', 'serif', 100, CREAM2, 0, SH)
    fade_up(gh, 84, cap_y(gh, 470), 24.05, t, alpha=ax_)
    for j, (lab, v1, v2) in enumerate(INFO):
        t0 = 24.35 + j * 0.5
        p = prog(t, t0, t0 + 0.45)
        if p <= 0:
            continue
        ee = eoutexpo(p) * ax_
        yc = 700 + j * 250
        dx = 160 * (1 - eoutexpo(p))
        gl = G(lab, 'smono', 30, OVEN, 0.18, SH_S)
        place_glyphs(img, gl, 88 + dx, cap_y(gl, yc - 52), alpha=ee)
        gv = GW(v1, 'unb700', 820, CREAM2, 0, SH, max_size=78)
        place_glyphs(img, gv, 84 + dx * 1.4, cap_y(gv, yc + 22), alpha=ee, mblur=(50 * (1 - eoutexpo(p)) ** 2, 0))
        if v2:
            g2 = G(v2, 'serif', 52, CREAM2, 0, SH_S)
            place_glyphs(img, g2, 88 + dx * 1.7, cap_y(g2, yc + 112), alpha=ee * 0.9)
    return img


# ------------------------------------------------------------------ end (28–34)
def sc_end(t):
    u = t - 28.0
    img = board_img().copy()
    DST[0] = img
    cx, cy, diam = 540, 690, 640
    rot = 8 * u
    offsets = {}
    for k in range(8):
        tk = 0.1 + k * 0.06
        q = prog(u, tk, tk + 0.55)
        e = eout3(q)
        mid = math.radians(-90 + k * 45 + rot)
        d = (1 - e) * 1300
        offsets[k] = (math.cos(mid) * d, math.sin(mid) * d, (1 - e) * 120 * (1 if k % 2 else -1), 1, 1 if q > 0 else 0)
    landed = u > 0.85
    if landed:
        draw_pizza(img, cx, cy, diam, rot)
    else:
        draw_pizza(img, cx, cy, diam, rot, gap=0.5, offsets=offsets, shadow=0.6)
    gl = GW('DIZZERIA 47', 'unb900', 780, CREAM2, 0, SH, max_size=112)
    pop_in(gl, 540 - gl.width / 2, cap_y(gl, 1100), 28.95, t, stagger=0.03)
    gm = G('Dizza. Anders geschnitten.', 'serif', 84, OVEN, 0, SH_S)
    fade_up(gm, 540 - gm.width / 2, cap_y(gm, 1215), 29.35, t)
    gi = G('PIZZA MIT DINKELMEHL · LIPPSTADT', 'smono', 30, CREAM2, 0.08, SH_S)
    type_on(gi, 540 - gi.width / 2, cap_y(gi, 1305), 29.9, t, cps=45, alpha=0.85)
    gi2 = G('EICHENDORFFSTR. 25 · TÄGLICH 17–22 UHR', 'smono', 30, CREAM2, 0.08, SH_S)
    type_on(gi2, 540 - gi2.width / 2, cap_y(gi2, 1353), 30.5, t, cps=45, alpha=0.85)
    gt = G('WERKZEUG 2/5 FOLGT.', 'smono', 28, OVEN, 0.12, SH_S)
    type_on(gt, 540 - gt.width / 2, cap_y(gt, 1430), 31.2, t, cps=40, alpha=0.95)
    return img


# ------------------------------------------------------------------ master
SCENES = [(0.0, 4.0, sc_hook), (4.0, 4.75, sc_boom), (4.75, 6.0, lambda t: sc_reason(t, REASONS[0]))]
for spec in REASONS[1:]:
    SCENES.append((spec['t0'], spec['t1'], (lambda s: (lambda t: sc_reason(t, s)))(spec)))
SCENES += [(16.0, 20.0, sc_rating), (20.0, 24.0, sc_last), (24.0, 28.0, sc_info), (28.0, DUR + 1, sc_end)]


def scene_at(t):
    for a, b, fn in SCENES:
        if a <= t < b:
            return fn
    return SCENES[-1][2]


_FROZEN = {}


def frozen_out(T):
    if T not in _FROZEN:
        _FROZEN.clear()
        _FROZEN[T] = scene_at(T - 1 / 60)(T - 1 / 60).copy()
    return _FROZEN[T]


@functools.lru_cache(maxsize=16)
def half_mask(ang):
    a = math.radians(ang)
    nx, ny = -math.sin(a), math.cos(a)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    s = (xx - W / 2) * nx + (yy - H / 2) * ny
    return np.clip(s / 1.5 + 0.5, 0, 1), (nx, ny)


def blade_line(img, ang, p, glow=1.0):
    """Glowing blade sweeping across the frame along the cut line (p: 0..1)."""
    a = math.radians(ang)
    c, s = math.cos(a), math.sin(a)
    L = 1300
    x0, y0 = W / 2 - c * L, H / 2 - s * L
    xe, ye = x0 + 2 * L * c * p, y0 + 2 * L * s * p
    lay = np.zeros((H, W), np.float32)
    cv2.line(lay, (int(x0 * 4), int(y0 * 4)), (int(xe * 4), int(ye * 4)), 1.0, 8, cv2.LINE_AA, shift=2)
    g = cv2.GaussianBlur(lay, (0, 0), 7)
    img += (lay * 0.9 + g * 1.2)[..., None] * np.array([1.0, 0.62, 0.3], np.float32) * glow
    if p < 1:
        tip = np.zeros((H, W), np.float32)
        cv2.circle(tip, (int(xe * 4), int(ye * 4)), 4 * 5, 1.0, -1, cv2.LINE_AA, shift=2)
        img += cv2.GaussianBlur(tip, (0, 0), 12)[..., None] * 2.5 * np.array([1.0, 0.85, 0.6], np.float32)
    return img


def render_scene(t):
    for T, ang in BLADES:
        if T - BL_PRE <= t < T:
            img = scene_at(t)(t)
            return blade_line(img, ang, eout3((t - (T - BL_PRE)) / BL_PRE))
        if T <= t < T + BL_POST:
            inc = scene_at(t)(t)
            out = frozen_out(T)
            q = eout3((t - T) / BL_POST)
            m, (nx, ny) = half_mask(ang)
            d = 1150 * q
            res = inc.copy()
            for sgn, mask in ((1, m), (-1, 1 - m)):
                rot = sgn * 6 * q
                c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
                A = np.array([[c, -s], [s, c]], np.float32)
                tvec = np.array([W / 2 + sgn * nx * d, H / 2 + sgn * ny * d], np.float32) - A @ np.array([W / 2, H / 2],
                                                                                                     np.float32)
                M = np.hstack([A, tvec[:, None]])
                wi = cv2.warpAffine(out, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                wm = cv2.warpAffine(mask, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                sh = cv2.GaussianBlur(wm, (0, 0), 20) * 0.55
                res = res * (1 - sh[..., None])
                res = res * (1 - wm[..., None]) + wi * wm[..., None]
            # ember edge on the cut faces, fading
            if q < 0.6:
                res = blade_line(res, ang, 1.0, glow=(1 - q / 0.6) * 0.6) if d < 6 else res
            return res
    return scene_at(t)(t)


def render(t, frame_idx):
    img = render_scene(t)
    sx = sy = 0.0
    for ti, amp in IMPACTS:
        dt = t - ti
        if 0 <= dt < 0.5:
            e = amp * math.exp(-dt * 9)
            sx += e * math.sin(dt * 95 + ti); sy += e * math.cos(dt * 77 + ti * 2)
    if abs(sx) + abs(sy) > 0.6:
        img = shift_frame(img, sx, sy, scale=1.012)
    dt = t - 4.0
    if 0 <= dt < 0.5:
        img = img + np.array([1.0, 0.8, 0.55], np.float32) * 0.38 * math.exp(-dt * 14)
    img *= 1 - (1 - vignette()) * 0.7
    img = apply_grain(img, frame_idx, 0.018)
    return np.clip(img, 0, 1)
