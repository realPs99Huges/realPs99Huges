"""Dizzeria 47 – Reel. Timeline at 100 BPM (beat 0.6 s, bar 2.4 s), 34.0 s total."""
import math, functools
import numpy as np
import cv2
from PIL import Image, ImageDraw
from lib import *

DUR = 34.0
BEAT = 0.6
SH = (14, (0, 10), 0.6)       # strong text shadow
SH_S = (8, (0, 5), 0.5)       # small text shadow

# ------------------------------------------------------------------ event lists (shared with audio)
IMPACTS = [(0.05, 16), (1.2, 7), (4.8, 22), (9.6, 6), (12.0, 7), (15.42, 9),
           (25.3, 18), (27.0, 16), (31.2, 14)]
FLASHES = [(0.0, 0.9, 7), (2.4, 0.75, 6), (4.8, 1.0, 5), (8.4, 0.3, 10), (12.0, 0.35, 9),
           (14.4, 0.45, 8), (19.2, 0.3, 9), (26.4, 0.4, 8), (28.8, 0.3, 9), (31.2, 0.85, 5)]
CHROMA = [(0.05, 9), (1.2, 5), (4.8, 12), (25.3, 8), (27.0, 9), (31.2, 7)]


# ------------------------------------------------------------------ helpers
def cap_y(G, cy):
    """y (ascent-top) so that cap center sits at cy."""
    return cy - (G.cap_top + G.cap_h / 2)


def glyph_cx(G, x, i):
    return x + (G.xs[i] + G.xs[i + 1]) / 2


@functools.lru_cache(maxsize=None)
def G(text, fname, size, color=CREAM, tracking=0.0, shadow=SH):
    return Glyphs(text, fname, size, color, tracking, shadow)


@functools.lru_cache(maxsize=None)
def GW(text, fname, width, color=CREAM, tracking=0.0, shadow=SH, max_size=2000):
    return Glyphs(text, fname, fit_size(text, fname, width, tracking, max_size), color, tracking, shadow)


def rise_in(Gl, x, y, t0, t, stagger=0.035, dur=0.42, clip_pad=0.18, dist=1.05, **kw):
    """Letters slide up from behind a mask line (editorial reveal)."""
    top = y + Gl.cap_top - Gl.cap_h * clip_pad
    bot = y + Gl.baseline + Gl.cap_h * 0.12
    clip = (0, top - 40, W, bot + 4)

    def pg(k, i):
        p = prog(t, t0 + k * stagger, t0 + k * stagger + dur)
        e = eoutexpo(p)
        if p <= 0:
            return {'alpha': 0}
        v = (1 - e)
        return {'dy': Gl.cap_h * dist * v, 'mblur': (0, min(60 * v * v * 2, 60)), 'clip': clip,
                'rot': 6 * v}
    place_glyphs(DST[0], Gl, x, y, per_glyph=pg, **kw)


def typewriter(Gl, x, y, t0, t, cps=38, **kw):
    n = int(max(0, (t - t0)) * cps)
    if n <= 0:
        return
    cursor = n < len(Gl.text)

    def pg(k, i):
        return {'alpha': 1.0 if i < n else 0.0}
    place_glyphs(DST[0], Gl, x, y, per_glyph=pg, **kw)


def fade_up(Gl, x, y, t0, t, dur=0.45, dist=40, **kw):
    p = eout3(prog(t, t0, t0 + dur))
    if p <= 0:
        return
    a = kw.pop('alpha', 1.0)
    place_glyphs(DST[0], Gl, x, y + dist * (1 - p), alpha=a * p, **kw)


DST = [None]  # current canvas (simple global to keep scene code compact)


def canvas_from(img):
    DST[0] = img
    return img


# ------------------------------------------------------------------ particles
class Flour:
    def __init__(self, seed, n, cx, cy, spread=1.0, speed=(250, 2300), size=(1.5, 10), up=0.0):
        r = np.random.default_rng(seed)
        self.n = n
        ang = r.uniform(0, 2 * np.pi, n)
        sp = speed[0] + (speed[1] - speed[0]) * r.power(2.2, n)[::-1] * r.uniform(0.3, 1.0, n)
        self.vx = np.cos(ang) * sp * spread
        self.vy = np.sin(ang) * sp - up * sp
        self.cx, self.cy = cx, cy
        self.x0 = r.normal(0, 30, n)
        self.y0 = r.normal(0, 30, n)
        self.size = size[0] + (size[1] - size[0]) * r.power(3, n)[::-1] ** 1.0 * r.uniform(0.2, 1, n)
        self.alpha = r.uniform(0.25, 0.9, n)
        self.ph = r.uniform(0, 6.28, n)
        self.life = r.uniform(1.4, 3.2, n)
        self.drag = r.uniform(2.6, 4.5, n)

    def draw(self, dst, age, color=CREAM, gain=1.0):
        if age < 0:
            return
        k = self.drag
        e = (1 - np.exp(-k * age)) / k
        x = self.cx + self.x0 + self.vx * e + 22 * np.sin(age * 1.3 + self.ph)
        y = self.cy + self.y0 + self.vy * e + 0.5 * 140 * age ** 2 * 0.5
        fade = np.clip(1 - (age - self.life * 0.5) / (self.life * 0.5), 0, 1)
        spr = dot_sprite(16)
        for j in range(self.n):
            a = self.alpha[j] * fade[j] * gain
            if a < 0.02 or not (-20 < x[j] < W + 20 and -20 < y[j] < H + 20):
                continue
            sp = math.hypot(self.vx[j] * math.exp(-k[j] * age), self.vy[j] * math.exp(-k[j] * age))
            mb = min(sp / 60.0, 40)
            ang = math.atan2(self.vy[j], self.vx[j])
            place(dst, spr, x[j], y[j], scale=self.size[j] / 8.0, alpha=a, tint=color,
                  mblur=(math.cos(ang) * mb, math.sin(ang) * mb) if mb > 2 else (0, 0))


def puff(dst, age, cx, cy, n=9, seed=5, rmax=520, amax=0.32, color=CREAM, dur=1.8):
    if age < 0 or age > dur:
        return
    r = np.random.default_rng(seed)
    b = blob_sprite(128)
    for j in range(n):
        ox, oy = r.normal(0, 90), r.normal(0, 70)
        rr = rmax * r.uniform(0.5, 1.0)
        ang = r.uniform(0, 360)
        p = eout3(age / dur * 1.3)
        a = amax * (1 - age / dur) ** 1.5 * min(age * 12, 1)
        place(dst, b, cx + ox * (1 + 2.5 * p), cy + oy * (1 + 2.5 * p) - 40 * p, scale=(0.25 + p) * rr / 128,
              rot=ang + 20 * age, alpha=a, tint=color)


@functools.lru_cache(maxsize=None)
def crumb_sprites():
    out = []
    r = np.random.default_rng(11)
    cols = [(0.80, 0.55, 0.29), (0.89, 0.69, 0.42), (0.55, 0.35, 0.17), (0.93, 0.80, 0.58), (0.70, 0.45, 0.22)]
    for k in range(10):
        s = 40
        im, d, ss = ss_canvas(s, s)
        m = r.integers(5, 9)
        pts = []
        for j in range(m):
            a = 2 * math.pi * j / m + r.uniform(-0.3, 0.3)
            rad = s * ss * 0.5 * r.uniform(0.45, 0.95)
            pts.append((s * ss / 2 + rad * math.cos(a), s * ss / 2 + rad * math.sin(a)))
        d.polygon(pts, fill=255)
        a = ss_alpha(im, s, s)
        col = cols[k % len(cols)]
        spr = colorize(a, col)
        # simple shading: darker bottom-right
        yy, xx = np.mgrid[0:s, 0:s] / s
        shade = (1.15 - 0.45 * (xx + yy) / 2)[..., None]
        spr[..., :3] *= shade
        out.append(spr)
    return out


class Crumbs:
    def __init__(self, seed, n, x0, x1, y, vy=(-1900, -700), vx=600):
        r = np.random.default_rng(seed)
        self.n = n
        self.x = r.uniform(x0, x1, n)
        self.y = y + r.normal(0, 25, n)
        self.vx = r.normal(0, vx, n) + (self.x - (x0 + x1) / 2) * 1.4
        self.vy = r.uniform(*vy, n)
        self.rot = r.uniform(0, 360, n)
        self.w = r.normal(0, 600, n)
        self.sc = r.uniform(0.45, 1.5, n) ** 1.3
        self.k = r.integers(0, 10, n)

    def draw(self, dst, age):
        if age < 0 or age > 2.2:
            return
        sp = crumb_sprites()
        g = 3200
        for j in range(self.n):
            x = self.x[j] + self.vx[j] * age
            y = self.y[j] + self.vy[j] * age + 0.5 * g * age * age
            if y > H + 60:
                continue
            vy = self.vy[j] + g * age
            mb = min(abs(vy) / 90, 18)
            place(dst, sp[self.k[j]], x, y, scale=self.sc[j], rot=self.rot[j] + self.w[j] * age,
                  mblur=(0, mb) if mb > 2 else (0, 0))


# ------------------------------------------------------------------ illustrations
@functools.lru_cache(maxsize=None)
def kernel_sprite():
    w, h = 120, 300
    im, d, ss = ss_canvas(w, h)
    S = ss
    # awn (thin line upward from tip)
    d.line([(w * S / 2, 140 * S), (w * S / 2 + 6 * S, 4 * S)], fill=200, width=int(2.2 * S))
    # kernel body (ellipse-ish polygon)
    pts = []
    for j in range(60):
        a = 2 * math.pi * j / 60
        rx, ry = 26, 58
        x = w / 2 + rx * math.sin(a) * (1 - 0.18 * math.cos(a))
        y = 225 + ry * math.cos(a)
        pts.append((x * S, y * S))
    d.polygon(pts, fill=255)
    a = ss_alpha(im, w, h)
    spr = colorize(a, GOLD)
    # center crease
    im2, d2, _ = ss_canvas(w, h)
    d2.line([(w * S / 2, 180 * S), (w * S / 2 + 2 * S, 270 * S)], fill=255, width=int(3 * S))
    crease = ss_alpha(im2, w, h)[..., None]
    spr[..., :3] *= (1 - 0.35 * crease)
    return spr  # anchor: (60, 283) bottom of kernel


def wheat_ear(p, t):
    """Compose a growing Dinkel ear on its own canvas. p: growth 0..1."""
    cw, ch = 420, 820
    can = np.zeros((ch, cw, 4), np.float32)
    # stem
    stem_top, stem_bot = 210, 800
    grow = eout3(clamp01(p * 1.6))
    sy = stem_bot - (stem_bot - stem_top) * grow
    st = rect_sprite(13, stem_bot - stem_top, GOLD, radius=6)
    place(can, st, cw / 2, (stem_top + stem_bot) / 2, clip=(0, sy, cw, ch))
    ker = kernel_sprite()
    n = 11
    for j in range(n):
        side = -1 if j % 2 == 0 else 1
        yy = 700 - j * 44
        tj = 0.25 + j * 0.055
        q = prog(p, tj, tj + 0.18)
        if q <= 0:
            continue
        sc = (1.0 - j * 0.035) * eback(q, 2.6)
        rot = side * (24 - j * 1.2) + 2.5 * math.sin(t * 2.2 + j)
        place(can, ker, cw / 2 + side * 6, yy, ax=60, ay=283, scale=sc, rot=rot)
    # top kernel
    q = prog(p, 0.9, 1.0)
    if q > 0:
        place(can, ker, cw / 2, 700 - n * 44 + 10, ax=60, ay=283, scale=0.6 * eback(q, 2.6), rot=0)
    return can


@functools.lru_cache(maxsize=None)
def icon_sprite(kind, size=104):
    S = 4
    im = Image.new('L', (size * S, size * S), 0)
    d = ImageDraw.Draw(im)
    c = size * S / 2
    if kind == 'pin':
        r = size * S * 0.2
        cy = size * S * 0.42
        d.ellipse([c - r, cy - r, c + r, cy + r], fill=255)
        d.polygon([(c - r * 0.92, cy + r * 0.38), (c + r * 0.92, cy + r * 0.38), (c, size * S * 0.80)], fill=255)
        rr = r * 0.42
        d.ellipse([c - rr, cy - rr, c + rr, cy + rr], fill=0)
    elif kind == 'clock':
        r = size * S * 0.26
        d.ellipse([c - r, c - r, c + r, c + r], outline=255, width=int(size * S * 0.055))
        d.line([(c, c), (c, c - r * 0.62)], fill=255, width=int(size * S * 0.055))
        d.line([(c, c), (c + r * 0.5, c + r * 0.12)], fill=255, width=int(size * S * 0.055))
        d.ellipse([c - 8, c - 8, c + 8, c + 8], fill=255)
    elif kind == 'phone':
        w2, h2 = size * S * 0.17, size * S * 0.27
        d.rounded_rectangle([c - w2, c - h2, c + w2, c + h2], radius=size * S * 0.06, outline=255,
                            width=int(size * S * 0.05))
        d.line([(c - w2 * 0.35, c + h2 * 0.7), (c + w2 * 0.35, c + h2 * 0.7)], fill=255,
               width=int(size * S * 0.045))
    a = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    # background disc
    im2 = Image.new('L', (size * S, size * S), 0)
    ImageDraw.Draw(im2).ellipse([0, 0, size * S - 1, size * S - 1], fill=255)
    disc = np.asarray(im2.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    out = colorize(disc, TOMATO)
    ic = colorize(a, CREAM)
    out = ic + out * (1 - ic[..., 3:4])
    return out


@functools.lru_cache(maxsize=None)
def tricolor(w=360, h=10):
    out = np.zeros((h, w, 4), np.float32)
    third = w // 3
    for k, col in enumerate((BASIL, CREAM, TOMATO)):
        out[:, k * third:(k + 1) * third if k < 2 else w, :3] = col
    out[..., 3] = 1
    return out


@functools.lru_cache(maxsize=None)
def badge_ring(radius=215, text='PIZZA MIT DINKELMEHL • LIPPSTADT • ', size=36):
    s = int(radius * 2 + 140)
    can = np.zeros((s, s, 4), np.float32)
    f = font('mono', size)
    n = len(text)
    tot = sum(f.getlength(ch) for ch in text)
    circ = 2 * math.pi * radius
    scale = circ / tot
    acc = 0
    for ch in text:
        wch = f.getlength(ch) * scale
        ang = (acc + wch / 2) / circ * 360 - 90
        acc += wch
        if ch == ' ':
            continue
        g = Glyphs(ch, 'mono', size, CREAM)
        _, spr, ox, oy = g.glyphs[0]
        cx = s / 2 + radius * math.cos(math.radians(ang))
        cy = s / 2 + radius * math.sin(math.radians(ang))
        place(can, spr, cx, cy, ax=spr.shape[1] / 2, ay=oy + g.cap_top + g.cap_h / 2, rot=ang + 90)
    # rings
    im, d, ss = ss_canvas(s, s)
    for rr, wd in ((radius + 44, 3), (radius - 42, 3)):
        d.ellipse([s * ss / 2 - rr * ss, s * ss / 2 - rr * ss, s * ss / 2 + rr * ss, s * ss / 2 + rr * ss],
                  outline=255, width=wd * ss)
    ring = colorize(ss_alpha(im, s, s), CREAM)
    can = ring + can * (1 - ring[..., 3:4])
    return can


# ------------------------------------------------------------------ receipt cards
QUOTES = [
    ("Schmeckt richtig authentisch – und ist wunderschön angerichtet.", "GOOGLE-BEWERTUNG · SINNGEMÄSS"),
    ("Super freundliches Personal und eine top Beratung beim Bestellen.", "GOOGLE-BEWERTUNG · SINNGEMÄSS"),
    ("Amazing Dizza and great hospitality!", "GOOGLE-BEWERTUNG"),
]
PAPER = (0.972, 0.952, 0.905)
INK2 = (0.10, 0.08, 0.065)


@functools.lru_cache(maxsize=None)
def card_base(k):
    quote, foot = QUOTES[k]
    cw = 860
    padx = 58
    fsz = 84 if k < 2 else 100
    f = font('serif', fsz)
    lh = int(fsz * 1.06)
    words = quote.split(' ')
    lines, cur = [], []
    maxw = cw - 2 * padx
    for wd in words:
        trial = ' '.join(cur + [wd])
        if cur and f.getlength(trial) > maxw:
            lines.append(cur); cur = [wd]
        else:
            cur.append(wd)
    lines.append(cur)
    top = 150
    text_h = lh * len(lines)
    extra = 190 if k == 2 else 0
    ch = top + text_h + 150 + extra
    tooth, th = 26, 14
    # paper shape
    S = 2
    im = Image.new('L', (cw * S, ch * S), 0)
    d = ImageDraw.Draw(im)
    pts = [(0, th * S)]
    nt = cw // tooth
    for j in range(nt + 1):
        x = j * tooth
        pts.append((x * S, (th if j % 2 == 0 else 0) * S))
    pts.append((cw * S, th * S))
    pts.append((cw * S, (ch - th) * S))
    for j in range(nt, -1, -1):
        x = j * tooth
        pts.append((x * S, (ch - th if j % 2 == 0 else ch) * S))
    pts.append((0, (ch - th) * S))
    d.polygon(pts, fill=255)
    a = np.asarray(im.resize((cw, ch), Image.LANCZOS)).astype(np.float32) / 255
    rng = np.random.default_rng(k + 9)
    noise = cv2.GaussianBlur(rng.standard_normal((ch, cw)).astype(np.float32), (0, 0), 1.2) * 0.012
    grad = np.linspace(1.0, 0.965, ch, dtype=np.float32)[:, None]
    base = np.zeros((ch, cw, 4), np.float32)
    for i in range(3):
        base[..., i] = (PAPER[i] * grad + noise) * a
    base[..., 3] = a
    # header: stars + label
    st = star_sprite(36)
    for j in range(5):
        place(base, st, padx + 18 + j * 42, 72)
    lab = Glyphs('GOOGLE  ★ 5,0'.replace('★', '·'), 'mono', 25, INK2, 0.08)
    place_glyphs(base, lab, cw - padx - lab.width, cap_y(lab, 72), alpha=0.65)
    # dashed lines
    for yy in (116, top + text_h + 40 + extra):
        for x in range(padx, cw - padx, 22):
            base[yy:yy + 3, x:x + 12, :3] = np.array(INK2) * 0.35
            base[yy:yy + 3, x:x + 12, 3] = 0.35
    ft = Glyphs(foot, 'mono', 23, INK2, 0.06)
    place_glyphs(base, ft, padx, cap_y(ft, top + text_h + 92 + extra), alpha=0.6)
    num = Glyphs(f'#{k + 1:02d}/03', 'mono', 23, INK2, 0.06)
    place_glyphs(base, num, cw - padx - num.width, cap_y(num, top + text_h + 92 + extra), alpha=0.6)
    # word layout
    wl = []
    y = top
    for ln in lines:
        x = padx
        for wd in ln:
            g = Glyphs(wd, 'serif', fsz, INK2)
            wl.append((g, x, y))
            x += f.getlength(wd + ' ')
        y += lh
    shadowed, pad = add_shadow(base, 22, (0, 18), 0.55)
    return shadowed, pad, wl, top + text_h


@functools.lru_cache(maxsize=None)
def stamp_sprite():
    w, h = 600, 210
    S = 3
    im = Image.new('L', (w * S, h * S), 0)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([6 * S, 6 * S, (w - 6) * S, (h - 6) * S], radius=26 * S, outline=255, width=10 * S)
    d.rounded_rectangle([24 * S, 24 * S, (w - 24) * S, (h - 24) * S], radius=16 * S, outline=255, width=4 * S)
    f = font('anton', 118 * S)
    txt = 'MUST VISIT!'
    tw = f.getlength(txt)
    bb = f.getbbox(txt)
    d.text(((w * S - tw) / 2, (h * S - (bb[3] + bb[1])) / 2), txt, font=f, fill=255)
    a = np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
    rng = np.random.default_rng(4)
    n1 = cv2.GaussianBlur(rng.random((h, w)).astype(np.float32), (0, 0), 1.0)
    n2 = cv2.GaussianBlur(rng.random((h, w)).astype(np.float32), (0, 0), 6)
    grunge = np.clip((n1 * 0.5 + n2 * 0.9 - 0.32) * 3.0, 0, 1)
    a = a * (0.35 + 0.65 * grunge) * 0.92
    return colorize(a.astype(np.float32), (0.83, 0.13, 0.11))


def draw_card(dst, k, t, t_in, x, y, rot, scale=1.0, dim=1.0, stamp_t=None):
    base, pad, wl, text_bot = card_base(k)
    can = base.copy()
    nw = len(wl)
    for j, (g, wx, wy) in enumerate(wl):
        tw0 = t_in + 0.28 + j * 0.075
        p = eout3(prog(t, tw0, tw0 + 0.22))
        if p <= 0:
            continue
        place_glyphs(can, g, pad + wx, pad + wy + 18 * (1 - p), alpha=p)
    if stamp_t is not None and t >= stamp_t:
        ps = prog(t, stamp_t, stamp_t + 0.11)
        sc = lerp(2.4, 1.0, ein3(ps))
        al = 0.15 + 0.85 * ps
        sp = stamp_sprite()
        place(can, sp, can.shape[1] * 0.56, pad + text_bot + 125, scale=sc * 0.92, rot=-7, alpha=al)
    if dim < 1:
        can[..., :3] *= dim
    place(dst, can, x, y, scale=scale, rot=rot)


# ------------------------------------------------------------------ backgrounds
def dark_bg(t, clip='1150', f0=40, glow=True):
    img = video_layer('1154', 188 + t * 60 * 0.42, zoom=1.1, cx=0.5, cy=0.4, blur=4, bright=0.40)
    img = img * np.array([1.0, 0.86, 0.72], np.float32) + np.array([0.03, 0.02, 0.012], np.float32)
    if glow:
        img += radial(540, 980, 900, 0.8) * np.array([0.20, 0.10, 0.04], np.float32)
    return img


# ================================================================== SCENES
FL_HOOK = Flour(1, 140, 540, 980, speed=(200, 1500), size=(1.5, 7))
FL_DINKEL = Flour(2, 340, 540, 1010, speed=(300, 2600), size=(1.5, 11))
FL_DROP = Flour(3, 180, 540, 1300, speed=(300, 2200), size=(1.5, 8), up=0.35)
CR_DIZZA = Crumbs(7, 70, 140, 940, 1010)
CR_STARS = [Crumbs(20 + j, 12, 0, 0, 0) for j in range(5)]


def sc_hook(t):
    f = 165 + t * 60 * 0.65
    zp = 0.4 * (1 - eoutexpo(prog(t, 0, 0.5)))
    img = video_layer('1155', f, zoom=1.42 + 0.1 * t / 2.4 + zp, cx=0.72, cy=0.40, bright=0.86)
    img *= (1 - 0.45 * radial(540, 960, 760, 1.5))
    canvas_from(img)
    G1 = G('PIZZA?', 'anton', 330, CREAM)
    G2 = G('DIZZA.', 'anton', 330, CREAM)
    G2r = G('DIZZA.', 'anton', 330, TOMATO)
    cy = 930
    x1 = 540 - G1.width / 2
    x2 = 540 - G2.width / 2
    y = cap_y(G1, cy)
    sl = prog(t, 0.04, 0.36)
    s = 1 + 0.75 * (1 - eoutexpo(sl))
    al = prog(t, 0.04, 0.09)
    pf = prog(t, 1.2, 1.42)
    bump = 1 + 0.07 * math.sin(math.pi * prog(t, 1.28, 1.5)) if t > 1.28 else 1
    s *= bump
    for k, (i, spr, ox, oy) in enumerate(G1.glyphs):
        gx1 = x1 + (G1.xs[i] + G1.xs[i + 1]) / 2
        gx2 = x2 + (G2.xs[i] + G2.xs[i + 1]) / 2
        gx = lerp(gx1, gx2, eout3(pf))
        gx = 540 + (gx - 540) * s
        flip = i in (0, 5)
        if flip and pf > 0:
            if pf < 0.45:
                sy = math.cos(pf / 0.45 * math.pi / 2)
                src = (spr, ox, oy, G1)
            else:
                sy = eback((pf - 0.45) / 0.55, 3.0)
                gi = [g for g in G2r.glyphs if g[0] == i][0]
                src = (gi[1], gi[2], gi[3], G2r)
            sp, oxx, oyy, GG = src
            cys = oyy + GG.cap_top + GG.cap_h / 2
            place(img, sp, gx, cy, ax=sp.shape[1] / 2, ay=cys, scale=s, sy=max(sy, 0.01), alpha=al)
        else:
            cys = oy + G1.cap_top + G1.cap_h / 2
            place(img, spr, gx, cy, ax=spr.shape[1] / 2, ay=cys, scale=s, alpha=al,
                  mblur=(0, 0))
    # flour spark when the D lands
    FL_HOOK.draw(img, t - 1.3, gain=0.7)
    # tag line
    tg = G('( JA, MIT D. )', 'mono', 44, CREAM, 0.12, SH_S)
    typewriter(tg, 540 - tg.width / 2, cap_y(tg, 1150), 1.55, t, cps=30, alpha=0.9)
    return img


def sc_dinkel(t):
    u = t - 2.4
    img = dark_bg(u)
    canvas_from(img)
    puff(img, u, 540, 1010, rmax=560, amax=0.28)
    # wheat ear
    ear = wheat_ear(prog(u, 0.35, 1.45), u)
    place(img, ear, 540, 665, ax=210, ay=800, scale=0.82, rot=-6 + 2 * math.sin(u * 1.4))
    # D wie
    g1 = G('D wie', 'serif', 132, CREAM)
    fade_up(g1, 540 - g1.width / 2, cap_y(g1, 760), 0.06, u, dist=50)
    g2 = GW('DINKEL.', 'anton', 900, GOLD)
    y2 = cap_y(g2, 1010)
    rise_in(g2, 540 - g2.width / 2, y2, 0.14, u, stagger=0.045)
    g3 = G('PIZZA AUS DINKELMEHL', 'mono', 40, CREAM, 0.16, SH_S)
    typewriter(g3, 540 - g3.width / 2, cap_y(g3, 1240), 1.25, u, cps=34, alpha=0.85)
    FL_DINKEL.draw(img, u, gain=1.0)
    return img


def sc_store(t):
    u = t - 4.8
    zp = 0.28 * (1 - eoutexpo(prog(u, 0, 0.55)))
    img = video_layer('1146', 20 + u * 60, zoom=1.07 + 0.06 * u / 2.4 + zp, cx=0.5, cy=0.40)
    img *= gradient_v(900, 1500, 1.0, 0.28)
    canvas_from(img)
    FL_DROP.draw(img, u, gain=0.8)
    g0 = G('WILLKOMMEN IN DER', 'mono', 34, CREAM, 0.2, SH_S)
    typewriter(g0, 540 - g0.width / 2, cap_y(g0, 1110), 0.12, u, cps=40, alpha=0.85)
    g1 = GW('DIZZERIA 47', 'anton', 900, CREAM)
    rise_in(g1, 540 - g1.width / 2, cap_y(g1, 1255), 0.05, u, stagger=0.032)
    p = eoutexpo(prog(u, 0.55, 0.95))
    if p > 0:
        tc = tricolor(420, 10)
        place(img, tc, 540, 1395, sx=p, alpha=1)
    g2 = G('PIZZA MIT DINKELMEHL · LIPPSTADT', 'mono', 33, CREAM, 0.1, SH_S)
    typewriter(g2, 540 - g2.width / 2, cap_y(g2, 1450), 0.8, u, cps=48, alpha=0.9)
    return img


WORDS = [
    # start, dur, clip, f0, speed, zoom, cx, cy, idx, label, word, sub, color
    (7.2, 1.2, '1150', 40, 1.5, 1.10, 0.5, 0.5, '01', 'DER LADEN', 'GEMÜTLICH.', 'Reinkommen & wohlfühlen.', CREAM),
    (8.4, 1.2, '1153', 110, 1.4, 1.12, 0.5, 0.45, '02', 'DIE DETAILS', 'STILVOLL.', 'Bis ins kleinste Detail.', CREAM),
    (9.6, 2.4, '1154', 40, 1.0, 1.08, 0.5, 0.45, '03', 'DIE ZUTATEN', 'FRISCH.', 'Belegt vor deinen Augen.', CREAM),
    (12.0, 2.4, '1155', 8, 1.0, 1.42, 0.74, 0.42, '04', 'DER TEIG', 'HANDGEMACHT.',
     'Aus Dinkelmehl – mit Liebe geworfen.', GOLD),
]


def sc_word(t, spec):
    T0, dur, clip, f0, spd, zm, cx, cy, idx, label, word, sub, col = spec
    u = t - T0
    img = video_layer(clip, f0 + u * 60 * spd, zoom=zm + 0.05 * u / dur, cx=cx, cy=cy)
    img *= gradient_v(1000, 1560, 1.0, 0.25)
    img *= gradient_v(150, 420, 0.55, 1.0)
    canvas_from(img)
    # label top
    gl = G(f'{idx} / 04 — {label}', 'mono', 32, CREAM, 0.14, SH_S)
    typewriter(gl, 84, cap_y(gl, 300), 0.02, u, cps=60, alpha=0.9)
    p = eoutexpo(prog(u, 0.0, 0.5))
    ln = rect_line(int(120 * p))
    if ln is not None:
        place(img, ln, 84, 342, ax=0, ay=1)
    gw = GW(word, 'anton', 910, col, max_size=260)
    yw = cap_y(gw, 1250)
    rise_in(gw, 84, yw, 0.02, u, stagger=0.028, dur=0.38)
    gs = G(sub, 'serif', min(76, fit_size(sub, 'serif', 900)), CREAM, 0, SH_S)
    fade_up(gs, 86, cap_y(gs, 1400), 0.22, u, dist=30)
    return img


@functools.lru_cache(maxsize=None)
def rect_line(w):
    if w < 2:
        return None
    return rect_sprite(w, 3, TOMATO)


def sc_rating(t):
    u = t - 14.4
    img = video_layer('1150', 250 + u * 60 * 0.55, zoom=1.12, blur=5, bright=0.40)
    img = img * np.array([1.0, 0.9, 0.78], np.float32)
    img += radial(540, 900, 800, 1.0) * np.array([0.10, 0.05, 0.02], np.float32)
    canvas_from(img)
    # exit: slide everything up
    ex = ein3(prog(u, 4.62, 4.8))
    oy = -380 * ex
    a_all = 1 - ex
    gh = G('GOOGLE · BEWERTUNG', 'mono', 34, CREAM, 0.22, SH_S)
    typewriter(gh, 540 - gh.width / 2, cap_y(gh, 600) + oy, 0.05, u, cps=40, alpha=0.85 * a_all)
    # slot-machine digit + ",0"
    big = 400
    gd = G('5', 'anton', big, CREAM)
    gc = G(',0', 'anton', big, CREAM)
    total = gd.width + gc.width
    x0 = 540 - total / 2
    cyc = 840 + oy
    yd = cap_y(gd, cyc)
    cell = gd.cap_h * 1.35
    pr = prog(u, 0.1, 1.02)
    pos = 15 * eout3(pr) if pr < 1 else 15
    vel = 15 * 3 * (1 - pr) ** 2 / 0.92 if pr < 1 else 0
    clip = (0, cyc - gd.cap_h * 0.62, W, cyc + gd.cap_h * 0.62)
    if u > 0.1:
        for d in range(int(pos) - 1, int(pos) + 2):
            if d < 0:
                continue
            gg = G(str(d % 10), 'anton', big, CREAM)
            off = (d - pos) * cell
            gx = x0 + gd.width - gg.width
            place_glyphs(img, gg, gx, yd + off, clip=clip, mblur=(0, min(vel * 18, 80)), alpha=a_all)
        # ",0"
        place_glyphs(img, gc, x0 + gd.width, yd, alpha=prog(u, 0.1, 0.3) * a_all)
    # shine across number after landing
    sh = prog(u, 1.1, 1.6)
    if 0 < sh < 1:
        bx = lerp(x0 - 200, x0 + total + 200, einout3(sh))
        band = np.zeros((int(gd.cap_h * 1.3), int(total + 40), 4), np.float32)
        xx = np.arange(band.shape[1])[None, :] + (x0 - 20)
        yy = np.arange(band.shape[0])[:, None]
        m = np.exp(-((xx - bx + yy * 0.35) ** 2) / (2 * 30 ** 2)).astype(np.float32)
        # use the number's own alpha as mask
        sub = DST[0][int(cyc - band.shape[0] / 2):int(cyc - band.shape[0] / 2) + band.shape[0],
                     int(x0 - 20):int(x0 - 20) + band.shape[1]]
        lum = sub.mean(axis=2)
        mask = np.clip((lum - 0.75) * 5, 0, 1) * m
        sub += mask[..., None] * 0.6
    # stars
    ys = 1135 + oy
    for j in range(5):
        sx = 540 + (j - 2) * 128
        place(img, star_sprite(110, CREAM, 3), sx, ys, alpha=0.3 * prog(u, 0.1, 0.4) * a_all)
        ts = 1.15 + j * 0.15
        q = prog(u, ts, ts + 0.3)
        if q > 0:
            place(img, star_sprite(110), sx, ys, scale=eback(q, 3.2), rot=(1 - eout3(q)) * -70, alpha=a_all)
            # sparkle
            age = u - ts
            if age < 0.5:
                for m in range(7):
                    ang = m / 7 * 6.283 + j
                    r = 60 + 150 * eout3(age / 0.5)
                    place(img, dot_sprite(16), sx + r * math.cos(ang), ys + r * math.sin(ang),
                          scale=0.45 * (1 - age / 0.5), tint=GOLD, alpha=1)
    # "bei fast 300 Bewertungen"
    q = prog(u, 2.2, 2.6)
    if q > 0:
        n = int(round(300 * eout3(prog(u, 2.25, 3.1))))
        ga = G('bei fast', 'serif', 86, CREAM, 0, SH_S)
        gn = G(f'{n}', 'anton', 112, GOLD, 0, SH_S)
        gn_ref = G('300', 'anton', 112, GOLD, 0, SH_S)
        gb = G('Bewertungen', 'serif', 86, CREAM, 0, SH_S)
        sp = 24
        tw = ga.width + gn_ref.width + gb.width + 2 * sp
        xx = 540 - tw / 2
        yb = 1335 + oy + 30 * (1 - eout3(q))
        al = eout3(q) * a_all
        place_glyphs(img, ga, xx, yb - ga.baseline, alpha=al)
        place_glyphs(img, gn, xx + ga.width + sp + (gn_ref.width - gn.width) / 2, yb - gn.baseline, alpha=al)
        place_glyphs(img, gb, xx + ga.width + gn_ref.width + 2 * sp, yb - gb.baseline, alpha=al)
    gq = G('Und die Gäste sagen …', 'serif', 74, CREAM, 0, SH_S)
    fade_up(gq, 540 - gq.width / 2, cap_y(gq, 1480) + oy, 3.6, u, alpha=0.9 * a_all)
    return img


CARD_BG = [('1154', 120, 1.06, 0.5, 0.45), ('1150', 150, 1.1, 0.5, 0.5), ('1155', 255, 1.3, 0.7, 0.42)]
CARD_ROT = [-3.5, 2.8, -1.6]


def sc_cards(t):
    u = t - 19.2
    k = min(int(u / 2.4), 2)
    uk = u - 2.4 * k
    clip, f0, zm, cx, cy = CARD_BG[k]
    img = video_layer(clip, f0 + uk * 60 * 0.8, zoom=zm, cx=cx, cy=cy, blur=3.5, bright=0.5)
    canvas_from(img)
    gh = G('DAS SAGEN DIE GÄSTE', 'mono', 32, CREAM, 0.2, SH_S)
    place_glyphs(img, gh, 540 - gh.width / 2, cap_y(gh, 330), alpha=0.85 * prog(u, 0.0, 0.3))
    for j in range(k + 1):
        tin = 19.2 + 2.4 * j
        p = prog(t, tin - 0.05, tin + 0.42)
        e = eback(p, 1.4)
        x = lerp(540 + 260 * (1 if j % 2 else -1), 540, eout3(p))
        y = lerp(2500, 930, e)
        rot = lerp(CARD_ROT[j] + 22 * (1 if j % 2 else -1), CARD_ROT[j], eout3(p))
        # pushed back when next card arrives
        depth = 0
        for jj in range(j + 1, k + 1):
            depth += eout3(prog(t, 19.2 + 2.4 * jj, 19.2 + 2.4 * jj + 0.45))
        sc = 1 - 0.06 * depth
        y -= 70 * depth
        dim = 1 - 0.22 * depth
        draw_card(img, j, t, tin, x, y, rot - 2.5 * depth * (1 if j % 2 else -1), scale=sc, dim=dim,
                  stamp_t=25.3 if j == 2 else None)
    # exit
    return img


def sc_lust(t):
    u = t - 26.4
    f = 176 + u * 60 * 0.42
    img = video_layer('1155', f, zoom=1.5 + 0.06 * u / 2.4, cx=0.72, cy=0.38, bright=0.8)
    img *= (1 - 0.45 * radial(540, 950, 820, 1.3))
    canvas_from(img)
    g1 = G('LUST AUF', 'anton', 190, CREAM)
    p = eoutexpo(prog(u, 0.04, 0.4))
    x1 = 540 - g1.width / 2
    if p > 0:
        place_glyphs(img, g1, x1 - 700 * (1 - p), cap_y(g1, 650), mblur=(90 * (1 - p) ** 2, 0))
    g2 = GW('DIZZA?', 'anton', 880, TOMATO)
    sl = prog(u, 0.6, 0.82)
    if sl > 0:
        s = 1 + 0.9 * (1 - eoutexpo(sl))
        y2 = cap_y(g2, 1010)
        place_glyphs(img, g2, 540 - g2.width / 2, y2, per_glyph=lambda k, i: {
            'dx': (glyph_cx(g2, 540 - g2.width / 2, i) - 540) * (s - 1)}, scale=s, alpha=prog(u, 0.6, 0.66))
    CR_DIZZA.draw(img, u - 0.62)
    gt = G('Komm vorbei – der Ofen ist schon heiß.', 'serif', 64, CREAM, 0, SH)
    fade_up(gt, 540 - gt.width / 2, cap_y(gt, 1270), 1.15, u, alpha=1.0)
    return img


INFO = [
    ('pin', 'ADRESSE', 'Eichendorffstraße 25', '59555 Lippstadt'),
    ('clock', 'ÖFFNUNGSZEITEN', 'Täglich 17 – 22 Uhr', 'Montag bis Sonntag'),
    ('phone', 'TELEFON', '01522 3795241', None),
]


def sc_info(t):
    u = t - 28.8
    img = video_layer('1146', 0 + u * 60 * 0.8, zoom=1.15, cx=0.5, cy=0.42, blur=5, bright=0.36)
    img = img * np.array([1.0, 0.92, 0.82], np.float32)
    canvas_from(img)
    gh = G('So findest du uns.', 'serif', 112, CREAM)
    fade_up(gh, 90, cap_y(gh, 560), 0.0, u, dist=50)
    p = eoutexpo(prog(u, 0.1, 0.6))
    ln = rect_line(int(160 * p))
    if ln is not None:
        place(img, ln, 92, 650, ax=0, ay=1)
    for j, (ic, lab, v1, v2) in enumerate(INFO):
        t0 = 0.2 + j * 0.3
        q = prog(u, t0, t0 + 0.5)
        if q <= 0:
            continue
        e = eoutexpo(q)
        dx = 120 * (1 - e)
        yc = 830 + j * 250
        place(img, icon_sprite(ic, 108), 144 + dx * 0.5, yc + 18, scale=eback(prog(u, t0, t0 + 0.35), 2.4),
              alpha=e)
        gl = G(lab, 'mono', 28, GOLD, 0.2, SH_S)
        place_glyphs(img, gl, 230 + dx, cap_y(gl, yc - 40), alpha=e)
        gv = G(v1, 'anton', 84, CREAM, 0.0, SH_S)
        place_glyphs(img, gv, 228 + dx * 1.3, cap_y(gv, yc + 30), alpha=e, mblur=(40 * (1 - e) ** 2, 0))
        if v2:
            g2 = G(v2, 'mono', 32, CREAM, 0.06, SH_S)
            place_glyphs(img, g2, 230 + dx * 1.6, cap_y(g2, yc + 100), alpha=e * 0.8)
    return img


FL_END = Flour(9, 260, 540, 760, speed=(200, 1900), size=(1.5, 9))


def sc_end(t):
    u = t - 31.2
    img = video_layer('1146', 60 + u * 45, zoom=1.2, cx=0.5, cy=0.3, blur=9, bright=0.30)
    img = img * np.array([1.0, 0.86, 0.72], np.float32) + np.array([0.025, 0.017, 0.01], np.float32)
    img += radial(540, 800, 900, 0.9) * np.array([0.22, 0.11, 0.05], np.float32)
    canvas_from(img)
    puff(img, u, 540, 780, rmax=600, amax=0.22, seed=8)
    # badge
    p = prog(u, 0.0, 0.6)
    ring = badge_ring()
    place(img, ring, 540, 720, scale=lerp(0.55, 1.0, eback(p, 1.6)), rot=-u * 16 - 60 * (1 - eout3(p)),
          alpha=eout3(prog(u, 0, 0.2)))
    g47 = G('47', 'anton', 230, TOMATO)
    s47 = lerp(1.9, 1.0, eoutexpo(prog(u, 0.08, 0.4)))
    place_glyphs(img, g47, 540 - g47.width / 2, cap_y(g47, 720), per_glyph=lambda k, i: {
        'dx': (glyph_cx(g47, 540 - g47.width / 2, i) - 540) * (s47 - 1)}, scale=s47,
        alpha=prog(u, 0.08, 0.14))
    g1 = GW('DIZZERIA 47', 'anton', 860, CREAM)
    rise_in(g1, 540 - g1.width / 2, cap_y(g1, 1130), 0.25, u, stagger=0.03)
    q = eoutexpo(prog(u, 0.7, 1.1))
    if q > 0:
        place(img, tricolor(420, 10), 540, 1262, sx=q)
    gs = G('Pizza aus Dinkelmehl – mitten in Lippstadt.', 'serif', 62, CREAM, 0, SH_S)
    fade_up(gs, 540 - gs.width / 2, cap_y(gs, 1330), 0.9, u, dist=30)
    gm = G('EICHENDORFFSTR. 25 · TÄGLICH 17–22 UHR', 'mono', 30, CREAM, 0.08, SH_S)
    typewriter(gm, 540 - gm.width / 2, cap_y(gm, 1420), 1.3, u, cps=50, alpha=0.8)
    FL_END.draw(img, u - 0.02, gain=0.75)
    return img


SCENES = [(0.0, 2.4, sc_hook), (2.4, 4.8, sc_dinkel), (4.8, 7.2, sc_store)]
for spec in WORDS:
    SCENES.append((spec[0], spec[0] + spec[1], (lambda s: (lambda t: sc_word(t, s)))(spec)))
SCENES += [(14.4, 19.2, sc_rating), (19.2, 26.4, sc_cards), (26.4, 28.8, sc_lust),
           (28.8, 31.2, sc_info), (31.2, DUR + 1, sc_end)]

# transitions at scene boundaries: (time, kind)
TRANS = {2.4: 'zoom', 4.8: 'zoom', 7.2: 'whipL', 8.4: 'punch', 9.6: 'whipL', 12.0: 'punch',
         14.4: 'whipU', 19.2: 'whipU', 26.4: 'whipU', 28.8: 'whipL', 31.2: 'zoom'}
TW = 0.1


def scene_at(t):
    for a, b, fn in SCENES:
        if a <= t < b:
            return a, b, fn
    return SCENES[-1]


def render_scene(t):
    a, b, fn = scene_at(t)
    img = fn(t)
    # outgoing transition
    kind = TRANS.get(round(b, 2))
    if kind and t > b - TW:
        p = ein3(prog(t, b - TW, b))
        if kind == 'whipL':
            img = shift_frame(img, -W * 0.7 * p, 0, blur_x=260 * p)
        elif kind == 'whipU':
            img = shift_frame(img, 0, -H * 0.5 * p, blur_y=320 * p)
        elif kind == 'zoom':
            img = shift_frame(img, 0, 0, scale=1 + 0.5 * p)
            img = cv2.GaussianBlur(img, (0, 0), 1 + 22 * p) if p > 0.05 else img
    kind = TRANS.get(round(a, 2))
    if kind and t < a + TW * (1.8 if kind == 'punch' else 1):
        if kind == 'punch':
            q = eout3(prog(t, a, a + TW * 1.8))
            img = shift_frame(img, 0, 0, scale=1.14 - 0.14 * q)
        else:
            q = 1 - eout3(prog(t, a, a + TW))
            if kind == 'whipL':
                img = shift_frame(img, W * 0.7 * q, 0, blur_x=260 * q)
            elif kind == 'whipU':
                img = shift_frame(img, 0, H * 0.5 * q, blur_y=320 * q)
            elif kind == 'zoom':
                img = shift_frame(img, 0, 0, scale=1 + 0.35 * q)
                if q > 0.05:
                    img = cv2.GaussianBlur(img, (0, 0), 1 + 16 * q)
    return img


def leak(t):
    """Warm light leaks around big moments (computed at 1/4 res)."""
    out = None
    for t0, dur, strength, side in ((0.0, 1.0, 0.55, 1), (4.8, 1.4, 0.75, -1), (26.4, 1.2, 0.45, 1),
                                    (31.2, 1.6, 0.6, -1)):
        p = (t - t0) / dur
        if 0 <= p <= 1:
            a = math.sin(math.pi * p) * strength
            w4, h4 = W // 4, H // 4
            yy, xx = np.mgrid[0:h4, 0:w4].astype(np.float32)
            cx = w4 * (0.5 + side * lerp(-0.9, 0.9, p))
            cy = h4 * 0.35
            d = np.sqrt(((xx - cx) / (w4 * 0.7)) ** 2 + ((yy - cy) / (h4 * 0.55)) ** 2)
            m = np.clip(1 - d, 0, 1) ** 1.8 * a
            lk = np.dstack([m * 1.0, m * 0.45, m * 0.12])
            lk = cv2.resize(lk, (W, H), interpolation=cv2.INTER_LINEAR)
            out = lk if out is None else out + lk
    return out


def render(t, frame_idx):
    img = render_scene(t)
    # shake
    sx = sy = 0.0
    for ti, amp in IMPACTS:
        dt = t - ti
        if 0 <= dt < 0.5:
            e = amp * math.exp(-dt * 9)
            sx += e * math.sin(dt * 95 + ti)
            sy += e * math.cos(dt * 77 + ti * 2)
    if abs(sx) + abs(sy) > 0.6:
        img = shift_frame(img, sx, sy, scale=1.012)
    ca = 0
    for ti, amp in CHROMA:
        dt = t - ti
        if 0 <= dt < 0.3:
            ca += amp * math.exp(-dt * 14)
    img = chroma_shift(img, ca)
    lk = leak(t)
    if lk is not None:
        img = 1 - (1 - np.clip(img, 0, 1)) * (1 - lk)
    fl = 0
    for ti, amp, k in FLASHES:
        dt = t - ti
        if 0 <= dt < 0.6:
            fl += amp * math.exp(-dt * k)
    if fl > 0.01:
        fl = min(fl, 1)
        img = img * (1 - fl) + np.array(CREAM, np.float32) * fl
    img *= vignette()
    img = apply_grain(img, frame_idx, 0.04)
    return np.clip(img, 0, 1)
