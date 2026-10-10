"""Particles (flour, puffs, crumbs) shared with reel #1."""
import math, functools
import numpy as np
import cv2
from lib import *

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




def puff_draw(dst, age, cx, cy):
    puff(dst, age, cx, cy, n=8, seed=6, rmax=420, amax=0.22, dur=1.4)
