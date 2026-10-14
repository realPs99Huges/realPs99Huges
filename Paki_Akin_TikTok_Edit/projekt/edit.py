#!/usr/bin/env python3
"""Paki Akin – TikTok-Edit: komplettes, reproduzierbares Schnittprojekt.

Alles, was den Edit ausmacht (Schnitte, Bildausschnitte, Untertitel,
Hervorhebungen, Sounddesign, Farbkorrektur, Export), steht in den
Konfigurationsblöcken unten. Ändern -> neu rendern:

    python3 edit.py                 # kompletter Render
    python3 edit.py --subs-only     # nur ASS/SRT neu schreiben
    python3 edit.py --preview 18    # einzelnes Kontrollbild bei Ausgabe-Sekunde 18

Benötigt: ffmpeg (mit libass + libx264), Python 3 mit numpy und opencv.
Alle Zeitangaben in den Tabellen sind Zeiten im ORIGINALVIDEO (Sekunden);
das Skript rechnet sie selbst auf die geschnittene Timeline um.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(HERE)
SRC = os.path.join(HERE, "source", "original_paki_akin.mp4")
FONTS = os.path.join(HERE, "fonts")
BUILD = os.path.join(HERE, "build")

FPS = 30                      # Quelle liegt auf einem 30-fps-Raster (VFR, ~25 Bilder/s) -> Timing bleibt 1:1
W, H = 1080, 1920
SRC_W, SRC_H = 640, 1280
BASE = W / SRC_W              # 1.6875: Quelle füllt die Breite
CROP_TOP = (SRC_H * BASE - H) / 2   # 120 px oben/unten werden beschnitten
ANCHOR = (320.0, 450.0)       # Zoom-Ankerpunkt in der Quelle (Gesicht) – bleibt beim Punch-in stehen

# ---------------------------------------------------------------------------
# 1) SCHNITT – behaltene Abschnitte des Originals (Quellzeit, auf 1/30 s gerastert)
# ---------------------------------------------------------------------------
SEGMENTS = [
    # in,      out       Inhalt
    (0 / 30,    233 / 30),  # "Klar sagen ... Eigentlich denke ich das auch."
    #                         raus: 7.77–10.50  Versprecher "Ja, weil irgendeiner und so war Sitcha."
    (315 / 30,  740 / 30),  # "Sitcha war genau so ... Glaub mir."
    #                         raus: 24.67–25.23 Pause gekürzt (0.9 s -> 0.3 s Spannungspause)
    (757 / 30,  842 / 30),  # "Glaub mir, ich mach dich mundtot."
    #                         raus: 28.07–31.30 3.5 s Pause
    (939 / 30, 1078 / 30),  # "Das ist auch nicht gut ... auf mein Nervensystem."
    #                         raus: 35.93–36.73 Ansprache an eine Zuschauerin im Live ("Duygu")
    (1102 / 30, 1178 / 30), # "Manche brauchen aber eine Schelle."
    #                         raus: ab 39.27 Live-Begrüßungen (Elisabeth, Miss Lady, Haare, Produkte)
]

# ---------------------------------------------------------------------------
# 2) BILDAUSSCHNITT – Einstellungen (Quellzeit von–bis, Zoom Start -> Ende)
#    Wechsel liegen auf Schnitten oder Satzgrenzen; Zoom-Drift ist bewusst minimal.
# ---------------------------------------------------------------------------
SHOTS = [
    (0 / 30,    233 / 30, 1.000, 1.035),  # weit, langsamer Push-in
    (315 / 30,  542 / 30, 1.120, 1.140),  # Punch-in kaschiert den Jump-Cut
    (542 / 30,  649 / 30, 1.000, 1.020),  # weit: Raum für "Kein Blatt vor den Mund"
    (649 / 30,  740 / 30, 1.100, 1.130),  # "Aber kommst du mir respektlos?"
    (757 / 30,  842 / 30, 1.150, 1.170),  # engste Einstellung: "ich mach dich mundtot"
    (939 / 30, 1078 / 30, 1.000, 1.030),  # wieder weit, ruhig
    (1102 / 30, 1178 / 30, 1.100, 1.140), # Schluss-Punch-in: "Schelle"
]

# ---------------------------------------------------------------------------
# 3) UNTERTITEL – (Quell-Start, Quell-Ende, Text, {Schlüsselwort: Quellzeit})
#    Schlüsselwörter färben sich in dem Moment, in dem sie gesprochen werden.
# ---------------------------------------------------------------------------
CARDS = [
    (0.00, 0.68, "Klar sagen,", {}),
    (0.68, 1.95, "was die ganzen denken.", {}),
    (2.35, 3.50, "Und diese ganzen Schafe", {"Schafe": 2.96}),
    (3.50, 4.12, "sind dann so:", {}),
    (4.12, 4.70, "„Oh mein Gott,", {}),
    (4.70, 5.34, "hast du gesehen,", {}),
    (5.34, 6.28, "was sie gesagt hat?", {}),
    (6.28, 7.00, "Eigentlich denke", {}),
    (7.00, 233 / 30, "ich das auch.“", {}),
    (10.52, 11.64, "Sitcha war genau so.", {}),
    (11.64, 13.48, "Sie hat sich das getraut,", {}),
    (13.48, 14.60, "auszusprechen,", {}),
    (14.60, 15.64, "was so viele Menschen", {}),
    (15.64, 16.60, "sich nicht getraut haben.", {}),
    (16.60, 17.16, "Und das habe ich", {}),
    (17.16, 542 / 30, "von ihr gelernt.", {}),
    # 18.07–19.97: Headline (siehe HEADLINE) ersetzt hier die Untertitel
    (20.02, 20.68, "Natürlich immer", {}),
    (20.68, 21.62, "mit Respekt.", {"Respekt": 20.96}),
    (21.64, 22.74, "Aber kommst du mir", {}),
    (22.74, 23.70, "respektlos?", {"respektlos": 22.80}),
    (23.70, 740 / 30, "Glaub mir.", {}),
    (25.40, 26.50, "Glaub mir,", {}),
    (26.50, 842 / 30, "ich mache dich mundtot.", {"mundtot": 27.12}),
    (31.56, 32.42, "Das ist auch nicht gut", {}),
    (32.42, 33.70, "für das Nervensystem.", {"Nervensystem": 32.80}),
    (33.70, 34.38, "Überhaupt nicht.", {}),
    (34.38, 35.00, "Und ich achte", {}),
    (35.00, 1078 / 30, "auf mein Nervensystem.", {}),
    (36.86, 37.88, "Manche brauchen aber", {}),
    (37.88, 1178 / 30, "eine Schelle.", {"Schelle": 38.24}),
]

# Kernaussage als typografische Headline – Wörter erscheinen synchron zum Sprechen
HEADLINE = {
    "start": 542 / 30, "end": 19.97,
    "lines": [  # (Wörter mit Quellzeit, y-Position, Stil)
        ([("Kein", 18.16), ("Blatt", 18.44)], 1150, "Head"),
        ([("vor", 18.84), ("den", 19.00), ("Mund", 19.16)], 1282, "Head"),
        ([("zu", 19.42), ("nehmen.", 19.56)], 1384, "HeadSub"),
    ],
}

# ---------------------------------------------------------------------------
# 4) SOUNDDESIGN – (Typ, Quellzeit des Synchronpunkts, Pegel dBFS)
#    Alle Sounds werden synthetisch erzeugt (keine Fremdsamples -> keine Rechtefragen).
# ---------------------------------------------------------------------------
SFX = [
    ("whoosh", 18.12, -22.0),  # Headline baut sich auf
    ("impact", 27.12, -19.0),  # "mundtot"
    ("impact", 38.26, -22.0),  # "Schelle" (leiser als der erste Akzent)
]

# ---------------------------------------------------------------------------
# 5) LOOK & EXPORT
# ---------------------------------------------------------------------------
GRADE = ("colorbalance=rs=-0.02:bs=0.02:rm=-0.03:bm=0.02:rh=-0.02:bh=0.02,"
         "eq=contrast=1.05:saturation=0.95")
GRADIENT = (1020, 0.30)       # ab y=1020 sanft abdunkelnd (max. 30 %) für Untertitel-Lesbarkeit
WHITE, ACCENT = "&H00FFFFFF&", "&H0096CDF2&"   # Weiß / warmes Champagner (BGR)
X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-colorspace", "bt709", "-color_range", "tv"]
OUT_NAME = "Paki_Akin_TikTok_Edit_1080x1920.mp4"


# ===========================================================================
# Timeline-Umrechnung
# ===========================================================================
def out_starts():
    t, starts = 0.0, []
    for a, b in SEGMENTS:
        starts.append(t)
        t += b - a
    return starts, t


SEG_OUT, TOTAL = out_starts()
N_FRAMES = round(TOTAL * FPS)


def to_out(src_t):
    """Quellzeit -> Ausgabezeit (Zeitpunkte in entfernten Passagen werden an den Schnitt geklemmt)."""
    for (a, b), o in zip(SEGMENTS, SEG_OUT):
        if src_t < a:
            return o
        if src_t <= b:
            return o + src_t - a
    return TOTAL


def zoom_at(src_t):
    for a, b, z0, z1 in SHOTS:
        if a - 1e-6 <= src_t < b + 1e-6:
            u = (src_t - a) / max(b - a, 1e-6)
            return z0 + (z1 - z0) * u
    return 1.0


# ===========================================================================
# Untertitel (ASS mit Animation + SRT)
# ===========================================================================
def ass_time(t):
    cs = max(0, round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def srt_time(t):
    ms = max(0, round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


ASS_HEADER = f"""[Script Info]
Title: Paki Akin – TikTok Edit
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter SemiBold,62,&H00FFFFFF,&H00FFFFFF,&H9A000000,&HB4000000,0,0,0,0,100,100,0.6,0,1,3.2,1.6,5,150,150,0,1
Style: Head,Instrument Serif,132,&H00FFFFFF,&H00FFFFFF,&H74000000,&HB4000000,0,1,0,0,100,100,0.5,0,1,4,2,5,120,120,0,1
Style: HeadSub,Inter Medium,44,&H00FFFFFF,&H00FFFFFF,&H9A000000,&HB4000000,0,0,0,0,100,100,5,0,1,3,1.4,5,120,120,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

SUB_Y = 1312


def card_events():
    ev, srt = [], []
    for i, (s, e, text, kws) in enumerate(CARDS):
        t0, t1 = to_out(s), to_out(e)
        body = text
        for kw, kt in kws.items():
            ms = max(0, round((to_out(kt) - t0) * 1000))
            body = body.replace(kw, "{\\1c%s\\t(%d,%d,\\1c%s)}%s{\\1c%s}" % (WHITE, ms, ms + 140, ACCENT, kw, WHITE), 1)
        # weiches Einblenden mit 10 px Aufwärtsbewegung, kurzes Ausblenden
        tags = "{\\an5\\q2\\move(540,%d,540,%d,0,170)\\fad(110,80)\\blur0.6}" % (SUB_Y + 10, SUB_Y)
        ev.append(f"Dialogue: 1,{ass_time(t0)},{ass_time(t1)},Sub,,0,0,0,,{tags}{body}")
        srt.append((t0, t1, text))
    return ev, srt


def headline_events():
    ev = []
    t0, t1 = to_out(HEADLINE["start"]), to_out(HEADLINE["end"])
    for words, y, style in HEADLINE["lines"]:
        parts = []
        for w, wt in words:
            ms = max(0, round((to_out(wt) - t0) * 1000))
            # jedes Wort "fokussiert" sich beim Aussprechen: Unschärfe + Transparenz -> scharf
            parts.append("{\\alpha&HFF&\\blur9\\t(%d,%d,0.6,\\alpha&H00&\\blur0.6)}%s" % (ms, ms + 260, w))
        tags = "{\\an5\\q2\\move(540,%d,540,%d,0,700)\\fad(0,160)}" % (y + 8, y)
        ev.append(f"Dialogue: 2,{ass_time(t0)},{ass_time(t1)},{style},,0,0,0,,{tags}" + " ".join(parts))
    text = " ".join(w for line, _, _ in HEADLINE["lines"] for w, _ in line)
    return ev, [(to_out(HEADLINE["lines"][0][0][0][1]), t1, text)]


def write_subs():
    os.makedirs(BUILD, exist_ok=True)
    ev, srt = card_events()
    hev, hsrt = headline_events()
    with open(os.path.join(HERE, "untertitel_animiert.ass"), "w", encoding="utf-8") as f:
        f.write(ASS_HEADER + "\n".join(ev + hev) + "\n")
    rows = sorted(srt + hsrt)
    with open(os.path.join(OUT_DIR, "Paki_Akin_Untertitel.srt"), "w", encoding="utf-8") as f:
        for n, (a, b, t) in enumerate(rows, 1):
            f.write(f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n\n")
    return rows


# ===========================================================================
# Bild: subpixelgenaue Zooms direkt aus der Quelle (eine einzige Lanczos-Skalierung)
# ===========================================================================
def gradient_mask():
    y0, a = GRADIENT
    ys = np.arange(H, dtype=np.float32)
    u = np.clip((ys - y0) / (H - y0), 0, 1)
    m = 1.0 - a * (u * u * (3 - 2 * u))
    return m[:, None, None]


def affine(z):
    s = BASE * z
    ax, ay = ANCHOR
    ox, oy = ax * BASE, ay * BASE - CROP_TOP   # Ankerpunkt bleibt an seiner Position im Bild
    return np.float32([[s, 0, ox - s * ax], [0, s, oy - s * ay]])


def src_frames():
    cmd = ["ffmpeg", "-v", "error", "-i", SRC, "-vf",
           f"fps={FPS},scale=in_color_matrix=bt709:in_range=tv:out_color_matrix=bt709:out_range=full,format=bgr24",
           "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n, size = 0, SRC_W * SRC_H * 3
    try:
        while True:
            buf = p.stdout.read(size)
            if len(buf) < size:
                break
            yield n, np.frombuffer(buf, np.uint8).reshape(SRC_H, SRC_W, 3)
            n += 1
    finally:  # Decoder beenden, sobald alle benötigten Bilder gelesen sind
        p.kill()
        p.wait()


def frame_plan():
    """Für jedes Ausgabebild: (Quellbild-Index, Zoom)."""
    plan = []
    for (a, b), o in zip(SEGMENTS, SEG_OUT):
        fa, fb = round(a * FPS), round(b * FPS)
        for k in range(fa, fb):
            plan.append((k, zoom_at(k / FPS)))
    assert len(plan) == N_FRAMES, (len(plan), N_FRAMES)
    return plan


def render_frame(img, z, mask):
    out = cv2.warpAffine(img, affine(z), (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    return (out.astype(np.float32) * mask).astype(np.uint8)


# ===========================================================================
# Ton
# ===========================================================================
SR = 48000


def synth(kind, rng):
    if kind == "whoosh":
        n = int(0.62 * SR)
        t = np.arange(n) / SR
        noise = rng.standard_normal(n)
        # zeitvariabler Bandpass (Mitte 400 Hz -> 2.6 kHz -> 900 Hz) via Zustandsvariablenfilter
        fc = 400 + 2200 * np.sin(np.pi * np.clip(t / 0.5, 0, 1)) ** 2 + 500 * (t / t[-1])
        out, lp, bp = np.zeros(n), 0.0, 0.0
        for i in range(n):
            f = 2 * np.sin(np.pi * fc[i] / SR)
            hp = noise[i] - lp - 0.9 * bp
            bp += f * hp
            lp += f * bp
            out[i] = bp
        env = np.where(t < 0.45, (t / 0.45) ** 2.2, np.exp(-(t - 0.45) / 0.05))
        sig, peak = out * env, 0.45   # Höhepunkt bei 0.45 s = Synchronpunkt
    else:  # impact: tiefer, weicher Schlag mit kurzer Transiente – kein "Boom"
        n = int(0.9 * SR)
        t = np.arange(n) / SR
        f = 48 + 40 * np.exp(-t / 0.05)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
        click = rng.standard_normal(n) * np.exp(-t / 0.006)
        click = np.convolve(click, np.ones(12) / 12, mode="same")
        sig, peak = body + 0.35 * click, 0.0
        sig *= np.minimum(1, t / 0.002)
    sig /= np.max(np.abs(sig)) + 1e-9
    return sig, peak


def build_sfx(path):
    rng = np.random.default_rng(7)
    mix = np.zeros(int((TOTAL + 1) * SR))
    for kind, src_t, db in SFX:
        sig, peak = synth(kind, rng)
        start = int((to_out(src_t) - peak) * SR)
        sig = sig * 10 ** (db / 20)
        a = max(0, start)
        mix[a:a + len(sig) - (a - start)] += sig[a - start:][: len(mix) - a]
    mix = mix[: int(TOTAL * SR)]
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    import wave
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(stereo.tobytes())


def voice_filter():
    chains, labels = [], []
    for i, (a, b) in enumerate(SEGMENTS):
        fin = "" if i == 0 else "afade=t=in:d=0.012,"
        fout = "" if i == len(SEGMENTS) - 1 else f"afade=t=out:st={b - a - 0.012:.4f}:d=0.012"
        if i == len(SEGMENTS) - 1:
            fout = f"afade=t=out:st={b - a - 0.18:.4f}:d=0.18"
        chains.append(f"[0:a]atrim=start={a:.5f}:end={b:.5f},asetpts=PTS-STARTPTS,"
                      f"aresample={SR},{fin}{fout}[s{i}]")
        labels.append(f"[s{i}]")
    chains.append("".join(labels) + f"concat=n={len(SEGMENTS)}:v=0:a=1,"
                  "highpass=f=70,acompressor=threshold=-24dB:ratio=2.2:attack=12:release=180:makeup=1[v]")
    return ";".join(chains)


def build_voice(path):
    fc = voice_filter()
    pre = os.path.join(BUILD, "voice_pre.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", fc, "-map", "[v]",
                    "-ac", "2", "-c:a", "pcm_s24le", pre], check=True)
    # zweistufige Lautheitsnormalisierung auf TikTok-üblich -14 LUFS / -1.5 dBTP
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:"
          f"offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"{ln},aresample={SR}",
                    "-c:a", "pcm_s24le", path], check=True)


# ===========================================================================
# Render
# ===========================================================================
def video_filter():
    ass = os.path.join(HERE, "untertitel_animiert.ass")
    return (f"{GRADE},ass='{ass}':fontsdir='{FONTS}',"
            "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p")


def render(out_path):
    os.makedirs(BUILD, exist_ok=True)
    write_subs()
    voice, sfx = os.path.join(BUILD, "voice.wav"), os.path.join(BUILD, "sfx.wav")
    print("Ton …", flush=True)
    build_voice(voice)
    build_sfx(sfx)
    print(f"Bild … {N_FRAMES} Frames, {TOTAL:.2f} s", flush=True)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", voice, "-i", sfx,
         "-filter_complex", f"[0:v]{video_filter()}[vo];"
                            "[1:a][2:a]amix=inputs=2:normalize=0:duration=first,"
                            "alimiter=limit=0.89:level=false[ao]",
         "-map", "[vo]", "-map", "[ao]", *X264, "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-movflags", "+faststart",
         "-metadata", "title=Paki Akin – TikTok Edit", out_path],
        stdin=subprocess.PIPE)
    plan, mask = frame_plan(), gradient_mask()
    want = {}
    for i, (k, z) in enumerate(plan):
        want.setdefault(k, []).append(i)
    frames = {}
    nxt = 0
    for n, img in src_frames():
        if n in want:
            for i in want[n]:
                frames[i] = img
        while nxt in frames:
            enc.stdin.write(render_frame(frames.pop(nxt), plan[nxt][1], mask).tobytes())
            nxt += 1
            if nxt % 150 == 0:
                print(f"  {nxt}/{N_FRAMES}", flush=True)
        if nxt >= N_FRAMES:
            break
    enc.stdin.close()
    if enc.wait() != 0 or nxt != N_FRAMES:
        sys.exit(f"Render fehlgeschlagen ({nxt}/{N_FRAMES} Frames)")
    print("fertig:", out_path)


def preview(t_out, path):
    """Einzelbild inkl. Grading + Untertitel bei Ausgabezeit t_out."""
    write_subs()
    plan, mask = frame_plan(), gradient_mask()
    i = min(int(t_out * FPS), N_FRAMES - 1)
    k, z = plan[i]
    for n, img in src_frames():
        if n == k:
            break
    raw = render_frame(img, z, mask)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                    "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-vf",
                    f"setpts=PTS+{i}/{FPS}/TB,{video_filter()}", "-frames:v", "1", path],
                   input=raw.tobytes(), check=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--subs-only", action="store_true")
    ap.add_argument("--preview", type=float)
    ap.add_argument("--out", default=os.path.join(OUT_DIR, OUT_NAME))
    args = ap.parse_args()
    if args.subs_only:
        for a, b, t in write_subs():
            print(f"{a:6.2f}-{b:6.2f}  {t}")
    elif args.preview is not None:
        preview(args.preview, os.path.join(BUILD, f"preview_{args.preview:05.2f}.png"))
    else:
        render(args.out)
