import os, sys, time, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from esrgan import upscale
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(S, 'clips', 'wa_x4'); os.makedirs(OUT, exist_ok=True)
R = [(940, 1105), (684, 762), (764, 811), (462, 503), (540, 646), (386, 450), (812, 887), (1281, 1323),
     (1140, 1199), (1205, 1280), (1324, 1440), (197, 300)]
t0 = time.time(); n = 0
for a, b in R:
    for i in range(a, b + 1):
        p = os.path.join(OUT, f'{i:04d}.jpg')
        if os.path.exists(p):
            continue
        im = cv2.imread(os.path.join(S, 'clips', 'wa', f'{i:04d}.jpg'))
        im = im[63:402] if i < 935 else im[0:390, 127:483]
        up = upscale(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
        cv2.imwrite(p, cv2.cvtColor(up, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
        n += 1
    print(f'range {a}-{b} done, {n} frames, {time.time()-t0:.0f}s', flush=True)
print('ALL DONE', flush=True)
