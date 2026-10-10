"""Extract QA material from the rendered reel: overview sheets + transition strips + full-res key frames."""
import os, subprocess, sys
import numpy as np, cv2
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = sys.argv[1]
OUT = os.path.join(S, 'qa3'); os.makedirs(OUT, exist_ok=True)


def grab(t, w=None):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', V, '-frames:v', '1', '-f', 'rawvideo',
                          '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
    im = np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3)
    if w:
        im = cv2.resize(im, (w, int(w * 16 / 9)), interpolation=cv2.INTER_AREA)
    return im.copy()


def label(im, s):
    cv2.putText(im, s, (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return im


def sheet(times, name, w=270, cols=8):
    ims = [label(grab(t, w), f'{t:.2f}s') for t in times]
    while len(ims) % cols:
        ims.append(np.zeros_like(ims[0]))
    rows = [np.hstack(ims[k:k + cols]) for k in range(0, len(ims), cols)]
    cv2.imwrite(os.path.join(OUT, name), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])


# overview: every 0.5 s
for part, (a, b) in enumerate([(0, 12), (12, 24), (24, 34)]):
    sheet(list(np.arange(a, b, 0.5)), f'overview_{part + 1}.jpg')
# transitions frame-by-frame (every 2 frames)
TR = {'hook_cuts': (0.95, 2.1), 'boom': (3.8, 4.5), 'swap_1_2': (5.8, 6.4), 'grow_oven': (9.85, 10.5),
      'shrink_oven': (11.6, 12.4), 'mosaic_in': (15.8, 16.6), 'last_slice': (21.9, 23.0), 'end_in': (27.9, 29.0)}
for k, (a, b) in TR.items():
    sheet(list(np.arange(a, b, 2 / 60)), f'trans_{k}.jpg', w=200, cols=10)
# full-res key frames
for t in (1.6, 3.0, 5.5, 7.5, 9.5, 11.5, 13.5, 15.5, 18.5, 21.0, 23.5, 26.5, 31.5, 33.8):
    cv2.imwrite(os.path.join(OUT, f'key_{t:05.2f}.jpg'), grab(t), [cv2.IMWRITE_JPEG_QUALITY, 88])
print('\n'.join(sorted(os.listdir(OUT))))
