"""DIZZERIA 47 — Reel #3 "DIZZERIA, NICHT PIZZERIA".
Rules: client footage only, played 1:1 (no upscaling, no frame blending), cuts on a 120 BPM grid (beat = 0.5 s)
so any 120-BPM sound can be laid on top. Effects only on hits."""
import os, math, functools
import numpy as np
import cv2
from lib import *

DUR = 30.0
BEAT = 0.5
TOMATO = (0.93, 0.22, 0.14)
GOLD = (0.97, 0.74, 0.30)
CREAM = (0.98, 0.95, 0.89)
SH = (14, (0, 8), 0.75)
SH_S = (8, (0, 4), 0.65)
SRC_FPS = {'1197': 30.0}


# ------------------------------------------------------------------ footage (1:1 pixels)
def _lut():
    x = np.arange(256) / 255.0
    y = x + 0.06 * np.sin(np.pi * (x - 0.5)) * (1 - np.abs(2 * x - 1)) * 1.6
    y = np.clip(y, 0, 1)
    return [np.round(np.clip(y * g, 0, 1) * 255).astype(np.uint8) for g in (1.02, 1.0, 0.975)]


LUT = _lut()


@functools.lru_cache(maxsize=48)
def src(name, i):
    n = len(os.listdir(os.path.join(CLIPS, name)))
    i = min(max(int(i), 1), n)
    im = cv2.cvtColor(cv2.imread(os.path.join(CLIPS, name, f'{i:04d}.jpg')), cv2.COLOR_BGR2RGB)
    im = np.dstack([cv2.LUT(im[..., k], LUT[k]) for k in range(3)])
    f = im.astype(np.float32)
    l = f @ np.array([0.299, 0.587, 0.114], np.float32)
    f = l[..., None] + (f - l[..., None]) * 1.07
    return np.clip(f, 0, 255).astype(np.uint8)


def clip(name, t_local, f0, speed=1.0):
    """Nearest source frame for local time (no blending)."""
    fps = SRC_FPS.get(name, 59.94)
    i = f0 + int(round(t_local * fps * speed))
    return src(name, i).astype(np.float32) / 255.0


def shift_int(img, dx, dy):
    """Whole-pixel translation (exact pixel copy, no resampling blur)."""
    dx, dy = int(round(dx)), int(round(dy))
    if dx == 0 and dy == 0:
        return img
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(img, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_NEAREST,
                          borderMode=cv2.BORDER_REPLICATE)


def zoom_about(img, s, cx, cy, blur=0.0):
    if s <= 1.0005:
        return img
    M = np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]])
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    if blur > 0.002:
        acc = out.copy()
        n = 6
        for k in range(1, n):
            s2 = s * (1 + blur * k / n)
            M2 = np.float32([[s2, 0, cx * (1 - s2)], [0, s2, cy * (1 - s2)]])
            acc += cv2.warpAffine(img, M2, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        out = acc / n
    return out


def rgb_split(img, px):
    p = int(round(px))
    if p < 1:
        return img
    out = img.copy()
    out[:, p:, 0] = img[:, :-p, 0]
    out[:, :-p, 2] = img[:, p:, 2]
    return out


def darken_band(img, y0, y1, amount, feather=220):
    """Legibility scrim: darken rows y0..y1 with soft edges (no blur of the image)."""
    y = np.arange(H, dtype=np.float32)
    m = np.clip(np.minimum((y - (y0 - feather)) / feather, ((y1 + feather) - y) / feather), 0, 1)
    m = m * m * (3 - 2 * m)
    img *= (1 - amount * m)[:, None, None]
    return img


# ------------------------------------------------------------------ type helpers
@functools.lru_cache(maxsize=None)
def G(text, fname, size, color=CREAM, tracking=0.0, shadow=SH):
    return Glyphs(text, fname, int(size), color, tracking, shadow)


@functools.lru_cache(maxsize=None)
def GW(text, fname, width, color=CREAM, tracking=0.0, shadow=SH, max_size=600):
    return Glyphs(text, fname, fit_size(text, fname, width, tracking, max_size), color, tracking, shadow)


def cap_y(Gl, cy):
    return cy - (Gl.cap_top + Gl.cap_h / 2)


def slam(dst, Gl, x, y, t0, t, t_out=None, dur=0.16, s0=1.9, out_dur=0.12):
    p = prog(t, t0, t0 + dur)
    if p <= 0:
        return
    if t_out is not None and t >= t_out:
        q = prog(t, t_out, t_out + out_dur)
        if q >= 1:
            return
        a = 1 - q
        s = 1 + 0.25 * ein3(q)
    else:
        a = min(1.0, p * 4)
        s = 1 + (s0 - 1) * (1 - eoutexpo(p))
    cxw = x + Gl.width / 2
    place_glyphs(dst, Gl, x, y, per_glyph=lambda k, i: {
        'dx': ((x + (Gl.xs[i] + Gl.xs[i + 1]) / 2) - cxw) * (s - 1)}, scale=s, alpha=a)


def rise(dst, Gl, x, y, t0, t, t_out=None, stagger=0.03, dur=0.3):
    top = y + Gl.cap_top - Gl.cap_h * 0.25
    bot = y + Gl.baseline + Gl.cap_h * 0.18
    a_out = 1.0
    if t_out is not None:
        a_out = 1 - prog(t, t_out, t_out + 0.12)
        if a_out <= 0:
            return

    def pg(k, i):
        p = prog(t, t0 + k * stagger, t0 + k * stagger + dur)
        if p <= 0:
            return {'alpha': 0}
        e = eoutexpo(p)
        return {'dy': Gl.cap_h * 1.1 * (1 - e), 'clip': (0, top - 30, W, bot + 4), 'alpha': a_out}
    place_glyphs(dst, Gl, x, y, per_glyph=pg)


def typer(dst, Gl, x, y, t0, t, cps=40, t_out=None, alpha=1.0):
    n = int(max(0, t - t0) * cps)
    if n <= 0:
        return
    if t_out is not None:
        alpha *= 1 - prog(t, t_out, t_out + 0.12)
        if alpha <= 0:
            return
    place_glyphs(dst, Gl, x, y, per_glyph=lambda k, i: {'alpha': alpha if i < n else 0.0})


def fade(dst, Gl, x, y, t0, t, t_out=None, dur=0.35, dist=24):
    p = eout3(prog(t, t0, t0 + dur))
    if p <= 0:
        return
    a = p * (1 - prog(t, t_out, t_out + 0.15) if t_out is not None else 1)
    if a > 0:
        place_glyphs(dst, Gl, x, y + dist * (1 - p), alpha=a)


@functools.lru_cache(maxsize=None)
def bar_sprite(w, h, color):
    return rect_sprite(int(w), int(h), color)


@functools.lru_cache(maxsize=None)
def pin_sprite(size=90):
    S = 4
    from PIL import Image, ImageDraw
    im = Image.new('L', (size * S, size * S), 0)
    d = ImageDraw.Draw(im)
    c = size * S / 2
    r = size * S * 0.32
    cy = size * S * 0.38
    d.ellipse([c - r, cy - r, c + r, cy + r], fill=255)
    d.polygon([(c - r * 0.93, cy + r * 0.36), (c + r * 0.93, cy + r * 0.36), (c, size * S * 0.97)], fill=255)
    rr = r * 0.4
    d.ellipse([c - rr, cy - rr, c + rr, cy + rr], fill=0)
    a = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    spr = colorize(a, TOMATO)
    spr, _ = add_shadow(spr, 8, (0, 4), 0.6)
    return spr


# ------------------------------------------------------------------ sections
def sec_hook(t):
    """0–4: 'DAS IST KEINE PIZZERIA.' → strike → 'DAS IST EINE DIZZERIA.'"""
    if t < 2.0:
        img = clip('1147', t, 1)
    else:
        img = clip('1147', t - 2.0, 282)
    img = darken_band(img, 1080, 1560, 0.55)
    x = 70
    if t < 2.0:
        g1 = G('DAS IST', 'anton', 120, CREAM)
        slam(img, g1, x, cap_y(g1, 1130), 0.0, t, t_out=1.95)
        g2 = G('KEINE', 'anton', 120, CREAM)
        slam(img, g2, x + g1.width + 30, cap_y(g2, 1130), 0.5, t, t_out=1.95)
        g3 = GW('PIZZERIA.', 'anton', 940, CREAM, max_size=300)
        y3 = cap_y(g3, 1330)
        slam(img, g3, x, y3, 1.0, t, t_out=1.95, s0=1.6)
        p = eoutexpo(prog(t, 1.5, 1.62))
        if p > 0:
            bw = (g3.width + 30) * p
            place(img, bar_sprite(max(bw, 2), 34, TOMATO), x - 15, 1330, ax=0, ay=17, rot=-4,
                  alpha=1 - prog(t, 1.95, 2.0))
    else:
        g1 = G('DAS IST EINE', 'anton', 110, CREAM)
        slam(img, g1, x, cap_y(g1, 1130), 2.0, t, s0=1.3)
        g3 = GW('DIZZERIA.', 'anton', 940, CREAM, max_size=300)
        g3r = GW('DIZZERIA.', 'anton', 940, TOMATO, max_size=300)
        y3 = cap_y(g3, 1330)
        p = prog(t, 2.0, 2.14)
        s = 1 + 0.6 * (1 - eoutexpo(p))
        cxw = x + g3.width / 2

        def pg(k, i):
            o = {'dx': ((x + (g3.xs[i] + g3.xs[i + 1]) / 2) - cxw) * (s - 1), 'scale': s}
            if i == 0:
                o['alpha'] = 0
            return o
        place_glyphs(img, g3, x, y3, per_glyph=pg)
        # red D flips in on the next beat (positioned exactly like place_glyphs would)
        q = prog(t, 2.5, 2.72)
        if q > 0:
            _, spr, ox, oy = g3r.glyphs[0]
            sy = eback(q, 3.0)
        else:
            _, spr, ox, oy = g3.glyphs[0]
            sy = 1 - prog(t, 2.32, 2.5)
        cxs = spr.shape[1] / 2
        cys = oy + g3.cap_top + g3.cap_h / 2
        gx = x + g3.xs[0] + (cxs - ox)
        gy = y3 + g3.cap_top + g3.cap_h / 2
        gx = cxw + (gx - cxw) * s
        place(img, spr, gx, gy, ax=cxs, ay=cys, scale=s, sy=max(sy, 0.02))
        g4 = G('PIZZA MIT DINKELMEHL · LIPPSTADT', 'mono', 38, CREAM, 0.08, SH_S)
        typer(img, g4, x + 4, cap_y(g4, 1480), 3.0, t, cps=48)
    return img


def sec_walk(t):
    """4–8: walk in through the door (speed 1.45x, nearest frame)."""
    u = t - 4.0
    img = clip('1148', u, 30, speed=1.45)
    g = G('Komm rein.', 'serif', 150, CREAM, 0, SH)
    p = eout3(prog(t, 4.25, 4.6))
    a = p * (1 - prog(t, 5.75, 5.95))
    if a > 0:
        img = darken_band(img, 820, 1080, 0.35 * a)
        place_glyphs(img, g, 540 - g.width / 2, cap_y(g, 950) + 30 * (1 - p), alpha=a)
    g2 = G('WILLKOMMEN IN DER DIZZERIA 47', 'mono', 34, CREAM, 0.14, SH_S)
    if t >= 6.5:
        img = darken_band(img, 1540, 1640, 0.35 * min(1, (t - 6.5) * 5) * (1 - prog(t, 7.85, 8.0)))
    typer(img, g2, 540 - g2.width / 2, cap_y(g2, 1590), 6.5, t, cps=40, t_out=7.85)
    return img


WORDS = [  # t0, t1, clip, f0, speed, label, word, color
    (8.0, 10.0, '1150', 1, 1.0, '01 — DER LADEN', 'GEMÜTLICH.', CREAM),
    (10.0, 11.0, '1154', 100, 1.0, '02 — DIE THEKE', 'BELEGT.', CREAM),
    (11.0, 12.0, '1170', 30, 1.0, '03 — DER OFEN', 'GEBACKEN.', GOLD),
    (12.0, 13.0, '1197', 8, 1.0, '04 — DER KARTON', 'FERTIG.', CREAM),
]


def sec_word(t, spec):
    t0, t1, name, f0, sp, label, word, col = spec
    img = clip(name, t - t0, f0, sp)
    img = darken_band(img, 1230, 1500, 0.5)
    img = darken_band(img, 240, 300, 0.35, feather=160)
    gl = G(label, 'mono', 32, CREAM, 0.16, SH_S)
    typer(img, gl, 72, cap_y(gl, 270), t0 + 0.02, t, cps=70)
    p = eoutexpo(prog(t, t0, t0 + 0.4))
    if p > 0:
        place(img, bar_sprite(max(150 * p, 2), 5, TOMATO), 74, 318, ax=0, ay=2)
    gw = GW(word, 'anton', 930, col, max_size=250)
    rise(img, gw, 70, cap_y(gw, 1370), t0 + 0.02, t, stagger=0.025, dur=0.28)
    return img


TRI = [  # clip, f0, x crop left (source px), caption, slide-in time, direction
    ('1155', 66, 690, 'VON HAND', 13.0, -1),
    ('1170', 120, 330, 'IM OFEN', 13.25, 1),
    ('1154', 60, 330, 'MIT LIEBE', 13.5, -1),
]


def sec_tri(t):
    """13–15: triptych of three 1:1 crops, 'DIZZA.' slams across, freeze + split on the hit."""
    img = clip('1172', 0, 1) if t >= 14.6 else np.zeros((H, W, 3), np.float32) + 0.02
    freeze = 14.0 <= t < 14.35
    for k, (name, f0, xc, cap, tin, d) in enumerate(TRI):
        lt = t - 13.0
        if name == '1155' and freeze:
            lt = 1.0
        fr = clip(name, lt, f0)
        strip = fr[:, xc:xc + 360]
        p = eoutexpo(prog(t, tin, tin + 0.22))
        q = ein3(prog(t, 14.62 + k * 0.06, 14.95 + k * 0.06))
        dy = d * H * (1 - p) + (-d) * H * q
        if p <= 0:
            continue
        dy = int(round(dy))
        x0 = k * 360
        y0, y1 = max(0, dy), min(H, H + dy)
        if y1 > y0:
            img[y0:y1, x0:x0 + 360] = strip[y0 - dy:y1 - dy]
            gc = G(cap, 'mono', 30, CREAM, 0.14, SH_S)
            cy = 1700 + dy
            if 0 < cy < H:
                place_glyphs(img, gc, x0 + 180 - gc.width / 2, cap_y(gc, cy), alpha=min(1, p * 2))
    # separators
    if t < 14.6:
        for k in (1, 2):
            img[:, k * 360 - 3:k * 360 + 3] = 0.02
    if t >= 14.0:
        if freeze:
            img = rgb_split(img, 10 * (1 - prog(t, 14.0, 14.3)))
        gd = GW('DIZZA.', 'anton', 960, TOMATO, max_size=420)
        a = 1 - prog(t, 14.55, 14.7)
        if a > 0:
            img = darken_band(img, 860, 1060, 0.45 * a)
            p = prog(t, 14.0, 14.12)
            s = 1 + 0.9 * (1 - eoutexpo(p))
            x = 540 - gd.width / 2
            cxw = 540
            place_glyphs(img, gd, x, cap_y(gd, 960), per_glyph=lambda k, i: {
                'dx': ((x + (gd.xs[i] + gd.xs[i + 1]) / 2) - cxw) * (s - 1)}, scale=s, alpha=a)
    return img


def sec_rating(t):
    """15–19: terrace + 5,0 slot reel."""
    u = t - 15.0
    img = clip('1172', u, 1)
    img = darken_band(img, 560, 1050, 0.55 * eout3(prog(u, 0.0, 0.3)) * (1 - prog(t, 18.75, 18.95)))
    a_out = 1 - prog(t, 18.75, 18.9)
    if a_out <= 0:
        return img
    gh = G('GOOGLE · BEWERTUNG', 'mono', 34, CREAM, 0.22, SH_S)
    typer(img, gh, 540 - gh.width / 2, cap_y(gh, 560), 15.1, t, cps=45, alpha=a_out)
    big = 330
    gd = G('5', 'anton', big, CREAM)
    gc = G(',0', 'anton', big, CREAM)
    total = gd.width + gc.width
    x0 = 540 - total / 2
    cyc = 760
    yd = cap_y(gd, cyc)
    cell = gd.cap_h * 1.35
    pr = prog(t, 15.25, 16.0)
    pos = 14 * eout3(pr)
    vel = 14 * 3 * (1 - pr) ** 2 / 0.75 if pr < 1 else 0
    clipr = (0, cyc - gd.cap_h * 0.62, W, cyc + gd.cap_h * 0.62)
    if t >= 15.25:
        for dgt in range(int(pos) - 1, int(pos) + 2):
            if dgt < 0:
                continue
            gg = G(str((dgt + 1) % 10), 'anton', big, CREAM)
            off = (dgt - pos) * cell
            place_glyphs(img, gg, x0 + gd.width - gg.width, yd + off, clip=clipr, mblur=(0, min(vel * 14, 70)),
                         alpha=a_out)
        place_glyphs(img, gc, x0 + gd.width, yd, alpha=min(1, (t - 15.25) * 6) * a_out)
    for j in range(5):
        ts = 16.0 + j * 0.125
        q = prog(t, ts, ts + 0.22)
        if q > 0:
            place(img, star_sprite(86), 540 + (j - 2) * 100, 940, scale=eback(q, 3.0), alpha=a_out)
    gs = G('bei fast 300 Bewertungen', 'serif', 72, CREAM, 0, SH)
    fade(img, gs, 540 - gs.width / 2, cap_y(gs, 1040), 16.75, t, t_out=18.75)
    return img


SIGN_C = (670, 860)


def sec_where(t):
    """19–21: logo sign + 'WO FINDEST DU UNS?' then zoom-through into the logo."""
    u = t - 19.0
    img = clip('1151', min(u, 1.5), 30)          # hold frame 120 (logo centred) during the zoom-through
    # cinema bars
    b = int(round(260 * eoutexpo(prog(t, 19.0, 19.3))))
    if b > 0:
        img[:b] *= 0.0
        img[H - b:] *= 0.0
    g1 = G('WO FINDEST', 'anton', 150, CREAM)
    g2 = G('DU UNS?', 'anton', 150, TOMATO)
    t_out = 20.45
    slam(img, g1, 540 - g1.width / 2, cap_y(g1, 1330), 19.25, t, t_out=t_out, s0=1.5)
    slam(img, g2, 540 - g2.width / 2, cap_y(g2, 1490), 19.75, t, t_out=t_out, s0=1.5)
    z = prog(t, 20.5, 21.0)
    if z > 0:
        e = ein3(z)
        s = 1 + 7.0 * e
        img = zoom_about(img, s, SIGN_C[0], SIGN_C[1], blur=0.35 * e)
    return img


def sec_address(t):
    """21–24: storefront + address."""
    u = t - 21.0
    img = clip('1146', u, 8)
    img = darken_band(img, 1300, 1560, 0.6 * eout3(prog(u, 0.1, 0.4)))
    p = eback(prog(t, 21.2, 21.45), 2.4)
    if p > 0:
        place(img, pin_sprite(110), 540, 1300, scale=p)
    g1 = G('EICHENDORFFSTRASSE 25', 'anton', 92, CREAM)
    rise(img, g1, 540 - g1.width / 2, cap_y(g1, 1420), 21.3, t, stagger=0.02, t_out=23.85)
    g2 = G('59555 LIPPSTADT', 'mono', 40, CREAM, 0.2, SH_S)
    typer(img, g2, 540 - g2.width / 2, cap_y(g2, 1515), 21.75, t, cps=40, t_out=23.85)
    return img


def sec_end(t):
    """24–30: doors open → hours → DIZZERIA 47 → fade."""
    u = t - 24.0
    img = clip('1149', u, 84)
    img = darken_band(img, 1180, 1560, 0.55 * eout3(prog(u, 0.0, 0.3)))
    g1 = G('TÄGLICH', 'mono', 40, GOLD, 0.24, SH_S)
    typer(img, g1, 540 - g1.width / 2, cap_y(g1, 1240), 24.25, t, cps=40, t_out=25.85)
    g2 = G('17 – 22 UHR', 'anton', 170, CREAM)
    slam(img, g2, 540 - g2.width / 2, cap_y(g2, 1370), 24.5, t, t_out=25.85, s0=1.5)
    g3 = GW('DIZZERIA 47', 'anton', 900, CREAM, max_size=220)
    rise(img, g3, 540 - g3.width / 2, cap_y(g3, 1330), 26.0, t, stagger=0.035, dur=0.35)
    g4 = G('Komm vorbei.', 'serif', 92, CREAM, 0, SH)
    fade(img, g4, 540 - g4.width / 2, cap_y(g4, 1470), 26.75, t)
    img *= 1 - ein3(prog(t, 29.55, 30.0))
    return img


SECTIONS = [(0.0, 4.0, sec_hook), (4.0, 8.0, sec_walk)]
for spec in WORDS:
    SECTIONS.append((spec[0], spec[1], (lambda s: (lambda t: sec_word(t, s)))(spec)))
SECTIONS += [(13.0, 15.0, sec_tri), (15.0, 19.0, sec_rating), (19.0, 21.0, sec_where), (21.0, 24.0, sec_address),
             (24.0, DUR + 1, sec_end)]

# hits: (time, shake px, flash, rgb split px)
HITS = [(1.5, 10, 0.0, 6), (2.0, 18, 0.35, 10), (4.0, 0, 0.0, 0), (8.0, 6, 0.0, 0), (10.0, 6, 0.0, 0), (11.0, 6, 0.0, 0),
        (12.0, 8, 0.0, 4), (13.0, 0, 0.0, 0), (14.0, 22, 0.55, 12), (15.0, 6, 0.0, 0), (21.0, 24, 0.85, 12),
        (24.0, 6, 0.0, 0), (26.0, 10, 0.0, 0)]


def section_at(t):
    for a, b, fn in SECTIONS:
        if a <= t < b:
            return fn
    return SECTIONS[-1][2]


def render(t, frame_idx):
    img = section_at(t)(t)
    sx = sy = 0.0
    fl = 0.0
    ca = 0.0
    for ti, amp, flash, split in HITS:
        dt = t - ti
        if 0 <= dt < 0.4:
            e = amp * math.exp(-dt * 13)
            sx += e * math.sin(dt * 90 + ti)
            sy += e * math.cos(dt * 71 + ti * 2)
            fl += flash * math.exp(-dt * 22)
            ca += split * math.exp(-dt * 20)
    if abs(sx) >= 1 or abs(sy) >= 1:
        img = shift_int(img, sx, sy)
    if ca >= 1:
        img = rgb_split(img, ca)
    if fl > 0.01:
        img = img + np.array([1.0, 0.97, 0.92], np.float32) * min(fl, 1.0)
    return np.clip(img, 0, 1)
