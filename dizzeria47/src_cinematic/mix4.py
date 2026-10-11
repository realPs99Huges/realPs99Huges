"""Final mix: score + quiet real ambience from shots that play near real-time speed."""
import os, sys, subprocess, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenes4 as sc
from synth import SR, hp, lp

U = '/root/.claude/uploads/65c5a26f-38b0-53b3-8ea7-4f4a5a430212'
SRCF = {'1151': 'd0bf1449-IMG_1151.mov', 'scr': 'c386c7b6-ScreenRecording_10-10-2026_13-03-22_1.mov',
        '2914': 'dff5eb1e-video-2914_singular_display.mov', '1186': '6dad00e7-IMG_1186.mov',
        '1169': 'f5d19d23-IMG_1169.mov', '1172': 'cba35c4a-IMG_1172.mov', '1146': 'a1e2f922-IMG_1146.mov',
        '1155': '2c38b3d1-IMG_1155.mov', '1150': '576045d9-IMG_1150.mov'}
OUT = os.path.join(sc.SCR, 'audio4')


def read_wav(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32768
    return x


score = read_wav(os.path.join(OUT, 'score.wav'))
N = len(score)
amb = np.zeros_like(score)
for t0, t1, clip, f0, f1, *_ in sc.SHOTS:
    if clip not in SRCF:
        continue
    fps = sc.FPS_SRC[clip]
    rate = abs(f1 - f0) / fps / (t1 - t0)
    if not (0.8 < rate < 1.25) or f1 < f0:
        continue
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{f0 / fps:.3f}', '-t', f'{(f1 - f0) / fps:.3f}',
                          '-i', os.path.join(U, SRCF[clip]), '-vn', '-ac', '2', '-ar', str(SR),
                          '-af', f'atempo={rate:.4f}', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    if len(x) < 100:
        continue
    x = np.stack([lp(hp(x[:, 0], 150), 7000), lp(hp(x[:, 1], 150), 7000)], 1)
    x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.018
    n = len(x)
    f = np.minimum(np.arange(n) / (0.08 * SR), 1) * np.minimum((n - np.arange(n)) / (0.08 * SR), 1)
    i = int(t0 * SR)
    j = min(i + n, N)
    amb[i:j] += (x * f[:, None])[:j - i]
    print(f'ambience {clip} {t0:.2f}-{t1:.2f} rate {rate:.2f}')
mix = score + amb
mix = mix / max(1.0, np.abs(mix).max() / 0.95)
with wave.open(os.path.join(OUT, 'final_mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('done')
