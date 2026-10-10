"""DIZZERIA 47 — Reel #2 "8 STÜCKE". 120 BPM (beat 0.5 s, bar 2 s), 34.0 s."""
import math, functools
import numpy as np
import cv2
from lib import *
from fx2 import *

DUR = 34.0
SH = (12, (0, 8), 0.65)
SH_S = (7, (0, 4), 0.55)
GOLD2 = (1.0, 0.76, 0.25)

IMPACTS = [(0.45, 14), (4.0, 26), (16.0, 8), (22.0, 14), (28.9, 16)]
FLASHES = [(4.0, 0.42, 14)]
FLASH_COL = (1.0, 0.80, 0.55)
CHROMA = []
CUT_T = [1.0, 1.25, 1.5, 1.75]
CUT_ANG = [90, 0, 45, 135]          # line directions (deg)
CUT_DUR = 0.2


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
    """Letters pop up with overshoot (scale from 0.3, rise)."""
    a0 = kw.pop('alpha', 1.0)

    def pg(k, i):
        p = prog(t, t0 + k * stagger, t0 + k * stagger + dur)
        if p <= 0:
            return {'alpha': 0}
        e = eback(p, 2.2)
        return {'scale': 0.35 + 0.65 * e, 'dy': 40 * (1 - eout3(p)), 'alpha': min(p * 4, 1) * a0}
    place_glyphs(DST[0], Gl, x, y, per_glyph=pg, **kw)


def slam(Gl, x, y, t0, t, dur=0.22, s0=1.8, **kw):
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


def marker_in(Gl, x, y, t0, t, dur=0.35, rot=-3, **kw):
    """Hand-written text 'written' left-to-right via a moving clip."""
    p = prog(t, t0, t0 + dur)
    if p <= 0:
        return
    xr = x + (Gl.width + 40) * eout3(p)
    place_glyphs(DST[0], Gl, x, y, clip=(0, 0, xr, H), rot=rot, **kw)


def exit_fade(t, t_end, dur=0.12):
    return 1 - prog(t, t_end - dur, t_end)


# ------------------------------------------------------------------ backgrounds
def bg_char(t, glow=1.0, oven_blur=None):
    if oven_blur:
        img = vid('1169', 120 + t * 25, zoom=1.15, blur=oven_blur, bright=0.32)
        img = img * np.array([1.0, 0.82, 0.66], np.float32)
    else:
        img = np.empty((H, W, 3), np.float32)
        img[...] = CHAR
    img += radial(540, 1050, 1000, 0.75) * np.array([0.30, 0.11, 0.03], np.float32) * glow
    return img


# ------------------------------------------------------------------ hero pizza
@functools.lru_cache(maxsize=4)
def pizza_base(size):
    src = pizza_rgba()
    s = cv2.resize(src, (size, size), interpolation=cv2.INTER_AREA)
    bl = cv2.GaussianBlur(s, (0, 0), 1.4)
    s[..., :3] = np.clip(s[..., :3] + (s[..., :3] - bl[..., :3]) * 0.5, 0, None)
    return s


def hero_pizza(dst, t, cx, cy, size, rot, cuts_done, gap=0.0, cutter_at=None):
    """Draw the real pizza with cut lines (cuts_done: list of progress 0..1 per cut)."""
    base = pizza_base(860)
    sc = size / 860
    if gap < 0.5:
        place(dst, base, cx, cy, scale=sc, rot=rot)
    else:
        # separated slices
        for k in range(8):
            a0 = -90 - 22.5 + k * 45 + rot; a1 = a0 + 45
            mid = math.radians((a0 + a1) / 2)
            spr = slice_sprite(k)
            place(dst, spr, cx + math.cos(mid) * gap, cy + math.sin(mid) * gap, scale=sc, rot=rot)
    # cut lines (dark crease + glow while fresh)
    R = size / 2 * 0.99
    for k, p in enumerate(cuts_done):
        if p <= 0:
            continue
        ang = math.radians(CUT_ANG[k] + rot)
        c, s = math.cos(ang), math.sin(ang)
        x0, y0 = cx - c * R, cy - s * R
        x1, y1 = cx + c * R, cy + s * R
        xe, ye = x0 + (x1 - x0) * p, y0 + (y1 - y0) * p
        if gap < 8:
            lay = np.zeros((H, W), np.float32)
            cv2.line(lay, (int(x0 * 4), int(y0 * 4)), (int(xe * 4), int(ye * 4)), 1.0, 14, cv2.LINE_AA, shift=2)
            dst *= (1 - 0.75 * (1 - gap / 8) * lay[..., None])
            fresh = 1 - prog(t, CUT_T[k] + CUT_DUR, CUT_T[k] + CUT_DUR + 0.35)
            if fresh > 0:
                g = cv2.GaussianBlur(lay, (0, 0), 7)
                dst += g[..., None] * np.array([1.0, 0.6, 0.25], np.float32) * 1.3 * fresh
        if 0 < p < 1 and cutter_at is not None:
            spr, (ax, ay), Rw = cutter_sprite(230)
            place(dst, spr, xe, ye, ax=ax, ay=ay, rot=math.degrees(ang) + 180 + 35,
                  mblur=(c * 18, s * 18), alpha=min(1.0, p * 7, (1 - p) * 7))


@functools.lru_cache(maxsize=8)
def slice_sprite(k):
    base = pizza_base(860)
    c = 430
    a0 = -90 - 22.5 + k * 45
    m = poly_mask(wedge_pts(c, c, c * 1.05, a0, a0 + 45), 860, 860)
    return base * m[..., None]


# ------------------------------------------------------------------ HUD
def hud(dst, t, n_gone, k_cur, appear=1.0):
    if appear <= 0:
        return
    size = 118
    cx, cy = 978, 214
    spr = pizza_slices_sprite(size, 8 - n_gone, gap=2.0)
    place(dst, spr, cx, cy, alpha=appear, rot=0)
    gl = G(f'{k_cur:02d}/08', 'smono', 30, CREAM2, 0.05, SH_S)
    place_glyphs(dst, gl, cx - gl.width / 2, cap_y(gl, cy + 84), alpha=appear * 0.9)


# ------------------------------------------------------------------ reason scenes
REASONS = [
    # k, t0, t1, big, sub, strike_word, clip, f0, fps, kw, mode
    dict(k=1, t0=4.0, t1=6.0, big='DINKEL', sub='Teig mit Dinkelmehl.', tick=True, clip='wa', f0=766, rate=21,
         kw=dict(cx=0.5, cy=0.62, zoom=1.3), mode='window', bgblur=14),
    dict(k=2, t0=6.0, t1=8.0, big='VON HAND', sub='geworfen.', clip='wa', f0=696, rate=16,
         kw=dict(cx=0.5, cy=0.45), mode='window', ann='arrow'),
    dict(k=3, t0=8.0, t1=10.0, big='BELEGT', sub='Stück für Stück.', clip='wa', f0=462, rate=20,
         kw=dict(cx=0.45, cy=0.6), mode='window', ann='underline'),
    dict(k=4, t0=10.0, t1=12.0, big='HEISS', sub='aus dem Ofen.', subcol=CREAM2, clip='1169', f0=1, rate=60,
         kw=dict(cx=0.5, cy=0.5), mode='full', ann='circle'),
    dict(k=5, t0=12.0, t1=14.0, big='FERTIG', sub='und dann: 8 Stücke.', clip='wa', f0=578, rate=34,
         kw=dict(cx=0.5, cy=0.5), mode='window', ann='arrow2'),
    dict(k=6, t0=14.0, t1=16.0, big='SONNE', sub='auf der Terrasse.', subcol=CREAM2, clip='1172', f0=150, rate=52,
         kw=dict(cx=0.42, cy=0.42, zoom=1.2), mode='full', ann='sun'),
]
WIN_R = 900
WIN_HALF = 28
WIN_APEX = (540, 1600)


def win_content(spec, u, scale=1.0):
    bw, bh = slice_box(WIN_R, WIN_HALF, scale)
    f = spec['f0'] + u * spec['rate']
    kw = dict(spec['kw'])
    kw['zoom'] = kw.get('zoom', 1.0) * (1 + 0.16 * u / 2.0)
    return vid(spec['clip'], f, out_w=max(bw, 8), out_h=max(bh, 8), **kw)


def sc_reason(t, spec):
    T0, T1 = spec['t0'], spec['t1']
    u = t - T0
    dur = T1 - T0
    full = spec['mode'] == 'full'
    # background
    if full:
        grow = einout3(prog(u, 0.30, 0.62)) * (1 - einout3(prog(u, dur - 0.46, dur - 0.14)))
    else:
        grow = 0.0
    img = bg_char(t, 1.0, oven_blur=spec.get('bgblur'))
    DST[0] = img
    # window enter / exit
    pin = prog(u, 0.0, 0.3)
    pout = prog(u, dur - 0.12, dur)
    ax, ay = WIN_APEX
    rot = lerp(18, -2.5 if spec['k'] % 2 else 2.5, eback(pin, 1.5))
    dx = lerp(560, 0, eout3(pin)) - 1000 * ein3(pout)
    rot += -30 * ein3(pout)
    if full:
        full_img = vid(spec['clip'], spec['f0'] + u * spec['rate'], **spec['kw'])
        slice_window(img, None, ax + dx, ay + 1400 * grow, WIN_R, WIN_HALF + 30 * grow, rot * (1 - grow),
                     crust=32, seed=spec['k'], scale=1 + 3.4 * grow, full=full_img)
        if grow > 0.995:
            img[...] = full_img
        gv_ = gradient_v(160, 900, 0.30, 1.0)
        img *= 1 - (1 - gv_) * grow
    else:
        slice_window(img, win_content(spec, u), ax + dx, ay, WIN_R, WIN_HALF, rot, crust=32, seed=spec['k'])
    # text
    a = exit_fade(t, T1, 0.14)
    lab = G(f'GRUND {spec["k"]:02d}', 'smono', 30, OVEN, 0.18, SH_S)
    type_on(lab, 84, cap_y(lab, 238), T0 + 0.02, t, cps=40, alpha=a)
    gb = GW(spec['big'], 'unb900', 780, CREAM2, 0.0, SH, max_size=176)
    xb, yb = 84, cap_y(gb, 372)
    pop_in(gb, xb, yb, T0 + 0.05, t, stagger=0.035, alpha=a)
    gs = G(spec['sub'], 'marker', 76, spec.get('subcol', OVEN), 0, SH if spec.get('subcol') else SH_S)
    xs, ys = 92, cap_y(gs, 520)
    marker_in(gs, xs, ys, T0 + 0.32, t, dur=0.38, rot=-3, alpha=a)
    # annotations
    ann = spec.get('ann')
    if spec.get('tick'):
        w0 = spec['sub'].index('Dinkelmehl')
        x0 = xs + gs.xs[w0]; x1 = xs + gs.xs[w0 + len('Dinkelmehl')]
        pts = underline_path(x0 - 4, x1 + 4, ys + gs.baseline + 40 - (x0 - xs) * 0.05, seed=4)
        draw_stroke(img, pts, prog(t, T0 + 0.85, T0 + 1.1), 8, CREAM2, a)
        # big tick next to DINKEL
        tk = np.array([[xb + gb.width + 30, yb + gb.cap_top + gb.cap_h * 0.55],
                       [xb + gb.width + 52, yb + gb.cap_top + gb.cap_h * 0.85],
                       [xb + gb.width + 96, yb + gb.cap_top + gb.cap_h * 0.05]])
        tk = np.vstack([tk[0] + (tk[1] - tk[0]) * s for s in np.linspace(0, 1, 10)] +
                       [tk[1] + (tk[2] - tk[1]) * s for s in np.linspace(0, 1, 16)])
        if xb + gb.width + 100 < 900:
            draw_stroke(img, tk, prog(t, T0 + 1.1, T0 + 1.3), 11, OVEN, a)
    elif ann == 'arrow':
        p0 = (xs + gs.width + 30, ys + gs.cap_top + gs.cap_h * 0.5)
        pts = arrow_path(p0[0], p0[1], p0[0] + 90, p0[1] + 210, bend=-0.35, seed=7)
        pa = prog(t, T0 + 0.75, T0 + 1.0)
        draw_stroke(img, pts, pa, 9, CREAM2, a)
        if pa >= 1:
            for hd in arrow_head(pts[-1][0], pts[-1][1], pts[-6][0], pts[-6][1], 34):
                draw_stroke(img, hd, prog(t, T0 + 1.0, T0 + 1.08), 9, CREAM2, a)
    elif ann == 'underline':
        pts = underline_path(xs - 4, xs + gs.width + 10, ys + gs.baseline + 40, seed=3)
        draw_stroke(img, pts, prog(t, T0 + 0.75, T0 + 0.95), 9, CREAM2, a)
        pts2 = underline_path(xs + 10, xs + gs.width - 20, ys + gs.baseline + 62, seed=5)
        draw_stroke(img, pts2, prog(t, T0 + 0.95, T0 + 1.12), 7, CREAM2, a)
    elif ann == 'circle' and grow > 0.9:
        pts = circle_path(650, 905, 250, 115, seed=9, tilt=-6)
        draw_stroke(img, pts, prog(t, T0 + 0.75, T0 + 1.15), 10, OVEN, a)
        gn = G('da ist sie!', 'marker', 64, CREAM2, 0, SH)
        marker_in(gn, 760, cap_y(gn, 1090), T0 + 1.1, t, dur=0.3, rot=-8, alpha=a)
    elif ann == 'arrow2':
        p0 = (xs + gs.width + 26, ys + gs.cap_top + gs.cap_h * 0.6)
        pts = arrow_path(p0[0], p0[1], p0[0] + 40, p0[1] + 230, bend=0.4, seed=11)
        pa = prog(t, T0 + 0.75, T0 + 1.0)
        draw_stroke(img, pts, pa, 9, CREAM2, a)
        if pa >= 1:
            for hd in arrow_head(pts[-1][0], pts[-1][1], pts[-6][0], pts[-6][1], 34):
                draw_stroke(img, hd, prog(t, T0 + 1.0, T0 + 1.08), 9, CREAM2, a)
    elif ann == 'sun' and grow > 0.9:
        scx, scy = 950, 700
        pts = circle_path(scx, scy, 40, 40, turns=1.05, seed=13, tilt=0)
        draw_stroke(img, pts, prog(t, T0 + 0.7, T0 + 0.95), 9, GOLD2, a)
        for j in range(8):
            an = math.radians(j * 45 + 10)
            ray = np.array([[scx + math.cos(an) * 62, scy + math.sin(an) * 62],
                            [scx + math.cos(an) * 88, scy + math.sin(an) * 88]])
            ray = np.vstack([ray[0] + (ray[1] - ray[0]) * s for s in np.linspace(0, 1, 6)])
            draw_stroke(img, ray, prog(t, T0 + 0.95 + j * 0.03, T0 + 1.02 + j * 0.03), 8, GOLD2, a)
    # HUD
    hud(img, t, spec['k'] - 1, spec['k'], 1.0)
    return img


# ------------------------------------------------------------------ hook
class CutCrumbs:
    """Crust crumbs sprayed along a cut line (normal to it), with gravity."""
    def __init__(self, seed, n=46):
        r = np.random.default_rng(seed)
        self.n = n
        self.s = r.uniform(-0.95, 0.95, n)
        self.t0 = (self.s + 1) / 2 * CUT_DUR
        self.vn = r.normal(0, 520, n)
        self.vt = r.normal(0, 160, n)
        self.vu = r.uniform(-700, -150, n)
        self.rot = r.uniform(0, 360, n); self.w = r.normal(0, 700, n)
        self.sc = r.uniform(0.25, 0.75, n); self.k = r.integers(0, 10, n)

    def draw(self, dst, age, cx, cy, ang, scale):
        if age < 0 or age > 1.3:
            return
        from fx_particles import crumb_sprites
        sp = crumb_sprites()
        a = math.radians(ang); c, s = math.cos(a), math.sin(a)
        R = 350 * scale
        for j in range(self.n):
            tt_ = age - self.t0[j]
            if tt_ < 0:
                continue
            bx, by = cx + c * self.s[j] * R, cy + s * self.s[j] * R
            x = bx + (-s) * self.vn[j] * tt_ + c * self.vt[j] * tt_
            y = by + c * self.vn[j] * tt_ + s * self.vt[j] * tt_ + self.vu[j] * tt_ + 0.5 * 2600 * tt_ * tt_
            if y > H + 40:
                continue
            place(dst, sp[self.k[j]], x, y, scale=self.sc[j], rot=self.rot[j] + self.w[j] * tt_,
                  alpha=min(1, 2 * (1.3 - tt_)))


CUT_CRUMBS = [CutCrumbs(300 + k) for k in range(4)]
CHEESE = (0.96, 0.87, 0.62)


def cheese_strands(dst, t, cx, cy, size, rot, gap):
    """Melted-cheese strands bridging the gaps between separated slices; they thin and snap as gaps widen."""
    r = np.random.default_rng(77)
    R = size / 2
    lay = np.zeros((H, W), np.float32)
    for k in range(8):
        ang = math.radians(-90 - 22.5 + k * 45 + 45 + rot)
        aL = ang - math.radians(22.5); aR = ang + math.radians(22.5)
        for j in range(2):
            rr = R * r.uniform(0.3, 0.78)
            brk = r.uniform(34, 62)
            if gap > brk or gap < 4:
                continue
            px, py = cx + math.cos(ang) * rr, cy + math.sin(ang) * rr
            p1 = np.array([px + math.cos(aL) * gap, py + math.sin(aL) * gap])
            p2 = np.array([px + math.cos(aR) * gap, py + math.sin(aR) * gap])
            L = float(np.hypot(*(p2 - p1)))
            tension = gap / brk
            w_mid = max(2.0, 13 * (1 - tension) ** 0.8 + 2)
            w_end = 15
            sag = (1 - tension) * 0.25 * L + 3
            nrm = np.array([0.0, 1.0])
            n = 14
            for q0 in range(n):
                q = q0 / (n - 1)
                pt = p1 + (p2 - p1) * q + nrm * sag * 4 * q * (1 - q)
                wq = w_mid + (w_end - w_mid) * (abs(2 * q - 1) ** 3)
                cv2.circle(lay, (int(pt[0] * 4), int(pt[1] * 4)), int(wq * 2), 1.0, -1, cv2.LINE_AA, shift=2)
    if lay.max() <= 0:
        return
    m = lay[..., None]
    dst[...] = dst * (1 - m) + np.array(CHEESE, np.float32) * m
    hl = cv2.GaussianBlur(lay, (0, 0), 1.2)
    dst += (hl * 0.18)[..., None]



def hook_geom(t):
    p = prog(t, 0.0, 0.45)
    size = 700
    zin = lerp(2.1, 1.0, eoutexpo(p) if p < 1 else 1)
    rot_in = -160 * (1 - eout3(p))
    zb = 1 + 0.38 * einout3(prog(t, 2.6, 3.95))
    trem = 6 * prog(t, 3.5, 3.98) if t > 3.5 else 0
    cx = 540 + trem * math.sin(t * 90)
    cy = 1030 + trem * math.cos(t * 77)
    spin = 8 * math.sin(t * 1.2) + 30 * einout3(prog(t, 2.6, 3.95))
    gap = 9 * eout3(prog(t, 2.05, 2.35)) + 58 * einout3(prog(t, 2.6, 3.9))
    return cx, cy, size, zin, zb, rot_in, spin, gap


def sc_hook(t):
    img = bg_char(t, 0.8 + 0.4 * prog(t, 2.0, 3.9))
    DST[0] = img
    cx, cy, size, zin, zb, rot_in, spin, gap = hook_geom(t)
    cuts = [eout3(prog(t, CUT_T[k], CUT_T[k] + CUT_DUR)) for k in range(4)]
    hero_pizza(img, t, cx, cy, size * zin * zb, rot_in + spin, cuts, gap=gap, cutter_at=True)
    # flour puff on landing
    if 0.42 < t < 2.0:
        from fx_particles import puff_draw
        puff_draw(img, t - 0.45, cx, cy + size * 0.35)
    # cut crumbs
    for k in range(4):
        CUT_CRUMBS[k].draw(img, t - CUT_T[k], cx, cy, CUT_ANG[k] + rot_in + spin, size * zin * zb / 700)
    # series label
    gl = G('WERKZEUG 1/5: DER PIZZASCHNEIDER', 'smono', 31, CREAM2, 0.06, SH_S)
    type_on(gl, 540 - gl.width / 2, cap_y(gl, 252), 0.1, t, cps=55, alpha=0.85 * (1 - prog(t, 3.4, 3.6)))
    # texts
    a1 = 1 - prog(t, 1.9, 2.02)
    g1 = G('1 DIZZA.', 'unb900', 120, CREAM2)
    slam(g1, 540 - g1.width / 2, cap_y(g1, 370), 0.5, t, alpha=a1)
    g2 = G('8 STÜCKE.', 'unb900', 120, OVEN)
    slam(g2, 540 - g2.width / 2, cap_y(g2, 515), 0.98, t, alpha=a1)
    a2 = 1 - prog(t, 3.55, 3.75)
    g3 = G('8 GRÜNDE,', 'unb900', 112, CREAM2)
    pop_in(g3, 540 - g3.width / 2, cap_y(g3, 360), 2.02, t, alpha=a2)
    g4 = G('warum wir anders sind.', 'marker', 74, OVEN, 0, SH_S)
    marker_in(g4, 540 - g4.width / 2, cap_y(g4, 500), 2.35, t, dur=0.5, rot=-3, alpha=a2)
    return img


# ------------------------------------------------------------------ explosion transition at 4.0
def sc_boom(t):
    """4.0–4.6: the whole hook frame shatters into 8 slices revealing reason 1 underneath."""
    under = sc_reason(t, REASONS[0])
    p = prog(t, 4.0, 4.75)
    if p >= 1:
        return under
    cx, cy, size, zin, zb, rot_in, spin, gap = hook_geom(3.999)
    sc = size * zin * zb / 860
    r = np.random.default_rng(4)
    for k in range(8):
        a0 = -90 - 22.5 + k * 45 + rot_in + spin
        mid = math.radians(a0 + 22.5)
        sp = r.uniform(0.85, 1.2)
        d = gap + (220 * eout3(min(p * 3, 1)) + 1700 * p * p) * sp
        vx = math.cos(mid); vy = math.sin(mid)
        rr = r.uniform(-1, 1) * 70 * p
        grow_ = 1 + 0.5 * p
        mb = 40 * (1 - p) + 20
        place(under, slice_sprite(k), cx + vx * d, cy + vy * d + 500 * p * p, scale=sc * grow_,
              rot=rot_in + spin + rr, mblur=(vx * mb, vy * mb), alpha=1 - prog(p, 0.75, 1.0))
    DST[0] = under
    return under


# ------------------------------------------------------------------ mosaic + rating (16–20) and last slice (20–24)
MOSAIC = [('wa', 1000, 15, dict(cx=0.5, cy=0.6, lo=940, hi=1105)), ('1169', 60, 40, {}),
          ('wa', 700, 10, dict(cx=0.5, cy=0.4, lo=684, hi=760)), ('1172', 120, 20, {}),
          ('wa', 470, 5, dict(lo=462, hi=503)), ('wa', 780, 5, dict(lo=764, hi=811)), ('wa', 600, 7, dict(lo=576, hi=646)),
          ('1146', 40, 30, {})]   # slice 7 (last) = storefront
MOS_C = (540, 1090)
MOS_R = 455


def mosaic(dst, t, n_keep=8, fly=None, center_scale=1.0, rot=0.0, gap=7.0, last_pos=None):
    cx, cy = MOS_C
    R = MOS_R * center_scale
    for k in range(8):
        if k >= n_keep:
            continue
        a0 = -90 - 22.5 + k * 45 + rot
        a1 = a0 + 45
        mid = math.radians((a0 + a1) / 2)
        off = gap
        fx = fy = 0.0
        frot = 0.0
        if fly is not None:
            fp = fly[k]
            fx, fy = math.cos(mid) * 1400 * fp, math.sin(mid) * 1400 * fp
            frot = 70 * fp
        clip, f0, rate, kw = MOSAIC[k]
        pts = wedge_pts(0, 0, R, a0, a1, 32)
        pts = transform_pts(pts, 0, 0, frot, cx + math.cos(mid) * off + fx, cy + math.sin(mid) * off + fy)
        x0, y0 = np.floor(pts.min(0)).astype(int) - 2
        x1, y1 = np.ceil(pts.max(0)).astype(int) + 2
        X0, Y0, X1, Y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
        if X1 <= X0 or Y1 <= Y0:
            continue
        cont = vid(clip, f0 + (t - 16.0) * rate, out_w=X1 - X0, out_h=Y1 - Y0, **kw)
        m = np.zeros((Y1 - Y0, X1 - X0), np.uint8)
        cv2.fillPoly(m, [np.round((pts - [X0, Y0]) * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
        m = m.astype(np.float32)[..., None] / 255
        reg = dst[Y0:Y1, X0:X1]
        sh = cv2.warpAffine(cv2.GaussianBlur(m[..., 0], (0, 0), 14), np.float32([[1, 0, 0], [0, 1, 12]]),
                            (m.shape[1], m.shape[0]))[..., None] * 0.5
        reg *= 1 - sh
        reg[...] = reg * (1 - m) + cont * m
        # crust arc
        arc = pts[1:]
        cr = np.zeros((Y1 - Y0, X1 - X0), np.float32)
        cv2.polylines(cr, [np.round((arc - [X0, Y0]) * 4).astype(np.int32)], False, 1.0, int(26 * 4), cv2.LINE_AA,
                      shift=2)
        cr = cr[..., None] * m
        reg[...] = reg * (1 - cr) + np.array([0.80, 0.50, 0.22], np.float32) * cr


def sc_rating(t):
    u = t - 16.0
    ao = 1 - prog(t, 19.8, 19.98)
    img = bg_char(t, 1.2)
    DST[0] = img
    # assemble: slices fly in from outside (reverse explosion)
    fly = [0.5 * (1 - eout3(prog(u, 0.0 + k * 0.03, 0.34 + k * 0.03))) for k in range(8)]
    rot = -20 * (1 - eout3(prog(u, 0, 0.6))) + 4 * u
    mosaic(img, t, 8, fly=fly, rot=rot)
    # center badge
    pb = eback(prog(u, 0.45, 0.8), 2.0)
    if pb > 0:
        badge = disc_sprite(330, CHAR)
        pb *= (0.6 + 0.4 * ao)
        place(img, badge, MOS_C[0], MOS_C[1], scale=pb, alpha=ao)
        g5 = G('5,0', 'unb900', 120, CREAM2, 0, None)
        place_glyphs(img, g5, MOS_C[0] - g5.width / 2, cap_y(g5, MOS_C[1] - 26), per_glyph=lambda k, i: {
            'dx': ((MOS_C[0] - g5.width / 2 + (g5.xs[i] + g5.xs[i + 1]) / 2) - MOS_C[0]) * (pb - 1)}, scale=pb,
            alpha=ao)
        for j in range(5):
            ts = 16.0 + 0.9 + j * 0.125
            q = prog(t, ts, ts + 0.25)
            if q > 0:
                place(img, star_sprite(44, GOLD2), MOS_C[0] + (j - 2) * 50, MOS_C[1] + 100, scale=eback(q, 3.0),
                      alpha=ao)
    lab = G('GRUND 07', 'smono', 30, OVEN, 0.18, SH_S)
    type_on(lab, 84, cap_y(lab, 238), 16.02, t, cps=40, alpha=ao)
    gb = GW('UNTERM STRICH:', 'unb900', 820, CREAM2, 0, SH, max_size=92)
    pop_in(gb, 84, cap_y(gb, 392), 16.1, t, alpha=ao)
    gs = GW('5,0 bei fast 300 Bewertungen.', 'marker', 820, OVEN, 0, SH_S, max_size=64)
    marker_in(gs, 92, cap_y(gs, 510), 16.5, t, dur=0.45, rot=-3, alpha=ao)
    gst = G('GOOGLE · STAND 10/2026', 'smonor', 26, CREAM2, 0.1, SH_S)
    type_on(gst, 92, cap_y(gst, 598), 17.2, t, cps=40, alpha=0.7 * ao)
    if pb > 0.9:
        pu = underline_path(MOS_C[0] - 105, MOS_C[0] + 105, MOS_C[1] + 50, seed=21)
        draw_stroke(img, pu, prog(t, 17.5, 17.75), 9, OVEN, ao)
    hud(img, t, 6, 7, 1.0)
    return img


@functools.lru_cache(maxsize=None)
def disc_sprite(d, color):
    im, dr, ss = ss_canvas(d, d)
    dr.ellipse([0, 0, d * ss - 1, d * ss - 1], fill=255)
    a = ss_alpha(im, d, d)
    spr = colorize(a, color)
    spr, _ = add_shadow(spr, 16, (0, 10), 0.6)
    return spr


def sc_last(t):
    u = t - 20.0
    img = bg_char(t, 1.0)
    DST[0] = img
    # 7 slices fly away one by one on 8th notes; slice index 7 stays
    order = [0, 4, 2, 6, 1, 5, 3]
    fly = [0.0] * 8
    for j, k in enumerate(order):
        fly[k] = ein3(prog(u, 0.05 + j * 0.25, 0.4 + j * 0.25)) * 1.2
    rot = 4 * (u + 4.0)
    if u < 2.0:
        mosaic(img, t, 8, fly=fly, rot=rot)
        pass
    # last slice moves to center & grows into window, then full-screen storefront (continuous mask)
    q = eout3(prog(u, 2.0, 2.45))
    g = einout3(prog(u, 2.5, 2.92))
    if u >= 2.0:
        a_mid = math.radians(-90 - 22.5 + 7 * 45 + 22.5 + rot)
        sx = MOS_C[0] + math.cos(a_mid) * MOS_R * 0.55
        sy = MOS_C[1] + math.sin(a_mid) * MOS_R * 0.55
        ax = lerp(sx, WIN_APEX[0], q)
        ay = lerp(sy + MOS_R * 0.4, WIN_APEX[1], q)
        sc = lerp(0.5, 1.0, q)
        rr = lerp(-45, -2, q)
        full_img = storefront_bg(t)
        slice_window(img, None, ax, ay + 1400 * g, WIN_R, WIN_HALF + 30 * g, rr * (1 - g), crust=32, seed=8,
                     scale=sc * (1 + 3.4 * g), full=full_img)
        if g > 0.995:
            img[...] = full_img
    # texts
    a1 = 1 - prog(t, 21.85, 22.0)
    lab = G('GRUND 08', 'smono', 30, OVEN, 0.18, SH_S)
    type_on(lab, 84, cap_y(lab, 238), 20.02, t, cps=40)
    if u < 2.0:
        hud(img, t, 7, 8, 1.0)
    g1 = G('DAS LETZTE', 'unb900', 100, CREAM2)
    pop_in(g1, 84, cap_y(g1, 372), 20.05, t, alpha=a1)
    g2 = G('STÜCK?', 'unb900', 150, OVEN)
    slam(g2, 84, cap_y(g2, 520), 20.5, t, alpha=a1)
    if t >= 22.0:
        a2 = 1 - prog(t, 23.74, 23.96)
        lab2 = G('GRUND 08', 'smono', 30, OVEN, 0.18, SH_S)
        place_glyphs(img, lab2, 84, cap_y(lab2, 238), alpha=a2)
        g3 = G('GEHÖRT', 'unb900', 130, CREAM2)
        slam(g3, 84, cap_y(g3, 372), 22.0, t, alpha=a2)
        g4 = G('DIR.', 'unb900', 170, OVEN)
        slam(g4, 84, cap_y(g4, 540), 22.25, t, s0=2.2, alpha=a2)
        gm = G('komm vorbei!', 'marker', 66, CREAM2, 0, SH)
        marker_in(gm, 560, cap_y(gm, 560), 22.7, t, dur=0.4, rot=-6, alpha=a2)
        pts = arrow_path(880, 610, 820, 800, bend=-0.3, seed=31)
        pa = prog(t, 23.0, 23.25)
        draw_stroke(img, pts, pa, 9, CREAM2, a2)
        if pa >= 1:
            for hd in arrow_head(pts[-1][0], pts[-1][1], pts[-6][0], pts[-6][1], 34):
                draw_stroke(img, hd, prog(t, 23.25, 23.32), 9, CREAM2, a2)
    return img


def storefront_bg(t, blur=0.0, bright=1.0):
    f = 20 + (t - 20.0) * 21
    img = vid('1146', f, zoom=1.0, cx=0.5, cy=0.5, dy=400, border=cv2.BORDER_CONSTANT, blur=blur, bright=bright)
    gtop = gradient_v(380, 760, 0.0, 1.0)
    return img * gtop + (1 - gtop) * np.array(CHAR, np.float32)


# ------------------------------------------------------------------ info (24–28)
INFO = [('ADRESSE', 'Eichendorffstraße 25', '59555 Lippstadt'),
        ('ÖFFNUNGSZEITEN', 'Täglich 17–22 Uhr', 'Montag bis Sonntag'),
        ('TELEFON', '01522 3795241', None)]


def sc_info(t):
    u = t - 24.0
    e = eout3(prog(u, 0.0, 0.35))
    img = storefront_bg(t, blur=11 * e, bright=lerp(1.0, 0.4, e))
    img = img * lerp(np.ones(3, np.float32), np.array([1.0, 0.92, 0.84], np.float32), e)
    ax_ = 1 - prog(t, 27.78, 27.96)
    DST[0] = img
    gh = G('So findest du uns:', 'marker', 92, OVEN, 0, SH_S)
    marker_in(gh, 84, cap_y(gh, 470), 24.05, t, dur=0.45, rot=-3, alpha=ax_)
    for j, (lab, v1, v2) in enumerate(INFO):
        t0 = 24.35 + j * 0.5
        p = prog(t, t0, t0 + 0.45)
        if p <= 0:
            continue
        e = eoutexpo(p) * ax_
        yc = 700 + j * 250
        dx = 160 * (1 - e)
        gl = G(lab, 'smono', 30, GOLD2, 0.18, SH_S)
        place_glyphs(img, gl, 88 + dx, cap_y(gl, yc - 52), alpha=e)
        gv = GW(v1, 'unb700', 820, CREAM2, 0, SH, max_size=78)
        place_glyphs(img, gv, 84 + dx * 1.4, cap_y(gv, yc + 22), alpha=e, mblur=(50 * (1 - e) ** 2, 0))
        if v2:
            g2 = G(v2, 'smonor', 34, CREAM2, 0.04, SH_S)
            place_glyphs(img, g2, 88 + dx * 1.7, cap_y(g2, yc + 122), alpha=e * 0.85)
        pts = underline_path(84, 84 + min(gv.width, 820), yc + 80, seed=40 + j)
        draw_stroke(img, pts, prog(t, t0 + 0.35, t0 + 0.6), 6, OVEN, e)
    # exit: shrink to slice handled in end scene
    return img


# ------------------------------------------------------------------ end (28–34)
def sc_end(t):
    u = t - 28.0
    img = bg_char(t, 1.3)
    DST[0] = img
    # info frame shrinks away 28.0–28.35
    p0 = prog(u, 0.0, 0.35)
    if p0 < 1:
        inf = sc_info(min(t, 27.99))
        s = lerp(1.0, 0.0, ein3(p0))
        pts = wedge_pts(0, 0, 2400 * s + 1, -90 - 45, -90 + 45, 64) + [540, 1700]
        m = poly_mask(pts)[..., None]
        img[...] = img * (1 - m) + inf * m
    # slices fly back and assemble the pizza (lands 28.9)
    cx, cy = 540, 650
    size = 560
    for k in range(8):
        tk = 0.15 + k * 0.06
        q = prog(u, tk, tk + 0.55)
        if q <= 0:
            continue
        e = eout3(q)
        a0 = -90 - 22.5 + k * 45; mid = math.radians(a0 + 22.5)
        d = (1 - e) * 1300
        rr = (1 - e) * 120 * (1 if k % 2 else -1) + 6 * u
        spr = slice_sprite(k)
        place(img, spr, cx + math.cos(mid) * d, cy + math.sin(mid) * d, scale=size / 860, rot=rr,
              mblur=(math.cos(mid) * 40 * (1 - e), math.sin(mid) * 40 * (1 - e)))
    # logo + infos
    gl = GW('DIZZERIA 47', 'unb900', 780, CREAM2, 0, SH, max_size=112)
    pop_in(gl, 540 - gl.width / 2, cap_y(gl, 1060), 28.95, t, stagger=0.03)
    gm = G('Dizza. Anders geschnitten.', 'marker', 66, OVEN, 0, SH_S)
    marker_in(gm, 540 - gm.width / 2, cap_y(gm, 1175), 29.4, t, dur=0.5, rot=-3)
    gi = G('PIZZA MIT DINKELMEHL · LIPPSTADT', 'smono', 30, CREAM2, 0.08, SH_S)
    type_on(gi, 540 - gi.width / 2, cap_y(gi, 1270), 29.9, t, cps=45, alpha=0.85)
    gi2 = G('EICHENDORFFSTR. 25 · TÄGLICH 17–22 UHR', 'smono', 30, CREAM2, 0.08, SH_S)
    type_on(gi2, 540 - gi2.width / 2, cap_y(gi2, 1318), 30.5, t, cps=45, alpha=0.85)
    gt = G('WERKZEUG 2/5 FOLGT.', 'smono', 28, OVEN, 0.12, SH_S)
    type_on(gt, 540 - gt.width / 2, cap_y(gt, 1395), 31.2, t, cps=40, alpha=0.95)
    pc = circle_path(540, 650, 305, 305, turns=1.08, seed=51, tilt=-20)
    draw_stroke(img, pc, prog(t, 29.2, 29.8), 9, OVEN, 0.9)
    return img


# ------------------------------------------------------------------ master
SCENES = [(0.0, 4.0, sc_hook), (4.0, 4.75, sc_boom)]
SCENES.append((4.75, 6.0, lambda t: sc_reason(t, REASONS[0])))
for spec in REASONS[1:]:
    SCENES.append((spec['t0'], spec['t1'], (lambda s: (lambda t: sc_reason(t, s)))(spec)))
SCENES += [(16.0, 20.0, sc_rating), (20.0, 24.0, sc_last), (24.0, 28.0, sc_info), (28.0, DUR + 1, sc_end)]


def scene_at(t):
    for a, b, fn in SCENES:
        if a <= t < b:
            return fn
    return SCENES[-1][2]


def render(t, frame_idx):
    img = scene_at(t)(t)
    sx = sy = 0.0
    for ti, amp in IMPACTS:
        dt = t - ti
        if 0 <= dt < 0.5:
            e = amp * math.exp(-dt * 9)
            sx += e * math.sin(dt * 95 + ti); sy += e * math.cos(dt * 77 + ti * 2)
    if abs(sx) + abs(sy) > 0.6:
        img = shift_frame(img, sx, sy, scale=1.015)
    ca = sum(amp * math.exp(-(t - ti) * 14) for ti, amp in CHROMA if 0 <= t - ti < 0.3)
    img = chroma_shift(img, ca)
    fl = sum(amp * math.exp(-(t - ti) * k) for ti, amp, k in FLASHES if 0 <= t - ti < 0.6)
    if fl > 0.01:
        fl = min(fl, 1)
        img = img + np.array(FLASH_COL, np.float32) * fl * 0.9
    img *= vignette()
    img = apply_grain(img, frame_idx, 0.045)
    return np.clip(img, 0, 1)
