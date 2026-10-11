"""Grafik-Engine: Sprites, Text, Compositing, Footage, Post-FX."""
import math, os, functools
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

cv2.setNumThreads(1)

W, H, FPS = 1080, 1920, 60
ROOT = os.path.dirname(os.path.abspath(__file__))
SCR = os.path.dirname(ROOT)
FONTS = os.path.join(SCR, 'fonts')
CLIPS = os.path.join(SCR, 'clips')

# Palette (0..1 RGB)
CREAM = (0.965, 0.937, 0.886)
TOMATO = (0.906, 0.243, 0.169)
GOLD = (0.945, 0.718, 0.353)
BASIL = (0.157, 0.580, 0.318)
INK = (0.075, 0.059, 0.047)
WHITE = (1.0, 1.0, 1.0)

FONT_FILES = {
    'unb': 'Unbounded-VF.ttf',
    'marker': 'PermanentMarker-Regular.ttf',
    'brush': 'CaveatBrush-Regular.ttf',
    'smono': 'SpaceMono-Bold.ttf',
    'smonor': 'SpaceMono-Regular.ttf',
    'anton': 'Anton-Regular.ttf',
    'serif': 'InstrumentSerif-Italic.ttf',
    'serifr': 'InstrumentSerif-Regular.ttf',
    'mono': 'DMMono-Medium.ttf',
    'monor': 'DMMono-Regular.ttf',
}


# ---------------------------------------------------------------- easing
def clamp01(x):
    return 0.0 if x < 0 else (1.0 if x > 1 else x)


def prog(t, a, b):
    return clamp01((t - a) / (b - a))


def eout3(x):
    x = clamp01(x); return 1 - (1 - x) ** 3


def ein3(x):
    x = clamp01(x); return x ** 3


def einout3(x):
    x = clamp01(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def eoutexpo(x):
    x = clamp01(x); return 1.0 if x >= 1 else 1 - 2 ** (-10 * x)


def eback(x, s=1.9):
    x = clamp01(x) - 1
    return x * x * ((s + 1) * x + s) + 1


def lerp(a, b, x):
    return a + (b - a) * x


# ---------------------------------------------------------------- fonts / text
@functools.lru_cache(maxsize=None)
def font(name, size):
    # 'unb900' -> Unbounded at weight 900
    base = name.rstrip('0123456789')
    wght = name[len(base):]
    f = ImageFont.truetype(os.path.join(FONTS, FONT_FILES[base]), int(size))
    if wght:
        f.set_variation_by_axes([int(wght)])
    return f


def _to_premul(rgba_u8):
    a = rgba_u8.astype(np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    return a


def colorize(alpha, color):
    """alpha (h,w) float -> premultiplied RGBA."""
    out = np.empty(alpha.shape + (4,), np.float32)
    for i in range(3):
        out[..., i] = alpha * color[i]
    out[..., 3] = alpha
    return out


def add_shadow(spr, blur=10, off=(0, 6), opacity=0.55, pad=None):
    """Bake a soft drop shadow beneath a premultiplied sprite (expands canvas)."""
    pad = pad if pad is not None else blur * 3 + max(abs(off[0]), abs(off[1]))
    h, w = spr.shape[:2]
    big = np.zeros((h + 2 * pad, w + 2 * pad, 4), np.float32)
    a = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    a[pad + off[1]:pad + off[1] + h, pad + off[0]:pad + off[0] + w] = spr[..., 3]
    a = cv2.GaussianBlur(a, (0, 0), blur) * opacity
    big[..., 3] = a
    s = big[pad:pad + h, pad:pad + w]
    s[...] = spr + s * (1 - spr[..., 3:4])
    return big, pad


class Glyphs:
    """A line of text laid out with real kerning; gives per-glyph sprites + full sprite.

    Coordinates: line origin (x=0) at left of the advance box, y=0 at the font's
    ascent top. cap_top / baseline describe vertical metrics in that frame."""

    def __init__(self, text, fname, size, color, tracking=0.0, shadow=None):
        self.text, self.fname, self.size, self.color = text, fname, int(size), color
        f = font(fname, size)
        self.f = f
        asc, desc = f.getmetrics()
        self.asc, self.desc = asc, desc
        tr = tracking * size
        self.xs = [f.getlength(text[:i]) + tr * i for i in range(len(text) + 1)]
        self.width = self.xs[-1] - (tr if text else 0)
        bb = f.getbbox('H')
        self.cap_top, self.baseline = bb[1], asc
        self.cap_h = self.baseline - self.cap_top
        self.shadow = shadow
        self.glyphs = []  # (index, sprite, ox, oy): sprite pixel (ox,oy) == glyph origin
        for i, ch in enumerate(text):
            if ch == ' ':
                continue
            spr, ox, oy = self._render(ch)
            self.glyphs.append((i, spr, ox, oy))

    def _render(self, s):
        f = self.f
        pad = int(self.size * 0.25) + 4
        wbox = int(f.getlength(s) + self.size * 0.6) + 2 * pad
        hbox = self.asc + self.desc + 2 * pad
        im = Image.new('L', (wbox, hbox), 0)
        ImageDraw.Draw(im).text((pad, pad), s, font=f, fill=255)
        a = np.asarray(im).astype(np.float32) / 255.0
        cols = np.where(a.max(0) > 0)[0]
        if len(cols) == 0:
            return np.zeros((2, 2, 4), np.float32), 0, 0
        x0, x1 = max(cols[0] - 3, 0), min(cols[-1] + 4, wbox)
        a = a[:, x0:x1]
        spr = colorize(a, self.color)
        ox, oy = pad - x0, pad
        if self.shadow:
            spr, p = add_shadow(spr, *self.shadow)
            ox, oy = ox + p, oy + p
        return spr, ox, oy

    @functools.cached_property
    def full(self):
        spr, ox, oy = self._render(self.text)
        return spr, ox, oy


def fit_size(text, fname, target_w, tracking=0.0, max_size=2000):
    f = font(fname, 200)
    w = f.getlength(text) + tracking * 200 * max(len(text) - 1, 0)
    return min(int(200 * target_w / w), max_size)


# ---------------------------------------------------------------- compositing
def _line_kernel(dx, dy):
    L = int(math.hypot(dx, dy))
    if L < 2:
        return None
    k = L | 1
    ker = np.zeros((k, k), np.float32)
    c = k // 2
    ux, uy = dx / math.hypot(dx, dy), dy / math.hypot(dx, dy)
    cv2.line(ker, (int(round(c - ux * c)), int(round(c - uy * c))),
             (int(round(c + ux * c)), int(round(c + uy * c))), 1.0, 1, cv2.LINE_AA)
    s = ker.sum()
    return ker / s if s > 0 else None


def place(dst, spr, x, y, ax=None, ay=None, scale=1.0, sx=1.0, sy=1.0, rot=0.0,
          alpha=1.0, mblur=(0, 0), clip=None, tint=None, mode='normal'):
    """Composite premultiplied sprite so that sprite point (ax,ay) lands on (x,y)."""
    if alpha <= 0.003:
        return
    h, w = spr.shape[:2]
    ax = w / 2 if ax is None else ax
    ay = h / 2 if ay is None else ay
    sx, sy = sx * scale, sy * scale
    if abs(sx) < 1e-3 or abs(sy) < 1e-3:
        return
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    A = np.array([[c * sx, -s * sy], [s * sx, c * sy]])
    tvec = np.array([x, y], float) - A @ np.array([ax, ay], float)
    corners = np.array([[0, w, 0, w], [0, 0, h, h]], float)
    pc = A @ corners + tvec[:, None]
    bl = int(abs(mblur[0]) + abs(mblur[1])) + 2
    cx0, cy0, cx1, cy1 = clip if clip else (0, 0, dst.shape[1], dst.shape[0])
    cx0, cy0 = max(int(cx0), 0), max(int(cy0), 0)
    cx1, cy1 = min(int(cx1), dst.shape[1]), min(int(cy1), dst.shape[0])
    x0 = max(int(math.floor(pc[0].min())) - bl, cx0)
    y0 = max(int(math.floor(pc[1].min())) - bl, cy0)
    x1 = min(int(math.ceil(pc[0].max())) + bl, cx1)
    y1 = min(int(math.ceil(pc[1].max())) + bl, cy1)
    if x1 <= x0 or y1 <= y0:
        return
    M = np.hstack([A, (tvec - [x0, y0])[:, None]])
    out = cv2.warpAffine(spr, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    ker = _line_kernel(*mblur)
    if ker is not None:
        out = cv2.filter2D(out, -1, ker, borderType=cv2.BORDER_CONSTANT)
    if tint is not None:
        out[..., :3] *= np.array(tint, np.float32)
    reg = dst[y0:y1, x0:x1]
    if dst.shape[2] == 4:
        reg[...] = out * alpha + reg * (1 - out[..., 3:4] * alpha)
        return
    if mode == 'add':
        reg += out[..., :3] * alpha
    elif mode == 'screen':
        src = np.clip(out[..., :3] * alpha, 0, 1)
        reg[...] = 1 - (1 - reg) * (1 - src)
    else:
        a = out[..., 3:4] * alpha
        reg[...] = out[..., :3] * alpha + reg * (1 - a)


def place_glyphs(dst, G, x, y, per_glyph=None, **kw):
    """Draw a Glyphs line with line origin at (x,y) (y = ascent top).

    per_glyph(k, i) -> dict of overrides (dx, dy, scale, rot, alpha, mblur, clip)
    applied to glyph number k (string index i). Rotation/scale about glyph center."""
    for k, (i, spr, ox, oy) in enumerate(G.glyphs):
        o = dict(kw)
        if per_glyph:
            o.update(per_glyph(k, i) or {})
        if o.get('alpha', 1) <= 0.003:
            continue
        dx, dy = o.pop('dx', 0), o.pop('dy', 0)
        hgt, wid = spr.shape[:2]
        cxs, cys = wid / 2, oy + G.cap_top + G.cap_h / 2
        gx = x + G.xs[i] + (cxs - ox) + dx
        gy = y + cys - oy + dy
        place(dst, spr, gx, gy, ax=cxs, ay=cys, **o)


# ---------------------------------------------------------------- shapes (supersampled)
def ss_canvas(w, h, ss=4):
    im = Image.new('L', (w * ss, h * ss), 0)
    return im, ImageDraw.Draw(im), ss


def ss_alpha(im, w, h):
    return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255.0


def star_points(cx, cy, r_out, r_in, n=5, rot=-90):
    pts = []
    for k in range(2 * n):
        r = r_out if k % 2 == 0 else r_in
        a = math.radians(rot + k * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


@functools.lru_cache(maxsize=None)
def star_sprite(size, color=GOLD, outline=0):
    im, d, ss = ss_canvas(size, size)
    pts = star_points(size * ss / 2, size * ss / 2 + size * ss * 0.03, size * ss * 0.48, size * ss * 0.2)
    if outline:
        d.polygon(pts, outline=255, width=int(outline * ss))
    else:
        d.polygon(pts, fill=255)
    return colorize(ss_alpha(im, size, size), color)


@functools.lru_cache(maxsize=None)
def dot_sprite(r=16):
    s = 2 * r + 1
    yy, xx = np.mgrid[0:s, 0:s] - r
    a = np.exp(-(xx ** 2 + yy ** 2) / (2 * (r / 2.2) ** 2)).astype(np.float32)
    return colorize(a, (1, 1, 1))


@functools.lru_cache(maxsize=None)
def blob_sprite(r=128):
    s = 2 * r + 1
    yy, xx = np.mgrid[0:s, 0:s] - r
    d = np.sqrt(xx ** 2 + yy ** 2) / r
    a = np.clip(1 - d, 0, 1) ** 2.2
    rng = np.random.default_rng(3)
    n = cv2.GaussianBlur(rng.random((s, s)).astype(np.float32), (0, 0), r / 6)
    n = (n - n.min()) / (n.max() - n.min())
    return colorize((a * (0.55 + 0.45 * n)).astype(np.float32), (1, 1, 1))


def rect_sprite(w, h, color, radius=0):
    im, d, ss = ss_canvas(w, h)
    d.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=radius * ss, fill=255)
    return colorize(ss_alpha(im, w, h), color)


# ---------------------------------------------------------------- footage
def _grade_luts():
    x = np.arange(256) / 255.0
    # filmic S-curve with lifted blacks
    s = x + 0.22 * (x - 0.5) * (1 - np.abs(2 * x - 1)) * 2 * 0.5
    s = np.clip(s, 0, 1)
    s = 0.025 + s * 0.965
    r = np.clip(s ** 0.96 * 1.035, 0, 1)
    g = np.clip(s ** 0.995, 0, 1)
    b = np.clip(s ** 1.05 * 0.93 + 0.012, 0, 1)
    return [np.round(v * 255).astype(np.uint8) for v in (r, g, b)]


_LUTS = _grade_luts()
CLIP_LEN = {}


def clip_len(name):
    if name not in CLIP_LEN:
        CLIP_LEN[name] = len(os.listdir(os.path.join(CLIPS, name)))
    return CLIP_LEN[name]


@functools.lru_cache(maxsize=48)
def _clip_raw(name, i):
    im = cv2.imread(os.path.join(CLIPS, name, f'{i:04d}.jpg'), cv2.IMREAD_COLOR)
    im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    ch = [cv2.LUT(im[..., k], _LUTS[k]) for k in range(3)]
    im = np.dstack(ch)
    # saturation boost
    f = im.astype(np.float32)
    l = f @ np.array([0.299, 0.587, 0.114], np.float32)
    f = l[..., None] + (f - l[..., None]) * 1.12
    return np.clip(f, 0, 255).astype(np.uint8)


def clip_frame(name, f):
    n = clip_len(name)
    f = min(max(f, 1.0), float(n))
    i0 = int(math.floor(f)); fr = f - i0
    i1 = min(i0 + 1, n)
    a = _clip_raw(name, i0)
    if fr < 0.08 or i1 == i0:
        return a
    if fr > 0.92:
        return _clip_raw(name, i1)
    return cv2.addWeighted(a, 1 - fr, _clip_raw(name, i1), fr, 0)


def video_layer(name, f, zoom=1.0, cx=0.5, cy=0.5, rot=0.0, blur=0.0, bright=1.0,
                dx=0.0, dy=0.0, sharpen=0.0):
    img = clip_frame(name, f)
    hw, hh = W / (2 * zoom), H / (2 * zoom)
    px = min(max(cx * W, hw), W - hw)
    py = min(max(cy * H, hh), H - hh)
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    A = np.array([[c * zoom, -s * zoom], [s * zoom, c * zoom]])
    t = np.array([W / 2 + dx, H / 2 + dy]) - A @ np.array([px, py])
    M = np.hstack([A, t[:, None]])
    if blur > 6:
        k = 4
        Ms = M / k
        small = cv2.warpAffine(img, Ms, (W // k, H // k), flags=cv2.INTER_LINEAR,
                               borderMode=cv2.BORDER_REFLECT)
        small = cv2.GaussianBlur(small, (0, 0), blur / k)
        out = cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
    else:
        out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        if blur > 0.3:
            out = cv2.GaussianBlur(out, (0, 0), blur)
        elif zoom > 1.15 or sharpen > 0:
            amt = sharpen if sharpen > 0 else min(0.25 * (zoom - 1), 0.35)
            bl = cv2.GaussianBlur(out, (0, 0), 1.4)
            out = cv2.addWeighted(out, 1 + amt, bl, -amt, 0)
    return out.astype(np.float32) * (bright / 255.0)


# ---------------------------------------------------------------- post FX
def _make_vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx, ny = (xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2)
    d = np.sqrt(nx ** 2 * 1.0 + ny ** 2 * 0.75)
    v = 1 - 0.42 * np.clip((d - 0.55) / 0.85, 0, 1) ** 1.6
    return v[..., None].astype(np.float32)


@functools.lru_cache(maxsize=1)
def vignette():
    return _make_vignette()


@functools.lru_cache(maxsize=1)
def grain_bank():
    rng = np.random.default_rng(47)
    bank = []
    for _ in range(10):
        g = rng.standard_normal((H // 2, W // 2)).astype(np.float32)
        g = cv2.resize(g, (W, H), interpolation=cv2.INTER_LINEAR)
        g = cv2.GaussianBlur(g, (0, 0), 0.6)
        bank.append(g)
    return bank


def apply_grain(img, frame_idx, amount=0.045):
    g = grain_bank()[(frame_idx * 7) % 10]
    l = img.mean(axis=2)
    w = (0.35 + 1.6 * l * (1 - l))[..., None]
    img += g[..., None] * amount * w
    return img


def gradient_v(y0, y1, a0, a1):
    """Vertical alpha ramp (H,1,1) from a0 at y0 to a1 at y1."""
    y = np.arange(H, dtype=np.float32)
    x = np.clip((y - y0) / (y1 - y0), 0, 1)
    x = x * x * (3 - 2 * x)
    return (a0 + (a1 - a0) * x)[:, None, None]


@functools.lru_cache(maxsize=None)
def radial(cx, cy, r, sq=1.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt((xx - cx) ** 2 + ((yy - cy) * sq) ** 2) / r
    return np.clip(1 - d, 0, 1)[..., None] ** 2


def chroma_shift(img, px):
    if px < 0.6:
        return img
    p = int(round(px))
    out = img.copy()
    out[:, p:, 0] = img[:, :-p, 0]
    out[:, :-p, 2] = img[:, p:, 2]
    return out


def shift_frame(img, dx, dy, blur_x=0, blur_y=0, scale=1.0):
    if abs(dx) < 0.5 and abs(dy) < 0.5 and scale == 1.0 and blur_x < 2 and blur_y < 2:
        return img
    M = np.array([[scale, 0, W / 2 * (1 - scale) + dx], [0, scale, H / 2 * (1 - scale) + dy]], np.float32)
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    if blur_x >= 2 or blur_y >= 2:
        out = cv2.blur(out, (max(int(blur_x), 1), max(int(blur_y), 1)))
    return out
