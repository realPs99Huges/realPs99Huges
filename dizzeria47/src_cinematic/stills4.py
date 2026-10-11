import sys, time, os
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenes4 as scenes

times = [float(x) for x in sys.argv[2].split(',')]
out = sys.argv[1]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 360
ims = []
for t in times:
    t0 = time.time()
    img = scenes.render(t, int(t * 60))
    dt = time.time() - t0
    im = (img * 255).astype(np.uint8)
    im = cv2.cvtColor(im, cv2.COLOR_RGB2BGR)
    im = cv2.resize(im, (w, int(w * 16 / 9)), interpolation=cv2.INTER_AREA)
    cv2.putText(im, f'{t:.2f}s {dt*1000:.0f}ms', (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
    ims.append(im)
cols = min(len(ims), 5)
rows = [np.hstack(ims[k:k + cols] + [np.zeros_like(ims[0])] * (cols - len(ims[k:k + cols])))
        for k in range(0, len(ims), cols)]
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
