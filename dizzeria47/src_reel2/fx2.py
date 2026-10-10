"""Reel #2 building blocks: footage access (iPhone + upscaled WA), pizza slicing, cutter, HUD, scribbles."""
import math, os, functools
import numpy as np
import cv2
from PIL import Image, ImageDraw
from lib import *

ASSETS = os.path.join(SCR, 'assets2')
OVEN = (1.0, 0.42, 0.14)      # oven orange
CHAR = (0.075, 0.066, 0.06)   # charcoal
CREAM2 = (1.0, 0.957, 0.886)
MOZZ = (0.98, 0.93, 0.80)


# ------------------------------------------------------------------ footage
def _lut(gain=1.0, gamma=1.0, warm=(1.0, 1.0, 1.0), lift=0.0, contrast=0.2):
    x = np.arange(256) / 255.0
    y = np.clip(x * gain, 0, 1) ** gamma
    y = y + contrast * (y - 0.5) * (1 - np.abs(2 * y - 1))
    y = lift + y * (1 - lift)
    return [np.round(np.clip(y * w, 0, 1) * 255).astype(np.uint8) for w in warm]


LUT_IPHONE = _lut(1.0, 0.98, (1.03, 1.0, 0.95), 0.02, 0.22)
LUT_WA = _lut(1.32, 0.9, (1.04, 1.0, 0.93), 0.015, 0.18)


def _grade(im, lut, sat):
    im = np.dstack([cv2.LUT(im[..., k], lut[k]) for k in range(3)])
    f = im.astype(np.float32)
    l = f @ np.array([0.299, 0.587, 0.114], np.float32)
    f = l[..., None] + (f - l[..., None]) * sat
    return np.clip(f, 0, 255).astype(np.uint8)


@functools.lru_cache(maxsize=40)
def _raw(name, i):
    if name == 'wa':
        p = os.path.join(CLIPS, 'wa_x4', f'{i:04d}.jpg')
        if not os.path.exists(p):
            av = np.array(wa_available())
            i = int(av[np.argmin(np.abs(av - i))])
            p = os.path.join(CLIPS, 'wa_x4', f'{i:04d}.jpg')
        im = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
        return _grade(im, LUT_WA, 1.12)
    p = os.path.join(CLIPS, name, f'{i:04d}.jpg')
    im = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
    return _grade(im, LUT_IPHONE, 1.1)


@functools.lru_cache(maxsize=None)
def wa_available():
    return sorted(int(f[:4]) for f in os.listdir(os.path.join(CLIPS, 'wa_x4')))


def frame(name, f, lo=None, hi=None):
    """Float frame index -> uint8 RGB (blends neighbours). WA indices are source frame numbers."""
    if name == 'wa':
        av = wa_available()
        lo = lo if lo is not None else av[0]
        hi = hi if hi is not None else av[-1]
    else:
        lo, hi = (lo or 1), (hi or clip_len(name))
    f = min(max(f, lo), hi)
    i0 = int(math.floor(f)); fr = f - i0
    i1 = min(i0 + 1, hi)
    a = _raw(name, i0)
    if fr < 0.1 or i1 == i0:
        return a
    if fr > 0.9:
        return _raw(name, i1)
    return cv2.addWeighted(a, 1 - fr, _raw(name, i1), fr, 0)


def cover(img, out_w=W, out_h=H, zoom=1.0, cx=0.5, cy=0.5, rot=0.0, dx=0.0, dy=0.0, blur=0.0,
          bright=1.0, sharpen=0.25, border=cv2.BORDER_REFLECT):
    """Cover-fit an image into out_w x out_h with extra zoom about normalized (cx,cy)."""
    h, w = img.shape[:2]
    base = max(out_w / w, out_h / h)
    z = base * zoom
    hw, hh = out_w / (2 * z), out_h / (2 * z)
    px = min(max(cx * w, hw), w - hw) if rot == 0 else cx * w
    py = min(max(cy * h, hh), h - hh) if rot == 0 else cy * h
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    A = np.array([[c * z, -s * z], [s * z, c * z]])
    t = np.array([out_w / 2 + dx, out_h / 2 + dy]) - A @ np.array([px, py])
    M = np.hstack([A, t[:, None]])
    if blur > 6:
        k = 4
        sm = cv2.warpAffine(img, M / k, (out_w // k, out_h // k), flags=cv2.INTER_AREA if z < 1 else cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REFLECT)
        sm = cv2.GaussianBlur(sm, (0, 0), blur / k)
        out = cv2.resize(sm, (out_w, out_h), interpolation=cv2.INTER_CUBIC)
    else:
        interp = cv2.INTER_AREA if z < 0.7 else cv2.INTER_CUBIC
        out = cv2.warpAffine(img, M, (out_w, out_h), flags=interp, borderMode=border)
        if blur > 0.3:
            out = cv2.GaussianBlur(out, (0, 0), blur)
        elif sharpen > 0:
            bl = cv2.GaussianBlur(out, (0, 0), 1.2)
            out = cv2.addWeighted(out, 1 + sharpen, bl, -sharpen, 0)
    return out.astype(np.float32) * (bright / 255.0)


def vid(name, f, **kw):
    lo = kw.pop('lo', None); hi = kw.pop('hi', None)
    out_w = kw.pop('out_w', W); out_h = kw.pop('out_h', H)
    return cover(frame(name, f, lo, hi), out_w, out_h, **kw)


# ------------------------------------------------------------------ geometry
def wedge_pts(cx, cy, r, a0, a1, n=48):
    """Pizza slice polygon (degrees, 0 = right, clockwise in screen coords)."""
    pts = [(cx, cy)]
    for k in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * k / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts, np.float32)


def poly_mask(pts, w=W, h=H, ss=4, feather=0.0):
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [np.round(pts * ss).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
    m = m.astype(np.float32) / 255.0
    if feather > 0:
        m = cv2.GaussianBlur(m, (0, 0), feather)
    return m


def transform_pts(pts, cx, cy, ang, dx, dy, s=1.0):
    c, si = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    p = pts - [cx, cy]
    p = np.stack([p[:, 0] * c - p[:, 1] * si, p[:, 0] * si + p[:, 1] * c], 1) * s
    return p + [cx + dx, cy + dy]


def piece_warp(img, cx, cy, ang, dx, dy, s=1.0):
    """Affine warp of a full frame: rotate by ang about (cx,cy), scale s, translate."""
    c, si = math.cos(math.radians(ang)) * s, math.sin(math.radians(ang)) * s
    A = np.array([[c, -si], [si, c]])
    t = np.array([cx + dx, cy + dy]) - A @ np.array([cx, cy])
    return np.hstack([A, t[:, None]]).astype(np.float32)


def explode_slices(dst, img, cx, cy, n, p, seed=1, start_ang=-90 - 22.5, gap=0.0, spin=1.0, dist=1.0,
                   shadow=True, crust=None):
    """Draw `img` cut into n radial wedges around (cx,cy); p in [0,1] explosion progress (0 = intact)."""
    r = np.random.default_rng(seed)
    R = math.hypot(max(cx, W - cx), max(cy, H - cy)) * 1.05
    e = eout3(p)
    for k in range(n):
        a0 = start_ang + k * 360 / n
        a1 = a0 + 360 / n
        mid = math.radians((a0 + a1) / 2)
        sp = r.uniform(0.8, 1.25)
        d = (gap * (1 - p) + (240 * eout3(min(p * 3, 1)) + 1500 * p * p) * sp) * dist
        dx, dy = math.cos(mid) * d, math.sin(mid) * d + 700 * p * p * r.uniform(0.3, 1.0)
        ang = r.uniform(-1, 1) * 55 * p * spin
        sc = 1 + 0.15 * e
        pts = transform_pts(wedge_pts(cx, cy, R, a0, a1), cx, cy, ang, dx, dy, sc)
        x0, y0 = np.floor(pts.min(0)).astype(int) - 2
        x1, y1 = np.ceil(pts.max(0)).astype(int) + 2
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
        if x1 <= x0 or y1 <= y0:
            continue
        M = piece_warp(img, cx, cy, ang, dx, dy, sc)
        M[:, 2] -= [x0, y0]
        warped = cv2.warpAffine(img, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        m = np.zeros((y1 - y0, x1 - x0), np.uint8)
        cv2.fillPoly(m, [np.round((pts - [x0, y0]) * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
        m = m.astype(np.float32)[..., None] / 255.0
        reg = dst[y0:y1, x0:x1]
        if shadow and p > 0:
            sh = cv2.GaussianBlur(m[..., 0], (0, 0), 18) * 0.55 * min(p * 6, 1)
            sh = cv2.warpAffine(sh, np.float32([[1, 0, 6], [0, 1, 14]]), (sh.shape[1], sh.shape[0]))[..., None]
            reg *= (1 - sh)
        reg[...] = warped * m + reg * (1 - m)
        if crust is not None and p > 0:
            pass


def draw_cut_line(dst, x0, y0, x1, y1, prog_, width=5, glow=True, color=(1.0, 0.97, 0.9)):
    """Glowing cut line drawn from (x0,y0) toward (x1,y1) up to prog_."""
    if prog_ <= 0:
        return None
    xe, ye = x0 + (x1 - x0) * prog_, y0 + (y1 - y0) * prog_
    layer = np.zeros((H, W), np.float32)
    cv2.line(layer, (int(x0 * 4), int(y0 * 4)), (int(xe * 4), int(ye * 4)), 1.0, width * 4, cv2.LINE_AA, shift=2)
    core = layer
    dst[...] = dst * (1 - core[..., None] * 0.85) + np.array(color, np.float32) * 0.0 * core[..., None]
    if glow:
        g = cv2.GaussianBlur(layer, (0, 0), 9) * 1.4
        dst += g[..., None] * np.array([1.0, 0.55, 0.2], np.float32) * 0.7
        thin = np.zeros((H, W), np.float32)
        cv2.line(thin, (int(x0 * 4), int(y0 * 4)), (int(xe * 4), int(ye * 4)), 1.0, 4, cv2.LINE_AA, shift=2)
        dst += thin[..., None] * np.array(color, np.float32) * 0.9
    return xe, ye


@functools.lru_cache(maxsize=None)
def cutter_sprite(size=300):
    """Pizza cutter: steel wheel + dark handle, wheel center at (size*0.3, size*0.5) of a (2.2*size x size) canvas."""
    w, h = int(size * 2.3), size
    S = 3
    im = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wc = (int(size * 0.5 * S), int(h * 0.5 * S))
    R = int(size * 0.44 * S)
    # handle
    d.rounded_rectangle([wc[0] + R * 0.2, wc[1] - size * 0.09 * S, w * S - 6 * S, wc[1] + size * 0.09 * S],
                        radius=int(size * 0.09 * S), fill=(28, 26, 26, 255))
    d.rounded_rectangle([wc[0] + R * 0.2, wc[1] - size * 0.06 * S, wc[0] + R * 1.25, wc[1] + size * 0.06 * S],
                        radius=int(size * 0.05 * S), fill=(150, 150, 155, 255))
    # wheel with radial gradient
    for k in range(40, 0, -1):
        rr = R * k / 40
        v = int(150 + 95 * (1 - abs(k / 40 - 0.62) * 1.8))
        v = max(110, min(250, v))
        d.ellipse([wc[0] - rr, wc[1] - rr, wc[0] + rr, wc[1] + rr], fill=(v, v, v + 4, 255))
    d.ellipse([wc[0] - R, wc[1] - R, wc[0] + R, wc[1] + R], outline=(90, 90, 96, 255), width=3 * S)
    hr = R * 0.18
    d.ellipse([wc[0] - hr, wc[1] - hr, wc[0] + hr, wc[1] + hr], fill=(60, 60, 64, 255))
    im = im.resize((w, h), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]
    return a, (size * 0.5, h * 0.5), R / S


@functools.lru_cache(maxsize=None)
def pizza_rgba():
    a = np.load(os.path.join(ASSETS, 'pizza_rgba.npy')).astype(np.float32)
    a[..., :3] *= a[..., 3:4]
    return a


@functools.lru_cache(maxsize=64)
def pizza_slices_sprite(size, n_keep, n=8, gap=3.0, start_ang=-90 - 22.5):
    """Pizza cut-out at `size` px keeping the first n_keep of n slices (with thin cut gaps)."""
    src = cv2.resize(pizza_rgba(), (size, size), interpolation=cv2.INTER_AREA)
    c = size / 2
    out = np.zeros_like(src)
    for k in range(n_keep):
        a0 = start_ang + k * 360 / n; a1 = a0 + 360 / n
        mid = math.radians((a0 + a1) / 2)
        pts = wedge_pts(c, c, c * 1.05, a0, a1)
        m = poly_mask(pts, size, size)
        # erode along cut edges: shift wedge outward slightly to create gap
        dx, dy = math.cos(mid) * gap, math.sin(mid) * gap
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        piece = cv2.warpAffine(src * m[..., None], M, (size, size))
        out = piece + out * (1 - piece[..., 3:4])
    return out


# ------------------------------------------------------------------ hand-drawn scribbles
def _jitter(pts, amp, seed):
    r = np.random.default_rng(seed)
    n = len(pts)
    noise_ = np.cumsum(r.normal(0, 1, (n, 2)), 0)
    noise_ -= np.linspace(0, 1, n)[:, None] * noise_[-1]
    noise_ = cv2.GaussianBlur(noise_.astype(np.float32).reshape(-1, 1, 2), (1, 0), 3).reshape(-1, 2) \
        if n > 8 else noise_
    return pts + noise_ / (np.abs(noise_).max() + 1e-6) * amp


def circle_path(cx, cy, rx, ry, turns=1.12, seed=0, tilt=-8):
    n = 160
    a = np.linspace(0, 2 * math.pi * turns, n) + math.radians(tilt)
    r = np.random.default_rng(seed)
    wob = 1 + 0.05 * np.sin(a * 2 + r.uniform(0, 6)) + np.linspace(0, 0.08, n)
    pts = np.stack([cx + rx * wob * np.cos(a), cy + ry * wob * np.sin(a)], 1)
    return _jitter(pts, 4, seed)


def arrow_path(x0, y0, x1, y1, bend=0.25, seed=0):
    n = 60
    t = np.linspace(0, 1, n)
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    nx, ny = -(y1 - y0), (x1 - x0)
    cxp, cyp = mx + nx * bend, my + ny * bend
    pts = np.stack([(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cxp + t ** 2 * x1,
                    (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cyp + t ** 2 * y1], 1)
    return _jitter(pts, 3, seed)


def arrow_head(x1, y1, xp, yp, size=40):
    ang = math.atan2(y1 - yp, x1 - xp)
    out = []
    for da in (2.55, -2.55):
        out.append(np.array([[x1 + size * math.cos(ang + da), y1 + size * math.sin(ang + da)], [x1, y1]]))
    return out


def underline_path(x0, x1, y, seed=0):
    n = 50
    t = np.linspace(0, 1, n)
    pts = np.stack([x0 + (x1 - x0) * t, y + 6 * np.sin(t * 3.1 + seed) - 8 * t], 1)
    return _jitter(pts, 2.5, seed)


def draw_stroke(dst, pts, p, width=10, color=OVEN, alpha=1.0):
    """Draw a polyline up to fraction p of its length (marker style, round caps)."""
    if p <= 0 or len(pts) < 2:
        return
    seg = np.hypot(*np.diff(pts, axis=0).T)
    L = np.concatenate([[0], np.cumsum(seg)])
    target = L[-1] * min(p, 1)
    k = np.searchsorted(L, target)
    sub = pts[:max(k, 1)]
    if k < len(pts) and k > 0:
        f = (target - L[k - 1]) / max(seg[k - 1], 1e-6)
        sub = np.vstack([pts[:k], pts[k - 1] + (pts[k] - pts[k - 1]) * f])
    x0, y0 = np.floor(sub.min(0)).astype(int) - width * 2
    x1, y1 = np.ceil(sub.max(0)).astype(int) + width * 2
    x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, dst.shape[1]), min(y1, dst.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    m = np.zeros((y1 - y0, x1 - x0), np.float32)
    q = np.round((sub - [x0, y0]) * 4).astype(np.int32)
    cv2.polylines(m, [q], False, 1.0, int(width * 4), cv2.LINE_AA, shift=2)
    cv2.circle(m, tuple(q[0]), int(width * 2), 1.0, -1, cv2.LINE_AA, shift=2)
    cv2.circle(m, tuple(q[-1]), int(width * 2), 1.0, -1, cv2.LINE_AA, shift=2)
    m = np.clip(m, 0, 1)[..., None] * alpha
    reg = dst[y0:y1, x0:x1]
    reg[...] = reg * (1 - m) + np.array(color, np.float32) * m


def stroke_len(pts):
    return float(np.hypot(*np.diff(pts, axis=0).T).sum())


# ------------------------------------------------------------------ slice window (footage inside a pizza slice)
@functools.lru_cache(maxsize=16)
def _crust_noise(n, seed):
    r = np.random.default_rng(seed)
    return r.uniform(0, 1, n), r.uniform(0, 1, n), r.uniform(0, 1, n)


def slice_window(dst, content, ax, ay, R, half_ang=30, rot=0.0, crust=46, seed=0, shadow=0.6, scale=1.0,
                 alpha=1.0, full=None):
    """Upright pizza slice: apex at (ax,ay) pointing down, arc on top. `content` is an image already
    rendered at the wedge bounding-box size (bw x bh) via slice_box(); rot in degrees about the apex."""
    R = R * scale
    a0, a1 = -90 - half_ang, -90 + half_ang
    pts = wedge_pts(0, 0, R, a0, a1, 64)
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    rp = np.stack([pts[:, 0] * c - pts[:, 1] * s, pts[:, 0] * s + pts[:, 1] * c], 1) + [ax, ay]
    pad = crust + 40
    x0, y0 = np.floor(rp.min(0)).astype(int) - pad
    x1, y1 = np.ceil(rp.max(0)).astype(int) + pad
    X0, Y0, X1, Y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
    if X1 <= X0 or Y1 <= Y0 or alpha <= 0:
        return
    bw, bh = X1 - X0, Y1 - Y0
    if full is not None:
        warped = full[Y0:Y1, X0:X1]
        content = None
    # content mapping: content is (ch,cw) covering the unrotated wedge box; map with same rotation
    chh, cww = content.shape[:2] if content is not None else (1, 1)
    wx0, wy0 = pts[:, 0].min(), pts[:, 1].min()
    sx = (pts[:, 0].max() - wx0) / cww
    sy = (pts[:, 1].max() - wy0) / chh
    A = np.array([[c * sx, -s * sy], [s * sx, c * sy]])
    t = np.array([ax, ay]) + np.array([[c, -s], [s, c]]) @ np.array([wx0, wy0]) - [X0, Y0]
    M = np.hstack([A, t[:, None]]).astype(np.float32)
    if content is not None:
        warped = cv2.warpAffine(content, M, (bw, bh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    loc = rp - [X0, Y0]
    m = np.zeros((bh, bw), np.uint8)
    cv2.fillPoly(m, [np.round(loc * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
    m = m.astype(np.float32) / 255.0
    reg = dst[Y0:Y1, X0:X1]
    # drop shadow
    if shadow > 0:
        sh = cv2.GaussianBlur(m, (0, 0), 22) * shadow * alpha
        sh = cv2.warpAffine(sh, np.float32([[1, 0, 0], [0, 1, 22]]), (sh.shape[1], sh.shape[0]))
        reg *= (1 - sh[..., None])
    # crust along the arc
    arc = loc[1:]
    cr = np.zeros((bh, bw), np.float32)
    q = np.round(arc * 4).astype(np.int32)
    cv2.polylines(cr, [q], False, 1.0, int(crust * 4), cv2.LINE_AA, shift=2)
    for e in (q[0], q[-1]):
        cv2.circle(cr, tuple(e), int(crust * 2), 1.0, -1, cv2.LINE_AA, shift=2)
    inner = np.zeros_like(cr)
    cv2.polylines(inner, [q], False, 1.0, int(crust * 4 * 0.45), cv2.LINE_AA, shift=2)
    # crust colour: radial gradient across the band (pale inner -> golden -> toasted outer) + fine grain
    dist_in = cv2.distanceTransform((cr < 0.5).astype(np.uint8), cv2.DIST_L2, 3)
    core = cv2.GaussianBlur(inner, (0, 0), crust * 0.22)
    col = np.empty((bh, bw, 3), np.float32)
    col[...] = (0.76, 0.46, 0.18)
    col += core[..., None] * np.array([0.25, 0.25, 0.20], np.float32)
    rr_ = np.random.default_rng(seed)
    gr = cv2.GaussianBlur(rr_.standard_normal((bh, bw)).astype(np.float32), (0, 0), 2.2)
    col *= (1 + 0.10 * gr[..., None])
    # cream sticker outline around the whole slice
    outl = np.zeros((bh, bw), np.uint8)
    cv2.polylines(outl, [np.round(loc * 4).astype(np.int32)], True, 255, int(9 * 4), cv2.LINE_AA, shift=2)
    outl = outl.astype(np.float32) / 255.0
    lip = np.zeros_like(cr)
    cv2.polylines(lip, [q], False, 1.0, int(crust * 4 * 1.22), cv2.LINE_AA, shift=2)
    lip = np.clip(lip - cr, 0, 1) * m
    a = alpha
    body = m * (1 - cr)
    reg[...] = reg * (1 - body[..., None] * a) + warped * body[..., None] * a
    reg[...] = reg * (1 - lip[..., None] * a) + np.array([0.86, 0.35, 0.12], np.float32) * lip[..., None] * a
    reg[...] = reg * (1 - outl[..., None] * a) + np.array(CREAM2, np.float32) * outl[..., None] * a
    reg[...] = reg * (1 - cr[..., None] * a) + col * cr[..., None] * a


def slice_box(R, half_ang=30, scale=1.0):
    """Content size (w,h) needed for a slice window."""
    R = R * scale
    w = 2 * R * math.sin(math.radians(half_ang))
    h = R
    return int(round(w)), int(round(h))
