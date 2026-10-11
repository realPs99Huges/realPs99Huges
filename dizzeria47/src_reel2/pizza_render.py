"""Procedural, lit top-down pizza (height map + albedo + normal lighting). Output: RGBA (straight alpha)."""
import os, math, sys
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'assets2')


def fbm(shape, seed, octaves=5, base=64.0, persistence=0.55):
    r = np.random.default_rng(seed)
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp, tot = 1.0, 0.0
    scale = base
    for _ in range(octaves):
        sh = (max(int(h / scale), 2), max(int(w / scale), 2))
        n = r.standard_normal(sh).astype(np.float32)
        n = cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)
        out += n * amp
        tot += amp
        amp *= persistence
        scale /= 2
    return out / tot


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def render(N=2048, seed=47):
    rng = np.random.default_rng(seed)
    c = N / 2
    R = N * 0.47
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    dx, dy = xx - c, yy - c
    r = np.sqrt(dx * dx + dy * dy)
    th = np.arctan2(dy, dx)
    # ---- dough outline (slightly irregular)
    edge_n = np.zeros_like(th)
    for k, a in ((3, 0.010), (5, 0.006), (9, 0.004), (17, 0.0025)):
        edge_n += a * np.sin(k * th + rng.uniform(0, 6.28))
    Rr = R * (1 + edge_n)
    rn = r / Rr                         # normalized radius (1 = dough edge)
    dough = smoothstep(1.0, 0.995, rn)  # alpha
    H = np.zeros((N, N), np.float32)
    A = np.zeros((N, N, 3), np.float32)
    KS = np.zeros((N, N), np.float32)   # specular strength
    SH = np.full((N, N), 30.0, np.float32)
    # ---- crust (cornicione)
    rim_in = 0.80
    crust_mask = smoothstep(rim_in - 0.02, rim_in + 0.03, rn) * dough
    prof = np.exp(-((rn - 0.905) / 0.065) ** 2)
    bub = np.zeros((N, N), np.float32)
    for _ in range(90):
        a = rng.uniform(0, 2 * math.pi)
        rr = R * rng.uniform(0.86, 0.96)
        bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
        s = R * rng.uniform(0.018, 0.05)
        bub += rng.uniform(0.25, 0.7) * np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / (2 * s * s)))
    crust_h = (prof * 1.0 + bub * prof * 0.9) * crust_mask
    crust_h += fbm((N, N), seed + 1, 4, 40) * 0.05 * crust_mask
    # toasting: darker on peaks and outer edge, pale in the valleys
    toast = np.clip(crust_h * 0.75 + fbm((N, N), seed + 2, 4, 80) * 0.25 + 0.15, 0, 1)
    pale = np.array([0.93, 0.80, 0.56], np.float32)
    gold = np.array([0.86, 0.58, 0.28], np.float32)
    brown = np.array([0.55, 0.30, 0.13], np.float32)
    ccol = pale * (1 - toast[..., None]) + gold * toast[..., None]
    ccol = ccol * (1 - np.clip(toast - 0.65, 0, 1)[..., None] * 1.6) + brown * np.clip(toast - 0.65, 0, 1)[..., None] * 1.6
    # leopard spots (char)
    spots = np.zeros((N, N), np.float32)
    for _ in range(170):
        a = rng.uniform(0, 2 * math.pi)
        rr = R * rng.uniform(0.84, 0.99)
        bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
        s = R * rng.uniform(0.004, 0.016)
        spots = np.maximum(spots, rng.uniform(0.5, 1.0) * np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / (2 * s * s))))
    spots *= smoothstep(0.3, 0.6, prof) * crust_mask
    char = np.array([0.16, 0.09, 0.05], np.float32)
    ccol = ccol * (1 - spots[..., None] * 0.9) + char * spots[..., None] * 0.9
    # flour dusting on the rim
    flour = (fbm((N, N), seed + 3, 3, 12) > 1.1).astype(np.float32) * smoothstep(0.93, 0.99, rn) * 0.5
    ccol = ccol * (1 - flour[..., None]) + np.array([0.97, 0.95, 0.9], np.float32) * flour[..., None]
    A += ccol * crust_mask[..., None]
    H += crust_h * 0.55
    KS += 0.05 * crust_mask
    # ---- base / sauce
    inner = dough * (1 - crust_mask)
    sauce_edge = 0.83 + 0.02 * fbm((N, N), seed + 4, 3, 30)
    sauce = smoothstep(sauce_edge + 0.01, sauce_edge - 0.01, rn) * dough
    sn = cv2.GaussianBlur(fbm((N, N), seed + 5, 5, 50), (0, 0), 2)
    scol = np.array([0.56, 0.11, 0.05], np.float32) * (1 + 0.16 * sn[..., None])
    scol = scol * (1 - np.clip(sn - 0.5, 0, 1)[..., None] * 0.45)
    reduc = smoothstep(0.70, 0.82, rn)
    scol = scol * (1 - reduc[..., None] * 0.3) + np.array([0.40, 0.07, 0.04], np.float32) * reduc[..., None] * 0.3
    base_col = np.array([0.90, 0.74, 0.48], np.float32)
    A = A * (1 - inner[..., None]) + (base_col * (1 - sauce[..., None]) + scol * sauce[..., None]) * inner[..., None]
    H += 0.10 * dough + 0.02 * sauce * sn
    KS += 0.35 * sauce * inner
    SH += 30 * sauce
    # ---- mozzarella pools (metaballs) – smooth, glossy, many small pools
    field = np.zeros((N, N), np.float32)
    for _ in range(34):
        a = rng.uniform(0, 2 * math.pi)
        rr = R * math.sqrt(rng.uniform(0, 1)) * 0.76
        bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
        s = R * rng.uniform(0.05, 0.095)
        field += rng.uniform(0.8, 1.2) * np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / (2 * s * s)))
    field += cv2.GaussianBlur(fbm((N, N), seed + 6, 3, 60), (0, 0), 6) * 0.08
    cheese = smoothstep(0.34, 0.46, field) * sauce
    cheese_h = np.clip(field - 0.34, 0, 1.0) ** 0.7 * cheese
    blist = np.clip(cv2.GaussianBlur(fbm((N, N), seed + 7, 3, 24), (0, 0), 3) - 0.62, 0, 1) * 2.2 * cheese
    thin = smoothstep(0.58, 0.38, field) * cheese          # thin edges look more yellow/translucent
    mcol = np.array([0.99, 0.95, 0.83], np.float32) * (1 - thin[..., None] * 0.35) + \
        np.array([0.97, 0.83, 0.55], np.float32) * thin[..., None] * 0.35
    mcol = mcol * (1 - blist[..., None] * 0.55) + np.array([0.80, 0.55, 0.27], np.float32) * blist[..., None] * 0.55
    A = A * (1 - cheese[..., None]) + mcol * cheese[..., None]
    H += cv2.GaussianBlur(cheese_h, (0, 0), 4) * 0.22
    KS = KS * (1 - cheese) + 0.32 * cheese
    SH = SH * (1 - cheese) + 35 * cheese
    # ---- salami
    sal_list = []
    tries = 0
    while len(sal_list) < 11 and tries < 500:
        tries += 1
        a = rng.uniform(0, 2 * math.pi)
        rr = R * math.sqrt(rng.uniform(0.02, 1)) * 0.68
        bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
        s = R * rng.uniform(0.095, 0.115)
        if all(math.hypot(bx - q[0], by - q[1]) > (s + q[2]) * 0.92 for q in sal_list):
            sal_list.append((bx, by, s))
    for bx, by, s in sal_list:
        d = np.sqrt((xx - bx) ** 2 + (yy - by) ** 2) / s
        ang = np.arctan2(yy - by, xx - bx)
        wob = 1 + 0.03 * np.sin(5 * ang + rng.uniform(0, 6)) + 0.02 * np.sin(9 * ang + rng.uniform(0, 6))
        m = smoothstep(1.0, 0.97, d / wob) * dough
        if m.max() <= 0:
            continue
        cup = (d / wob) ** 4 * 0.25 + 0.30                        # slightly cupped edge
        fn = fbm((N, N), int(rng.integers(0, 1e6)), 3, 9)
        fat = smoothstep(0.75, 1.0, fn)
        colc = np.array([0.62, 0.12, 0.10], np.float32) * (1 + 0.08 * cv2.GaussianBlur(fbm((N, N), 99, 3, 20), (0, 0), 2)[..., None])
        colc = colc * (1 - fat[..., None] * 0.8) + np.array([0.93, 0.74, 0.66], np.float32) * fat[..., None] * 0.8
        rim = smoothstep(0.86, 1.0, d / wob)
        colc = colc * (1 - rim[..., None] * 0.22) + np.array([0.46, 0.09, 0.07], np.float32) * rim[..., None] * 0.22
        A = A * (1 - m[..., None]) + colc * m[..., None]
        mh = cv2.GaussianBlur(m, (0, 0), 2.5)
        H = H * (1 - mh) + (0.30 + cup * 0.22 + 0.006 * fn) * mh
        KS = KS * (1 - m) + 0.40 * m
        SH = SH * (1 - m) + 55 * m
    # melted cheese partially over salami edges
    # ---- basil leaves
    leaves = []
    for li in range(5):
        for _try in range(200):
            a = rng.uniform(0, 2 * math.pi)
            rr = R * math.sqrt(rng.uniform(0.05, 1)) * 0.62
            bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
            if all(math.hypot(bx - q[0], by - q[1]) > R * 0.3 for q in leaves):
                break
        leaves.append((bx, by))
        L = R * rng.uniform(0.075, 0.105)
        rot = rng.uniform(0, math.pi)
        ca, sa = math.cos(rot), math.sin(rot)
        u = ((xx - bx) * ca + (yy - by) * sa) / L
        v = (-(xx - bx) * sa + (yy - by) * ca) / L
        width = 0.42 * np.sqrt(np.clip(1 - u * u, 0, 1)) * (1 - 0.35 * u)
        m = smoothstep(0.02, -0.02, np.abs(v) - width) * (np.abs(u) < 1) * dough
        if m.max() <= 0:
            continue
        vein = np.exp(-(v / 0.025) ** 2) * (np.abs(u) < 0.95)
        side = np.exp(-((np.abs(v) - 0.5 * width * (1 - np.abs(u))) / 0.02) ** 2) * 0.0
        g1 = np.array([0.08, 0.22, 0.06], np.float32)
        g2 = np.array([0.18, 0.40, 0.12], np.float32)
        tt_ = np.clip(0.5 + 0.5 * v / (width + 1e-3), 0, 1)
        gcol = g1 * (1 - tt_[..., None]) + g2 * tt_[..., None]
        gcol = gcol + vein[..., None] * np.array([0.12, 0.16, 0.08], np.float32)
        A = A * (1 - m[..., None]) + gcol * m[..., None]
        H = H * (1 - m) + (H + 0.06 - 0.15 * v * v) * m
        KS = KS * (1 - m) + 0.18 * m
        SH = SH * (1 - m) + 25 * m
    # ---- olive oil droplets
    for _ in range(30):
        a = rng.uniform(0, 2 * math.pi)
        rr = R * math.sqrt(rng.uniform(0, 1)) * 0.75
        bx, by = c + rr * math.cos(a), c + rr * math.sin(a)
        s = R * rng.uniform(0.006, 0.014)
        m = np.exp(-(((xx - bx) ** 2 + (yy - by) ** 2) / (2 * s * s))) * dough * (1 - crust_mask)
        A = A * (1 - m[..., None] * 0.35) + np.array([0.95, 0.55, 0.12], np.float32) * m[..., None] * 0.35
        KS = np.maximum(KS, m * 0.9)
        SH = np.maximum(SH, m * 120)
    # ---- lighting
    Hs = cv2.GaussianBlur(H, (0, 0), 1.5)
    k = N / 190.0
    gx = cv2.Sobel(Hs, cv2.CV_32F, 1, 0, ksize=3) * k
    gy = cv2.Sobel(Hs, cv2.CV_32F, 0, 1, ksize=3) * k
    nz = np.ones_like(gx)
    nrm = np.sqrt(gx * gx + gy * gy + nz)
    nx, ny, nzz = -gx / nrm, -gy / nrm, nz / nrm
    Ld = np.array([-0.45, -0.55, 0.70], np.float32); Ld /= np.linalg.norm(Ld)
    diff = np.clip(nx * Ld[0] + ny * Ld[1] + nzz * Ld[2], 0, 1)
    hv = Ld + np.array([0, 0, 1], np.float32); hv /= np.linalg.norm(hv)
    spec = np.clip(nx * hv[0] + ny * hv[1] + nzz * hv[2], 0, 1) ** SH * KS
    # ambient occlusion from height cavities
    ao = 1 - np.clip(cv2.GaussianBlur(H, (0, 0), N / 90) - H, 0, 1) * 1.6
    ao = np.clip(ao, 0.45, 1)
    light = (0.32 + 0.85 * diff) * ao
    col = A * light[..., None] * np.array([1.04, 1.0, 0.95], np.float32) + spec[..., None] * np.array([1.0, 0.95, 0.85],
                                                                                                    np.float32)
    # warm global grade + slight saturation
    l = col @ np.array([0.299, 0.587, 0.114], np.float32)
    col = l[..., None] + (col - l[..., None]) * 1.08
    col = np.clip(col, 0, 1)
    rgba = np.dstack([col, dough]).astype(np.float32)
    return rgba


def board(W=1080, H=1920, seed=5):
    """Dark slate stone with soft warm light pool and faint flour dusting."""
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    mott = cv2.GaussianBlur(fbm((H, W), seed, 5, 260, 0.55), (0, 0), 3)
    fine = cv2.GaussianBlur(r.standard_normal((H, W)).astype(np.float32), (0, 0), 0.8)
    v = 0.075 + 0.022 * mott + 0.006 * fine
    light = np.exp(-(((xx - W * 0.45) / (W * 0.9)) ** 2 + ((yy - H * 0.45) / (H * 0.55)) ** 2))
    v = v * (0.75 + 0.45 * light)
    img = np.dstack([v * 1.08, v * 1.0, v * 0.94]).astype(np.float32)
    cloud = np.clip(fbm((H, W), seed + 3, 4, 260) * 0.9 - 0.25, 0, 1) * 0.045
    specks = np.zeros((H, W), np.float32)
    for _ in range(500):
        x, y = r.uniform(0, W), r.uniform(0, H)
        cv2.circle(specks, (int(x * 4), int(y * 4)), int(r.uniform(0.4, 1.1) * 4), float(r.uniform(0.08, 0.25)), -1,
                   cv2.LINE_AA, shift=2)
    specks *= np.clip(cloud * 18, 0, 1)
    img += (cv2.GaussianBlur(specks, (0, 0), 0.7) + cloud)[..., None] * np.array([0.92, 0.9, 0.86], np.float32)
    return np.clip(img, 0, 1)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    big = render(2048)
    small = cv2.resize(big, (1600, 1600), interpolation=cv2.INTER_AREA)
    np.save(os.path.join(OUT, 'pizza_hq.npy'), small.astype(np.float16))
    bd = board()
    np.save(os.path.join(OUT, 'board.npy'), bd.astype(np.float16))
    # preview on board
    prev = bd.copy()
    p = cv2.resize(small, (900, 900), interpolation=cv2.INTER_AREA)
    a = p[..., 3]
    y0, x0 = 510, 90
    sh = np.zeros(prev.shape[:2], np.float32)
    sh[y0 + 28:y0 + 928, x0 + 10:x0 + 910] = a
    sh = cv2.GaussianBlur(sh, (0, 0), 24)
    prev *= (1 - 0.7 * sh[..., None])
    reg = prev[y0:y0 + 900, x0:x0 + 900]
    reg[...] = p[..., :3] * a[..., None] + reg * (1 - a[..., None])
    cv2.imwrite(os.path.join(os.path.dirname(HERE), 'pizza_hq_prev.jpg'),
                cv2.cvtColor((np.clip(prev, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
    crop = (np.clip(big[600:1400, 600:1400, :3], 0, 1) * 255).astype(np.uint8)
    cv2.imwrite(os.path.join(os.path.dirname(HERE), 'pizza_hq_crop.jpg'), cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))
    print('done')
