"""DIZZERIA 47 — Reel #3 "DIZZA-SCAN". 120 BPM grid (beat 0.5 s), 30 s.
Client footage only. Shots rest at 1:1 pixels; zooms are animated and settle at 1.0 (4K clip zooms from 4K source).
Callouts are motion-tracked (phase correlation) to the footage."""
import os, math, functools
import numpy as np
import cv2
from lib import *
import scenes5 as B
from scenes5 import (src, clip, shift_int, zoom_about, rgb_split, darken_band, G, GW, cap_y, slam, rise, typer, fade,
                     bar_sprite, pin_sprite, TOMATO, GOLD, CREAM, SH, SH_S)

DUR = 30.0
GREY = (0.62, 0.60, 0.58)
DARK = (0.04, 0.035, 0.03)


# ------------------------------------------------------------------ 4K view (sharp zoom)
@functools.lru_cache(maxsize=24)
def src4k(i):
    i = min(max(int(i), 1), 90)
    im = cv2.cvtColor(cv2.imread(os.path.join(CLIPS, '1197k', f'{i:04d}.jpg')), cv2.COLOR_BGR2RGB)
    im = np.dstack([cv2.LUT(im[..., k], B.LUT[k]) for k in range(3)])
    return im


def view4k(t_local, f0, z, cx, cy):
    """Crop a (2160/z x 3840/z) window from the 4K frame and downscale to 1080x1920 -> sharp for z <= 2."""
    im = src4k(f0 + int(round(t_local * 30)))
    cw, ch = 2160 / z, 3840 / z
    x0 = min(max(cx * 2160 - cw / 2, 0), 2160 - cw)
    y0 = min(max(cy * 3840 - ch / 2, 0), 3840 - ch)
    sx, sy = W / cw, H / ch
    M = np.float32([[sx, 0, -x0 * sx], [0, sy, -y0 * sy]])
    out = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_AREA if z < 1.9 else cv2.INTER_CUBIC,
                         borderMode=cv2.BORDER_REFLECT)
    f = out.astype(np.float32)
    l = f @ np.array([0.299, 0.587, 0.114], np.float32)
    f = l[..., None] + (f - l[..., None]) * 1.07
    return np.clip(f, 0, 255) / 255.0, (x0, y0, sx, sy)


def view(name, t_local, f0, z=1.0, cx=0.5, cy=0.5, speed=1.0, blur=0.0):
    img = clip(name, t_local, f0, speed)
    if z > 1.0005:
        img = zoom_about(img, z, cx * W, cy * H, blur=blur)
        bl = cv2.GaussianBlur(img, (0, 0), 1.0)
        img = np.clip(img + (img - bl) * min(0.6, (z - 1) * 1.5), 0, 1)
    return img


# ------------------------------------------------------------------ motion tracking
@functools.lru_cache(maxsize=None)
def track(name, f0, f1):
    """Cumulative (dx, dy) in output pixels of the scene content per source frame, relative to f0."""
    prev = None
    acc = [np.zeros(2)]
    for i in range(f0, f1 + 1):
        g = cv2.cvtColor(src(name, i), cv2.COLOR_RGB2GRAY)
        g = cv2.resize(g, (270, 480), interpolation=cv2.INTER_AREA).astype(np.float32)
        g *= cv2.createHanningWindow((270, 480), cv2.CV_32F)
        if prev is not None:
            (dx, dy), _ = cv2.phaseCorrelate(prev, g)
            acc.append(acc[-1] + np.array([dx, dy]) * 4.0)
        prev = g
    return np.array(acc)


def tracked(name, f0, f1, t_local, speed=1.0):
    tr = track(name, f0, f1)
    k = min(max(int(round(t_local * 59.94 * speed)), 0), len(tr) - 1)
    return tr[k]


# ------------------------------------------------------------------ HUD + callouts
@functools.lru_cache(maxsize=None)
def corner(size=70, th=5):
    a = np.zeros((size, size), np.float32)
    a[:th, :] = 1
    a[:, :th] = 1
    return colorize(a, CREAM)


def hud(img, t, t0, t1, label='DIZZA-SCAN · LIPPSTADT', pct=None):
    a = min(1, (t - t0) * 6) * (1 - prog(t, t1 - 0.12, t1))
    if a <= 0:
        return img
    m = 46
    c = corner()
    for rot, (x, y) in ((0, (m, 230)), (90, (W - m, 230)), (180, (W - m, H - 330)), (270, (m, H - 330))):
        place(img, c, x, y, ax=0, ay=0, rot=rot, alpha=a * 0.9)
    gl = G(label, 'mono', 28, CREAM, 0.14, SH_S)
    typer(img, gl, m + 6, cap_y(gl, 200), t0, t, cps=60, alpha=a)
    # REC + timecode
    if int(t * 2) % 2 == 0:
        place(img, dot_sprite(16), W - m - 210, 200, scale=1.2, tint=TOMATO, alpha=a)
    tc = f'REC 00:{int(t):02d}:{int((t % 1) * 60):02d}'
    gt = G(tc, 'mono', 28, CREAM, 0.08, SH_S)
    place_glyphs(img, gt, W - m - gt.width, cap_y(gt, 200), alpha=a)
    # scan line
    u = ((t - t0) / 1.4) % 1.0
    y = int(230 + u * (H - 560))
    band = np.exp(-((np.arange(H) - y) / 6.0) ** 2)[:, None, None] * 0.35 * a
    img += band * np.array([1.0, 0.85, 0.6], np.float32)
    if pct is not None:
        gp = G(f'ANALYSE {int(pct):3d}%', 'mono', 28, CREAM, 0.1, SH_S)
        place_glyphs(img, gp, m + 6, cap_y(gp, H - 300), alpha=a)
        w = int(300 * pct / 100)
        if w > 1:
            place(img, bar_sprite(w, 6, GOLD), m + 6 + gp.width + 24, H - 300, ax=0, ay=3, alpha=a)
        place(img, bar_sprite(300, 2, CREAM), m + 6 + gp.width + 24, H - 300, ax=0, ay=1, alpha=a * 0.4)
    return img


@functools.lru_cache(maxsize=None)
def check_sprite(size=34, color=GOLD):
    from PIL import Image, ImageDraw
    S = 4
    im = Image.new('L', (size * S, size * S), 0)
    d = ImageDraw.Draw(im)
    d.line([(size * S * 0.15, size * S * 0.55), (size * S * 0.4, size * S * 0.8), (size * S * 0.88, size * S * 0.2)],
           fill=255, width=int(size * S * 0.16), joint='curve')
    a = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    return colorize(a, color)


@functools.lru_cache(maxsize=None)
def cross_sprite(size=30, color=TOMATO):
    from PIL import Image, ImageDraw
    S = 4
    im = Image.new('L', (size * S, size * S), 0)
    d = ImageDraw.Draw(im)
    w = int(size * S * 0.15)
    d.line([(size * S * 0.18, size * S * 0.18), (size * S * 0.82, size * S * 0.82)], fill=255, width=w)
    d.line([(size * S * 0.82, size * S * 0.18), (size * S * 0.18, size * S * 0.82)], fill=255, width=w)
    a = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    return colorize(a, color)


@functools.lru_cache(maxsize=None)
def pill(w, h):
    return rect_sprite(int(w), int(h), DARK, radius=int(h / 2))


def callout(img, t, t0, t_out, px, py, lx, ly, text):
    """Tracked point (px,py) -> elbow line -> label pill at (lx,ly) (label anchor = left-middle or right-middle)."""
    if t < t0:
        return
    a = 1 - prog(t, t_out, t_out + 0.12)
    if a <= 0:
        return
    p_dot = eback(prog(t, t0, t0 + 0.15), 3.0)
    ring = prog(t, t0, t0 + 0.5)
    place(img, dot_sprite(16), px, py, scale=0.9 * p_dot, tint=CREAM, alpha=a)
    if ring < 1:
        r = 12 + 40 * eout3(ring)
        lay = np.zeros((int(2 * r + 8), int(2 * r + 8)), np.float32)
        cv2.circle(lay, (int(r + 4) * 4, int(r + 4) * 4), int(r * 4), 1.0, 8, cv2.LINE_AA, shift=2)
        place(img, colorize(lay, CREAM), px, py, alpha=a * (1 - ring))
    # line: point -> elbow (lx, py-ish) -> label
    pl = eout3(prog(t, t0 + 0.05, t0 + 0.25))
    if pl > 0:
        lay = np.zeros((H, W), np.float32)
        ex, ey = lx, ly
        mx, my = px + (ex - px) * 0.35, ey
        pts = np.array([[px, py], [mx, my], [ex, ey]], np.float32)
        L = np.hypot(*np.diff(pts, axis=0).T)
        tot = L.sum() * pl
        q = [pts[0]]
        acc = 0
        for k in range(2):
            if acc + L[k] >= tot:
                q.append(pts[k] + (pts[k + 1] - pts[k]) * (tot - acc) / max(L[k], 1e-6))
                break
            q.append(pts[k + 1]); acc += L[k]
        cv2.polylines(lay, [np.round(np.array(q) * 4).astype(np.int32)], False, 1.0, 12, cv2.LINE_AA, shift=2)
        img[...] = img * (1 - lay[..., None] * 0.9 * a) + np.array(CREAM, np.float32) * lay[..., None] * 0.9 * a
    if t >= t0 + 0.2:
        g = G(text, 'mono', 32, CREAM, 0.06, None)
        n = int((t - t0 - 0.2) * 55)
        w = g.width + 90
        right = lx > px
        x0 = lx if right else lx - w
        place(img, pill(w, 62), x0 + w / 2, ly, alpha=0.78 * a)
        place_glyphs(img, g, x0 + 22, cap_y(g, ly), per_glyph=lambda k, i: {'alpha': a if i < n else 0})
        if n >= len(text):
            pc = eback(prog(t, t0 + 0.2 + len(text) / 55, t0 + 0.35 + len(text) / 55), 3.0)
            place(img, check_sprite(34), x0 + w - 36, ly, scale=pc, alpha=a)


# ------------------------------------------------------------------ sections
def s_hook(t):
    """0–2: hook over the topping station; HUD boots."""
    z = 1 + 0.22 * (1 - eoutexpo(prog(t, 0.0, 0.6)))
    img = view('1154', t, 40, z, 0.55, 0.45, blur=0.08 * (1 - prog(t, 0, 0.3)))
    img = darken_band(img, 1060, 1420, 0.55)
    img = hud(img, t, 0.0, 2.0, pct=12 * prog(t, 0, 2))
    g1 = G('WIR HABEN UNSERE', 'anton', 104, CREAM)
    slam(img, g1, 70, cap_y(g1, 1130), 0.0, t, t_out=1.92, s0=1.4)
    g2 = GW('PIZZA', 'anton', 560, CREAM, max_size=230)
    slam(img, g2, 70, cap_y(g2, 1290), 0.5, t, t_out=1.92, s0=1.6)
    g3 = G('gescannt.', 'serif', 150, TOMATO, 0, SH)
    slam(img, g3, 70 + g2.width + 26, cap_y(g3, 1300), 1.0, t, t_out=1.92, s0=1.5)
    return img


T4K = (1, 60)


def s_scan4k(t):
    """2–4: 4K snapshot of the pizza (scan capture); sharp zoom-out from the 4K source, precise callouts."""
    u = t - 2.0
    z = 1.3 + 0.6 * (1 - eoutexpo(prog(u, 0.0, 0.7)))
    img, (x0, y0, sx, sy) = view4k(0, 24, z, 0.52, 0.6)
    img = hud(img, t, 2.0, 4.0, pct=12 + 38 * prog(u, 0, 2))

    def P(nx, ny):
        return (nx * 2160 - x0) * sx, (ny * 3840 - y0) * sy
    if u > 0.55:
        px, py = P(0.60, 0.565)
        callout(img, t, 2.6, 3.9, px, py, px - 80, py - 360, 'BELAG: VON HAND')
        px, py = P(0.42, 0.615)
        callout(img, t, 3.0, 3.9, px, py, px + 160, py + 190, 'TEIG: DINKELMEHL')
        px, py = P(0.20, 0.665)
        callout(img, t, 3.4, 3.9, px, py, px + 250, py + 330, 'RAND: LUFTIG')
    return img


def s_oven(t):
    """4–6: oven; callouts + analysis completes."""
    u = t - 4.0
    z = 1 + 0.25 * (1 - eoutexpo(prog(u, 0.0, 0.5)))
    img = view('1170', u, 40, z, 0.6, 0.45)
    pct = 50 + 50 * eout3(prog(u, 0.2, 1.5))
    img = hud(img, t, 4.0, 6.0, pct=pct)
    tr = tracked('1170', 40, 162, u)
    callout(img, t, 4.25, 5.9, 0.70 * W + tr[0], 0.465 * H + tr[1], 640, 620, 'RAND: GOLDBRAUN')
    callout(img, t, 4.75, 5.9, 0.45 * W + tr[0], 0.58 * H + tr[1], 420, 1330, 'OFEN: HEISS')
    if u >= 1.5:
        g = G('ANALYSE ABGESCHLOSSEN', 'mono', 40, GOLD, 0.14, SH_S)
        a = 1 - prog(t, 5.88, 6.0)
        img = darken_band(img, 1470, 1540, 0.5 * a)
        typer(img, g, 540 - g.width / 2, cap_y(g, 1505), 5.5, t, cps=60, alpha=a)
    return img


ROWS = [  # label, pizza cell, dizza cell
    ('BUCHSTABE', 'P', 'D'),
    ('MEHL', 'IRGENDEINS', 'DINKELMEHL'),
    ('GOOGLE', '?', '5,0'),
    ('ADRESSE', 'IRGENDWO', 'LIPPSTADT'),
]


def s_table(t):
    """6–10: PIZZA vs. DIZZA comparison table."""
    u = t - 6.0
    img = view('1150', u, 1)
    img *= 1 - 0.68 * eout3(prog(u, 0, 0.25))
    a_all = 1 - prog(t, 9.85, 10.0)
    gp = G('PIZZA', 'anton', 130, GREY)
    gv = G('vs.', 'serif', 110, CREAM, 0, SH_S)
    gd = G('DIZZA', 'anton', 130, CREAM)
    gap = 34
    tw = gp.width + gv.width + gd.width + 2 * gap
    hx = 540 - tw / 2
    xp, xd = 500, 845
    slam(img, gp, hx, cap_y(gp, 460), 6.0, t, t_out=9.85, s0=1.5)
    fade(img, gv, hx + gp.width + gap, cap_y(gp, 460) + gp.baseline - gv.baseline, 6.08, t, t_out=9.85, dist=10)
    slam(img, gd, hx + gp.width + gv.width + 2 * gap, cap_y(gd, 460), 6.12, t, t_out=9.85, s0=1.5)
    gc1 = G('NORMAL', 'mono', 26, GREY, 0.2, SH_S)
    gc2 = G('BEI UNS', 'mono', 26, GOLD, 0.2, SH_S)
    typer(img, gc1, xp - gc1.width / 2, cap_y(gc1, 600), 6.3, t, cps=50, t_out=9.85)
    typer(img, gc2, xd - gc2.width / 2, cap_y(gc2, 600), 6.3, t, cps=50, t_out=9.85)
    p = eoutexpo(prog(t, 6.2, 6.5))
    if p > 0:
        place(img, bar_sprite(max(940 * p, 2), 4, CREAM), 70, 545, ax=0, ay=2, alpha=0.8 * a_all)
    for k, (lab, pc, dc) in enumerate(ROWS):
        tk = 6.5 + k * 0.5
        y = 720 + k * 160
        if t < tk:
            continue
        gl = G(lab, 'mono', 30, CREAM, 0.14, SH_S)
        typer(img, gl, 72, cap_y(gl, y), tk, t, cps=60, t_out=9.85)
        g1 = GW(pc, 'anton', 220, GREY, 0, SH_S, max_size=74)
        fade(img, g1, xp - g1.width / 2, cap_y(g1, y), tk + 0.05, t, t_out=9.85, dur=0.2, dist=10)
        if t >= tk + 0.15:
            place(img, cross_sprite(30), xp + g1.width / 2 + 26, y, alpha=a_all)
        g2 = GW(dc, 'anton', 290, CREAM, 0, SH_S, max_size=84)
        slam(img, g2, xd - g2.width / 2, cap_y(g2, y), tk + 0.12, t, t_out=9.85, s0=1.6)
        if t >= tk + 0.25:
            pc_ = eback(prog(t, tk + 0.25, tk + 0.4), 3.0)
            place(img, check_sprite(40), xd + g2.width / 2 + 30, y, scale=pc_, alpha=a_all)
        if k < len(ROWS) - 1:
            place(img, bar_sprite(940, 1, CREAM), 70, y + 82, ax=0, ay=0, alpha=0.25 * a_all)
    # verdict stamp on the downbeat
    if t >= 9.0:
        q = prog(t, 9.0, 9.1)
        s = lerp(2.2, 1.0, ein3(q))
        gs = G('DIZZA GEWINNT.', 'anton', 120, TOMATO, 0.0, SH)
        _ = gs
        place_glyphs(img, gs, 540 - gs.width / 2, cap_y(gs, 1420), per_glyph=lambda k, i: {
            'dx': ((540 - gs.width / 2 + (gs.xs[i] + gs.xs[i + 1]) / 2) - 540) * (s - 1)},
            scale=s, alpha=min(1, q * 3) * a_all, rot=-4)
    return img


MONTAGE = [  # t0, t1, clip, f0, speed, text
    (10.0, 11.0, '1148', 150, 1.6, 'REINKOMMEN.'),
    (11.0, 12.0, '1150', 300, 1.0, 'HINSETZEN.'),
    (12.0, 13.0, '1172', 30, 1.0, 'DURCHATMEN.'),
    (13.0, 14.0, '1154', 150, 1.0, 'BESTELLEN.'),
]


def s_montage(t, spec):
    t0, t1, name, f0, sp, word = spec
    u = t - t0
    zin = 1.35 * (1 - eout3(prog(u, 0, 0.22)))
    zout = 0.4 * ein3(prog(t, t1 - 0.12, t1))
    z = 1 + zin + zout
    img = view(name, u, f0, z, 0.5, 0.5, speed=sp, blur=0.25 * (zin + zout))
    img = darken_band(img, 1250, 1460, 0.5)
    g = GW(word, 'anton', 940, CREAM, max_size=220)
    rise(img, g, 70, cap_y(g, 1360), t0 + 0.04, t, stagger=0.02, dur=0.24)
    return img


def s_rating(t):
    """14–18: 'KUNDEN-SCAN' 5,0 over the dough toss."""
    u = t - 14.0
    zin = 0.35 * (1 - eout3(prog(u, 0, 0.25)))
    img = view('1155', u, 150, 1 + zin, 0.5, 0.5, blur=0.25 * zin)
    img = darken_band(img, 420, 1060, 0.62 * eout3(prog(u, 0, 0.3)) * (1 - prog(t, 17.8, 18.0)))
    a = 1 - prog(t, 17.8, 17.95)
    img = hud(img, t, 14.0, 18.0, label='KUNDEN-SCAN · GOOGLE')
    if a <= 0:
        return img
    big = 330
    gd = G('5', 'anton', big, CREAM)
    gc = G(',0', 'anton', big, CREAM)
    x0 = 540 - (gd.width + gc.width) / 2
    cyc = 640
    yd = cap_y(gd, cyc)
    cell = gd.cap_h * 1.35
    pr = prog(t, 14.25, 15.0)
    pos = 14 * eout3(pr)
    vel = 14 * 3 * (1 - pr) ** 2 / 0.75 if pr < 1 else 0
    clipr = (0, cyc - gd.cap_h * 0.62, W, cyc + gd.cap_h * 0.62)
    if t >= 14.25:
        for dgt in range(int(pos) - 1, int(pos) + 2):
            if dgt < 0:
                continue
            gg = G(str((dgt + 1) % 10), 'anton', big, CREAM)
            place_glyphs(img, gg, x0 + gd.width - gg.width, yd + (dgt - pos) * cell, clip=clipr,
                         mblur=(0, min(vel * 14, 70)), alpha=a)
        place_glyphs(img, gc, x0 + gd.width, yd, alpha=min(1, (t - 14.25) * 6) * a)
    for j in range(5):
        ts = 15.0 + j * 0.125
        q = prog(t, ts, ts + 0.22)
        if q > 0:
            place(img, star_sprite(86), 540 + (j - 2) * 100, 820, scale=eback(q, 3.0), alpha=a)
    gs = G('bei fast 300 Bewertungen', 'serif', 72, CREAM, 0, SH)
    fade(img, gs, 540 - gs.width / 2, cap_y(gs, 930), 15.75, t, t_out=17.8)
    gr = G('ERGEBNIS: SEHR GUT.', 'mono', 32, GOLD, 0.16, SH_S)
    typer(img, gr, 540 - gr.width / 2, cap_y(gr, 1010), 16.5, t, cps=40, alpha=a)
    return img


SIGN_C = (670, 860)


def s_where(t):
    u = t - 18.0
    img = clip('1151', min(u, 1.5), 30)
    b = int(round(260 * eoutexpo(prog(t, 18.0, 18.3))))
    if b > 0:
        img[:b] = 0.0
        img[H - b:] = 0.0
    g1 = G('WO FINDEST', 'anton', 150, CREAM)
    g2 = G('DU UNS?', 'anton', 150, TOMATO)
    slam(img, g1, 540 - g1.width / 2, cap_y(g1, 1330), 18.25, t, t_out=19.45, s0=1.5)
    slam(img, g2, 540 - g2.width / 2, cap_y(g2, 1490), 18.75, t, t_out=19.45, s0=1.5)
    z = prog(t, 19.5, 20.0)
    if z > 0:
        e = ein3(z)
        img = zoom_about(img, 1 + 7.0 * e, SIGN_C[0], SIGN_C[1], blur=0.35 * e)
    return img


def s_address(t):
    u = t - 20.0
    zin = 0.5 * (1 - eoutexpo(prog(u, 0, 0.45)))
    img = view('1146', u, 8, 1 + zin, 0.5, 0.45, blur=0.2 * zin)
    img = darken_band(img, 1300, 1560, 0.6 * eout3(prog(u, 0.1, 0.4)))
    p = eback(prog(t, 20.2, 20.45), 2.4)
    if p > 0:
        place(img, pin_sprite(110), 540, 1300, scale=p)
    g1 = G('EICHENDORFFSTRASSE 25', 'anton', 92, CREAM)
    rise(img, g1, 540 - g1.width / 2, cap_y(g1, 1420), 20.3, t, stagger=0.02, t_out=22.85)
    g2 = G('59555 LIPPSTADT', 'mono', 40, CREAM, 0.2, SH_S)
    typer(img, g2, 540 - g2.width / 2, cap_y(g2, 1515), 20.75, t, cps=40, t_out=22.85)
    return img


def s_hours(t):
    u = t - 23.0
    zin = 0.3 * (1 - eout3(prog(u, 0, 0.25)))
    img = view('1147', u, 220, 1 + zin, 0.5, 0.5, blur=0.25 * zin)
    img = darken_band(img, 1150, 1450, 0.55)
    g1 = G('TÄGLICH GEÖFFNET', 'mono', 40, GOLD, 0.2, SH_S)
    typer(img, g1, 540 - g1.width / 2, cap_y(g1, 1200), 23.1, t, cps=45, t_out=25.85)
    g2 = G('17 – 22 UHR', 'anton', 190, CREAM)
    slam(img, g2, 540 - g2.width / 2, cap_y(g2, 1350), 23.5, t, t_out=25.85, s0=1.5)
    return img


def s_end(t):
    u = t - 26.0
    zin = 0.3 * (1 - eout3(prog(u, 0, 0.25)))
    img = view('1149', u, 190, 1 + zin, 0.5, 0.5, blur=0.25 * zin)
    img = darken_band(img, 1060, 1520, 0.6 * eout3(prog(u, 0, 0.25)))
    img = hud(img, t, 26.0, 27.45, label='DIZZA-SCAN · BEFUND')
    g1 = G('DIAGNOSE:', 'mono', 44, CREAM, 0.2, SH_S)
    typer(img, g1, 540 - g1.width / 2, cap_y(g1, 1150), 26.05, t, cps=40, t_out=27.4)
    g2 = GW('HUNGER.', 'anton', 860, TOMATO, max_size=330)
    slam(img, g2, 540 - g2.width / 2, cap_y(g2, 1330), 26.5, t, t_out=27.4, s0=1.8)
    g3 = GW('DIZZERIA 47', 'anton', 900, CREAM, max_size=220)
    rise(img, g3, 540 - g3.width / 2, cap_y(g3, 1300), 27.5, t, stagger=0.035, dur=0.32)
    g4 = G('Komm vorbei.', 'serif', 96, CREAM, 0, SH)
    fade(img, g4, 540 - g4.width / 2, cap_y(g4, 1445), 28.0, t)
    img *= 1 - ein3(prog(t, 29.55, 30.0))
    return img


SECTIONS = [(0.0, 2.0, s_hook), (2.0, 4.0, s_scan4k), (4.0, 6.0, s_oven), (6.0, 10.0, s_table)]
for spec in MONTAGE:
    SECTIONS.append((spec[0], spec[1], (lambda s: (lambda t: s_montage(t, s)))(spec)))
SECTIONS += [(14.0, 18.0, s_rating), (18.0, 20.0, s_where), (20.0, 23.0, s_address), (23.0, 26.0, s_hours),
             (26.0, DUR + 1, s_end)]

# (time, shake px, flash, rgb split px)
HITS = [(0.0, 6, 0.0, 0), (1.0, 10, 0.0, 6), (2.0, 14, 0.25, 8), (4.0, 8, 0.0, 4), (6.0, 12, 0.2, 6),
        (9.0, 20, 0.0, 10), (10.0, 8, 0.0, 4), (11.0, 8, 0.0, 4), (12.0, 8, 0.0, 4), (13.0, 8, 0.0, 4),
        (14.0, 14, 0.2, 8), (18.0, 6, 0.0, 0), (20.0, 24, 0.85, 12), (23.0, 8, 0.0, 4), (23.5, 10, 0.0, 0),
        (26.0, 8, 0.0, 4), (26.5, 22, 0.0, 12), (27.5, 8, 0.0, 0)]


def section_at(t):
    for a, b, fn in SECTIONS:
        if a <= t < b:
            return fn
    return SECTIONS[-1][2]


def render(t, frame_idx):
    img = section_at(t)(t)
    sx = sy = fl = ca = 0.0
    for ti, amp, flash, split in HITS:
        dt = t - ti
        if 0 <= dt < 0.4:
            e = amp * math.exp(-dt * 13)
            sx += e * math.sin(dt * 90 + ti); sy += e * math.cos(dt * 71 + ti * 2)
            fl += flash * math.exp(-dt * 22)
            ca += split * math.exp(-dt * 20)
    if abs(sx) >= 1 or abs(sy) >= 1:
        img = shift_int(img, sx, sy)
    if ca >= 1:
        img = rgb_split(img, ca)
    if fl > 0.01:
        img = img + np.array([1.0, 0.97, 0.92], np.float32) * min(fl, 1.0)
    return np.clip(img, 0, 1)
