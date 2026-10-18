"""Schnitt-Engine für die Paki-Akin-Edits.

Ein Video wird vollständig über ein Konfigurationsmodul beschrieben (siehe
video_*.py): behaltene Passagen, Bildausschnitte, Untertitel, Specials
(Typografie/Grafik), Licht, Sounddesign und Musik. Diese Engine setzt das um:

  Bild   – einmal auf 30-fps-Raster dekodiert, jeder Ausgabe-Frame in EINER
           Lanczos-Transformation aus der Quelle (Zoom um Gesichts-Anker),
           Licht/Blitz, Verlauf, Farbkorrektur, libass-Typografie, x264.
  Ton    – Segmente mit 12-ms-Blenden, Hochpass, De-Esser, Kompressor,
           2-Pass-Loudnorm, synthetische SFX, komponierte Musik mit Ducking.

Alle Zeitangaben in den Konfigurationen sind QUELLZEITEN (Sekunden im Original).
"""
import json
import os
import subprocess
import sys
import wave

import cv2
import numpy as np

import music

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
FPS, W, H, SR = 30, 1080, 1920, 48000
GOLD, WHITE = "&H0096CDF2&", "&H00FFFFFF&"
WARM = np.array([0.42, 0.74, 1.0], np.float32)       # BGR, Farbe des Lampenlichts
FLASH = np.array([0.86, 0.93, 1.0], np.float32)
X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-colorspace", "bt709", "-color_range", "tv"]
GRADE = ("colorbalance=rs=-0.02:bs=0.02:rm=-0.02:bm=0.02:rh=-0.03:bh=0.01,"
         "eq=contrast=1.04:saturation=0.96")

ASS_STYLES = """[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter SemiBold,62,&H00FFFFFF,&H00FFFFFF,&H8C000000,&HA0000000,0,0,0,0,100,100,0.6,0,1,3.4,1.8,5,140,140,0,1
Style: Head,Instrument Serif,128,&H00FFFFFF,&H00FFFFFF,&H78000000,&HA0000000,0,1,0,0,100,100,0.5,0,1,4,2,5,80,80,0,1
Style: HeadRoman,Instrument Serif,104,&H00FFFFFF,&H00FFFFFF,&H78000000,&HA0000000,0,0,0,0,100,100,0.5,0,1,4,2,5,80,80,0,1
Style: Label,Instrument Serif,66,&H00FFFFFF,&H00FFFFFF,&H78000000,&HA0000000,0,1,0,0,100,100,0.5,0,1,3,1.6,5,80,80,0,1
Style: Small,Inter Medium,46,&H00FFFFFF,&H00FFFFFF,&H8C000000,&HA0000000,0,0,0,0,100,100,2.4,0,1,3,1.6,5,80,80,0,1
Style: Chip,Inter SemiBold,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,1.2,0,1,0,0,5,60,60,0,1
Style: Shape,Inter Medium,20,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
"""


def ease(u):
    return u * u * (3 - 2 * u)


def ease_out(u):
    return 1 - (1 - u) ** 3


def at(t):
    cs = max(0, round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def st(t):
    ms = max(0, round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def keep_ranges(start, end, trims=(), remove=()):
    """Behaltene Bereiche: Pausen (von, bis, Rest) auf "Rest" Sekunden kürzen, Bereiche entfernen."""
    cuts = [(gs + keep / 2, ge - keep / 2) for gs, ge, keep in trims] + list(remove)
    cuts.sort()
    out, cur = [], start
    for a, b in cuts:
        out.append((cur, a))
        cur = b
    out.append((cur, end))
    return out


class Project:
    def __init__(self, cfg):
        self.c = cfg
        self.build = os.path.join(HERE, "build", cfg.SLUG)
        os.makedirs(self.build, exist_ok=True)
        self.anchor = cfg.ANCHOR
        self.src_w, self.src_h = getattr(cfg, "SRC_SIZE", (720, 1280))
        self.base = W / self.src_w                          # Quelle füllt die Breite
        self.crop_top = (self.src_h * self.base - H) / 2    # Rest wird oben/unten gleichmäßig beschnitten
        segs = []
        teaser = getattr(cfg, "TEASER", None) or []
        if teaser and not isinstance(teaser[0], (list, tuple)):
            teaser = [teaser]
        for a, b in teaser:             # Cold Open / Hook-Montage: ein oder mehrere Fragmente
            segs.append(("T", round(a * FPS), round(b * FPS)))
        for a, b in cfg.KEEP:
            segs.append(("M", round(a * FPS), round(b * FPS)))
        self.segs = segs
        self.seg_out, t = [], 0
        for _, a, b in segs:
            self.seg_out.append(t)
            t += b - a
        self.n_frames = t
        self.total = t / FPS
        n_t = sum(1 for s in segs if s[0] == "T")
        self.t_cut = self.seg_out[n_t] / FPS if n_t else None
        self.t_joins = [self.seg_out[i] / FPS for i in range(1, n_t)]     # Schnitte innerhalb der Montage
        self.track = self.load_track(getattr(cfg, "FACE_TRACK", None))
        self.events, self.srt = [], []
        self._env = None

    # ----- Timeline ---------------------------------------------------------
    def seg_index(self, src_t, seg="M"):
        best = None
        for i, (name, a, b) in enumerate(self.segs):
            if name != seg:
                continue
            if a / FPS - 1e-6 <= src_t <= b / FPS + 1e-6:
                return i
            d = min(abs(src_t - a / FPS), abs(src_t - b / FPS))
            if d < 0.35 and (best is None or d < best[0]):
                best = (d, i)
        if best:
            return best[1]
        raise ValueError(f"Quellzeit {src_t:.2f} liegt in keinem Segment {seg}")

    def to_out(self, src_t, seg="M"):
        i = self.seg_index(src_t, seg)
        _, a, b = self.segs[i]
        return self.seg_out[i] / FPS + min(max(src_t, a / FPS), b / FPS) - a / FPS

    def seg_end(self, i):
        _, a, b = self.segs[i]
        return (self.seg_out[i] + b - a) / FPS

    def resolve(self, ref):
        if ref[0] == "out":
            return ref[1]
        if ref[0] == "cut":
            return self.t_cut
        if ref[0] == "end":
            return self.total + ref[1]
        if ref[0] == "teaser":
            return self.seg_out[ref[1]] / FPS + (ref[2] if len(ref) > 2 else 0.0)
        return self.to_out(ref[1], ref[2] if len(ref) > 2 else "M")

    def zoom_for(self, seg, src_t):
        for s, a, b, z0, z1, curve in self.c.SHOTS:
            if s == seg and a - 1e-3 <= src_t < b + 1e-3:
                u = min(1.0, max(0.0, (src_t - a) / (b - a)))
                return z0 + (z1 - z0) * (ease(u) if curve == "ease" else u)
        return 1.0

    @staticmethod
    def load_track(path):
        """Gesichtsposition über die Zeit: Ausreißer entfernen, interpolieren, weich glätten (~0,8 s)."""
        if not path:
            return None
        pts = np.array(json.load(open(path)), float)
        t, x, y, w = pts.T
        med = np.array([np.median(w[max(0, i - 6):i + 7]) for i in range(len(w))])
        ok = np.abs(w - med) < 0.3 * med
        t, x, y = t[ok], x[ok], y[ok]
        grid = np.arange(0, t[-1] + 1, 1 / FPS)
        xs, ys = np.interp(grid, t, x), np.interp(grid, t, y)
        k = np.exp(-0.5 * (np.arange(-36, 37) / 12) ** 2)
        k /= k.sum()
        sm = lambda v: np.convolve(np.pad(v, 36, mode="edge"), k, mode="valid")
        return grid, sm(xs), sm(ys)

    def anchor_at(self, src_t):
        if self.track is None:
            return self.anchor
        g, xs, ys = self.track
        return float(np.interp(src_t, g, xs)), float(np.interp(src_t, g, ys))

    @staticmethod
    def heart(d):
        """Herzschlag-Form ("ba-bum"): zwei weiche Impulse bei 0 und 0,24 s."""
        b = lambda x: np.exp(-0.5 * (x / 0.045) ** 2) if -0.15 < x < 0.3 else 0.0
        return b(d) + 0.7 * b(d - 0.24)

    def frame_plan(self):
        plan = []
        pulses = [(self.resolve(ref), amp) for ref, amp in getattr(self.c, "PULSES", ())]
        for name, a, b in self.segs:
            for f in range(a, b):
                t = len(plan) / FPS
                z = self.zoom_for(name, f / FPS) * (1 + sum(amp * self.heart(t - tp) for tp, amp in pulses))
                plan.append((f, z, self.anchor_at(f / FPS)))
        return plan

    # ----- Stimmeinsätze --------------------------------------------------
    def env(self):
        if self._env is None:
            raw = subprocess.run(["ffmpeg", "-v", "error", "-i", self.c.SRC, "-ac", "1", "-ar", "16000",
                                  "-f", "s16le", "-"], capture_output=True, check=True).stdout
            a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
            n = len(a) // 320
            self._env = 20 * np.log10(np.sqrt((a[: n * 320].reshape(n, 320) ** 2).mean(1)) + 1e-9)
        return self._env

    def snap(self, src_t):
        env = self.env()
        i = int(src_t / 0.02)
        if env[i] > -50:
            return src_t - 0.03
        for j in range(i, min(len(env), i + 25)):
            if env[j] > -46:
                return j * 0.02 - 0.05
        return src_t

    # ----- ASS-Bausteine ---------------------------------------------------
    def ev(self, t0, t1, style, text, layer=1):
        if t1 - t0 > 0.005:
            self.events.append(f"Dialogue: {layer},{at(t0)},{at(t1)},{style},,0,0,0,,{text}")

    def focus_words(self, words, t0, seg="M", dur=260, blur=9):
        parts = []
        for w, wt, *col in words:
            ms = max(0, round((self.to_out(wt, seg) - t0) * 1000))
            c = "\\1c" + col[0] if col else ""
            parts.append("{\\alpha&HFF&\\blur%d%s\\t(%d,%d,0.6,\\alpha&H00&\\blur0.7)}%s" % (blur, c, ms, ms + dur, w))
        return " ".join(parts)

    def headline(self, t0, t1, lines, seg="M", rise=10, settle=900, dur=260, fade_out=140, srt=None, layer=2):
        """lines: [(Wörter [(wort, quellzeit[, farbe])], y, Stil)]"""
        for words, y, style in lines:
            self.ev(t0, t1, style, "{\\an5\\q2\\move(540,%d,540,%d,0,%d)\\fad(0,%d)}" % (y + rise, y, settle, fade_out)
                    + self.focus_words(words, t0, seg, dur=dur, blur=9 if style != "Small" else 6), layer)
        if srt:
            first = self.to_out(min(w[1] for words, _, _ in lines for w in words), seg) - 0.05
            self.srt.append((max(t0, first), t1, srt))

    def frames(self, t0, t1, style, text_fn, layer=3):
        """Bildgenaue Animation: text_fn(u) liefert den Text (oder [(Text, Ebene), …]) für Fortschritt u."""
        n = max(1, int(round((t1 - t0) * FPS)))
        for k in range(n):
            r = text_fn((k + 1) / n)
            for text, lay in (r if isinstance(r, list) else [(r, layer)]):
                self.ev(t0 + k / FPS, t0 + (k + 1) / FPS, style, text, lay)

    @staticmethod
    def shape_text(x, y, path, width=3.0, filled=False, color=WHITE, extra="", extra_main="", layer=3):
        """Vektorform mit weichem dunklem Schatten darunter (Lesbarkeit auf unruhigem Hintergrund).
        extra wirkt auf Form und Schatten (Blenden, Masken), extra_main nur auf die Form (Farbwechsel)."""
        if filled:
            sh = "\\1c&H000000&\\1a&H90&\\3c&H000000&\\3a&H90&\\bord3\\blur4"
            main = "\\1c%s\\bord0" % color
        else:
            sh = "\\1a&HFF&\\3c&H000000&\\3a&H80&\\bord%.1f\\blur4" % (width + 3)
            main = "\\1a&HFF&\\3c%s\\bord%.1f" % (color, width)
        base = "{\\an5\\pos(%d,%d)\\p1\\shad0%s%s}%s"
        return [(base % (x, y, sh, extra, path), layer), (base % (x, y, main, extra + extra_main, path), layer + 1)]

    def shape(self, t0, t1, *a, **k):
        for text, lay in self.shape_text(*a, **k):
            self.ev(t0, t1, "Shape", text, lay)

    def build_cards(self):
        cards = self.c.CARDS
        starts = sorted([c[0] for c in cards] + list(getattr(self.c, "BREAKS", ())))
        for s, text, kws, *opt in cards:
            opt = opt[0] if opt else {}
            t0 = self.to_out(self.snap(s))
            nxt = next((x for x in starts if x > s + 1e-6), None)
            if nxt is None:
                t1 = self.total
            else:   # bis zur nächsten Karte – auch über gekürzte Pausen hinweg
                is_break = nxt in getattr(self.c, "BREAKS", ())
                t1 = self.to_out(nxt if is_break else self.snap(nxt))
            t1 = min(t1, t0 + 4.0)
            body = text
            for kw, kt in kws.items():
                ms = max(0, round((self.to_out(kt) - t0) * 1000))
                body = body.replace(kw, "{\\1c%s\\t(%d,%d,\\1c%s)}%s{\\1c%s}" % (WHITE, ms, ms + 140, GOLD, kw, WHITE), 1)
            y = opt.get("y", self.c.SUB_Y)
            self.ev(t0, t1, "Sub", "{\\an5\\q2\\move(540,%d,540,%d,0,170)\\fad(110,80)\\blur0.6}" % (y + 10, y) + body)
            self.srt.append((t0, t1, text))

    def write_subs(self):
        self.events.clear(), self.srt.clear()
        self.build_cards()
        self.c.specials(self)
        head = (f"[Script Info]\nTitle: {self.c.TITLE}\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\n"
                "WrapStyle: 0\nScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n" + ASS_STYLES +
                "\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
        with open(self.c.ASS, "w", encoding="utf-8") as f:
            f.write(head + "\n".join(self.events) + "\n")
        rows = sorted(self.srt)
        with open(self.c.OUT_SRT, "w", encoding="utf-8") as f:
            for n, (a, b, t) in enumerate(rows, 1):
                f.write(f"{n}\n{st(a)} --> {st(b)}\n{t}\n\n")
        return rows

    # ----- Bild -------------------------------------------------------------
    def source_frames(self):
        path = os.path.join(self.build, "src_30fps.bgr")
        size = self.src_w * self.src_h * 3
        need = max(b for _, _, b in self.segs) + 1
        if not os.path.exists(path) or os.path.getsize(path) < need * size:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.c.SRC, "-vf",
                            f"fps={FPS},scale=in_color_matrix=bt709:in_range=tv:out_color_matrix=bt709:out_range=full,format=bgr24",
                            "-f", "rawvideo", path], check=True)
        n = os.path.getsize(path) // size
        return np.memmap(path, np.uint8, "r", shape=(n, self.src_h, self.src_w, 3))

    def affine(self, z, anchor=None):
        s = self.base * z
        ax, ay = anchor or self.anchor
        return np.float32([[s, 0, ax * self.base - s * ax], [0, s, ay * self.base - self.crop_top - s * ay]])

    def prepare_light(self):
        self._yy, self._xx = np.mgrid[0:H, 0:W].astype(np.float32)
        y0, a = self.c.GRADIENT
        u = np.clip((self._yy[:, :1] - y0) / (H - y0), 0, 1)
        self._mask = (1.0 - a * ease(u))[:, :, None]
        self._lights = []
        for L in self.c.LIGHTS:
            self._lights.append(dict(L, t=self.resolve(L["ref"])))

    def render_frame(self, img, z, t, anchor=None):
        out = cv2.warpAffine(img, self.affine(z, anchor), (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
        f = out.astype(np.float32) / 255
        for L in self._lights:
            t0, rise, fall = L["t"], L["rise"], L["fall"]
            if not (t0 - rise <= t <= t0 + fall * 3):
                continue
            k = L["peak"] * (min(1, (t - t0 + rise) / rise) if t < t0 else np.exp(-(t - t0) / fall))
            if k < 0.003:
                continue
            cx = L["cx"] + L.get("drift", 0) * (t - t0 + rise)
            g = np.exp(-(((self._xx - cx) / L["rx"]) ** 2 + ((self._yy - L["cy"]) / L["ry"]) ** 2))[:, :, None]
            f = 1 - (1 - f) * (1 - g * WARM * k)
        for tj in self.t_joins:         # kurze Blitze an den Montage-Schnitten
            d = t - tj
            fl = 0.32 * np.exp(-d / 0.05) if 0 <= d < 0.25 else (0.32 * (1 + d / 0.034) if -0.034 <= d < 0 else 0)
            if fl > 0.003:
                f = 1 - (1 - f) * (1 - FLASH * fl)
        for ref, dur, depth in getattr(self.c, "DIPS", ()):   # Abdunklung vor einem Moment (z. B. Enthüllung)
            te = self.resolve(ref)
            if te - dur <= t < te:
                f = f * (1 - depth * ease((t - (te - dur)) / dur))
        for ref, peak in getattr(self.c, "FLASHES", ()):      # einzelne Lichtblitze
            d = t - self.resolve(ref)
            fl = peak * np.exp(-d / 0.08) if 0 <= d < 0.4 else (peak * (1 + d / 0.05) if -0.05 <= d < 0 else 0)
            if fl > 0.003:
                f = 1 - (1 - f) * (1 - FLASH * fl)
        dip = getattr(self.c, "DIP", None)
        if dip and self.t_cut is not None and self.t_cut - dip[0] <= t < self.t_cut:
            u = (t - (self.t_cut - dip[0])) / dip[0]
            f = f * (1 - dip[1] * ease(u))
        if self.t_cut is not None:
            d = t - self.t_cut
            fl = 0.65 * (1 + d / 0.11) ** 2 if -0.11 <= d < 0 else (0.65 * np.exp(-d / 0.09) if 0 <= d < 0.5 else 0)
            if fl > 0.003:
                f = 1 - (1 - f) * (1 - FLASH * fl)
        f *= self._mask
        return (np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8)

    def vfilter(self):
        return (f"{GRADE},ass='{self.c.ASS}':fontsdir='{FONTS}',"
                "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p")

    # ----- Ton ----------------------------------------------------------------
    def build_voice(self, path):
        chains, labels = [], []
        last = len(self.segs) - 1
        for i, (_, a, b) in enumerate(self.segs):
            a, b = a / FPS, b / FPS
            fin = "afade=t=in:d=0.012," if i else ""
            fo = 0.2 if i == last else 0.012
            chains.append(f"[0:a]atrim=start={a:.5f}:end={b:.5f},asetpts=PTS-STARTPTS,aresample={SR},"
                          f"{fin}afade=t=out:st={b - a - fo:.4f}:d={fo}[s{i}]")
            labels.append(f"[s{i}]")
        chains.append("".join(labels) + f"concat=n={len(self.segs)}:v=0:a=1,highpass=f=80,deesser=i=0.35:m=0.5:f=0.5,"
                      "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1[v]")
        pre = os.path.join(self.build, "voice_pre.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.c.SRC, "-filter_complex", ";".join(chains),
                        "-map", "[v]", "-ac", "2", "-c:a", "pcm_s16le", pre], check=True)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True)
        js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
        ln = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
              f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"{ln},aresample={SR}",
                        "-c:a", "pcm_s16le", path], check=True)

    @staticmethod
    def synth_sfx(kind, rng):
        if kind == "click":
            t = np.arange(int(0.25 * SR)) / SR
            s = np.sin(2 * np.pi * 1650 * t) * np.exp(-t / 0.018) + 0.6 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.03)
            return s / np.abs(s).max(), 0.0
        if kind == "heartbeat":   # zwei tiefe, weiche Schläge ("ba-bum"), Zeitpunkt = erster Schlag
            t = np.arange(int(0.9 * SR)) / SR
            beat = lambda t0, a: a * np.sin(2 * np.pi * (52 + 30 * np.exp(-np.clip(t - t0, 0, None) / 0.03))
                                            * np.clip(t - t0, 0, None)) * np.exp(-np.clip(t - t0, 0, None) / 0.09) * (t >= t0)
            s = beat(0.0, 1.0) + beat(0.24, 0.7)
            return s / np.abs(s).max(), 0.0
        if kind == "bell":      # weicher Glockenton (inharmonische Teiltöne), Zeitpunkt = Anschlag
            t = np.arange(int(3.0 * SR)) / SR
            f0 = 1046.5
            s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / d)
                    for r, a, d in ((1, 1, 1.4), (2.0, 0.35, 0.8), (2.76, 0.25, 0.5), (5.4, 0.08, 0.2)))
            s *= np.minimum(1, t / 0.004)
            return s / np.abs(s).max(), 0.0
        if kind == "clink":     # Deckel setzt auf: kurzer Keramik-Klang + weicher Tiefton
            t = np.arange(int(0.8 * SR)) / SR
            s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
                    for f, a, d in ((1870, 1, 0.09), (2930, 0.6, 0.06), (4410, 0.3, 0.04), (160, 0.7, 0.05)))
            s *= np.minimum(1, t / 0.0015)
            return s / np.abs(s).max(), 0.0
        if kind in ("impact", "hit"):
            t = np.arange(int(1.2 * SR)) / SR
            f = 46 + 44 * np.exp(-t / 0.05)
            body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
            air = rng.standard_normal(len(t)) * np.exp(-t / (0.012 if kind == "impact" else 0.05))
            air = np.convolve(air, np.ones(10) / 10, mode="same")
            s = (body + (0.3 if kind == "impact" else 0.5) * air) * np.minimum(1, t / 0.002)
            return s / np.abs(s).max(), 0.0
        if kind in ("rise", "drop"):    # Whoosh, Höhepunkt = Synchronpunkt
            r = music.riser(0.55, rng)
            if kind == "drop":
                r = r[::-1] * np.linspace(0, 1, len(r)) ** 0.3
                return r / np.abs(r).max(), 0.0
            tail = r[-1] * np.exp(-np.arange(int(0.25 * SR)) / SR / 0.06)
            return np.concatenate([r, tail]), 0.55
        raise ValueError(kind)

    def build_sfx(self):
        rng = np.random.default_rng(5)
        buf = np.zeros((int(self.total * SR) + SR, 2))
        for kind, ref, db in self.c.SFX:
            s, peak = self.synth_sfx(kind, rng)
            music.add(buf, s * 10 ** (db / 20), self.resolve(ref) - peak)
        return buf[: int(self.total * SR)]

    @staticmethod
    def duck_gain(voice):
        hop = 480
        v = voice.mean(1)
        n = len(v) // hop
        rms = np.sqrt((v[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
        active = (20 * np.log10(rms) > -42).astype(float)
        g = np.zeros(n)
        for i in range(1, n):
            k = 0.17 if active[i] > g[i - 1] else 0.022
            g[i] = g[i - 1] + k * (active[i] - g[i - 1])
        gain = np.repeat(10 ** (-7 * g / 20), hop)
        return np.pad(gain, (0, len(v) - len(gain)), mode="edge")

    def build_audio(self):
        vp = os.path.join(self.build, "voice.wav")
        self.build_voice(vp)
        with wave.open(vp) as w:
            voice = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64).reshape(-1, 2) / 32768
        n = int(self.total * SR)
        voice = np.pad(voice, ((0, max(0, n - len(voice))), (0, 0)))[:n]
        sfx = self.build_sfx()
        m = self.c.MUSIC
        mus, info = music.compose(self.total, self.resolve(m["first_beat"]), self.resolve(m["open"]), m["score"])
        mus = mus[:n] * self.duck_gain(voice)[:, None] * 10 ** (m.get("level_db", -11.0) / 20)
        mixes = {"mix_musik": voice + sfx + mus, "mix_ohne_musik": voice + sfx, "musik_solo": mus}
        for name, x in mixes.items():
            if name != "musik_solo":
                peak = np.abs(x).max()
                if peak > 0.89:
                    x *= 0.89 / peak
            pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
            with wave.open(os.path.join(self.build, name + ".wav"), "wb") as w:
                w.setnchannels(2), w.setsampwidth(2), w.setframerate(SR)
                w.writeframes(pcm.tobytes())
        return info

    # ----- Render ----------------------------------------------------------
    def render(self):
        self.write_subs()
        print(f"[{self.c.SLUG}] Ton …", flush=True)
        info = self.build_audio()
        print(f"  Musik: {info['bpm']:.1f} BPM, Takt {info['bar']:.3f} s, Teil B {info['bars_b']} Takte")
        src = self.source_frames()
        plan = self.frame_plan()
        self.prepare_light()
        print(f"[{self.c.SLUG}] Bild … {self.n_frames} Frames, {self.total:.2f} s", flush=True)
        enc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
             "-r", str(FPS), "-i", "-", "-i", os.path.join(self.build, "mix_musik.wav"),
             "-vf", self.vfilter(), "-map", "0:v", "-map", "1:a", *X264, "-r", str(FPS),
             "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-movflags", "+faststart",
             "-metadata", f"title={self.c.TITLE}", self.c.OUT_MAIN], stdin=subprocess.PIPE)
        for k, (f, z, anc) in enumerate(plan):
            enc.stdin.write(self.render_frame(src[f], z, k / FPS, anc).tobytes())
            if (k + 1) % 300 == 0:
                print(f"  {k + 1}/{self.n_frames}", flush=True)
        enc.stdin.close()
        if enc.wait():
            sys.exit("Render fehlgeschlagen")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.c.OUT_MAIN, "-i",
                        os.path.join(self.build, "mix_ohne_musik.wav"), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-movflags", "+faststart",
                        self.c.OUT_NOMUSIC], check=True)
        cache = os.path.join(self.build, "src_30fps.bgr")
        if os.path.exists(cache):       # Rohbild-Cache (mehrere GB) nach dem Render wieder freigeben
            os.remove(cache)
        print("fertig:", self.c.OUT_MAIN)

    def preview(self, times):
        self.write_subs()
        src = self.source_frames()
        plan = self.frame_plan()
        self.prepare_light()
        paths = []
        for t in times:
            k = min(int(round(t * FPS)), self.n_frames - 1)
            f, z, anc = plan[k]
            raw = self.render_frame(src[f], z, k / FPS, anc)
            p = os.path.join(self.build, f"preview_{t:05.2f}.png")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-vf", f"setpts=PTS+{k}/{FPS}/TB,{self.vfilter()}",
                            "-frames:v", "1", p], input=raw.tobytes(), check=True)
            paths.append(p)
        return paths


def main(cfg):
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--subs-only", action="store_true")
    ap.add_argument("--audio-only", action="store_true")
    ap.add_argument("--preview", type=float, nargs="+")
    args = ap.parse_args()
    p = Project(cfg)
    if args.subs_only:
        for a, b, t in p.write_subs():
            print(f"{a:6.2f}-{b:6.2f}  {t}")
        print(f"Länge {p.total:.2f} s" + (f", Schnitt Cold Open bei {p.t_cut:.2f} s" if p.t_cut else ""))
    elif args.audio_only:
        print(p.build_audio())
    elif args.preview:
        print("\n".join(p.preview(args.preview)))
    else:
        p.render()
