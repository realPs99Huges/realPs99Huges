import sys, os, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from multiprocessing import Process

FPS = 60
TOTAL = int(34.0 * FPS)
OUTDIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'render3')
os.makedirs(OUTDIR, exist_ok=True)


def work(k, a, b):
    import scenes3 as scenes
    from lib import W, H
    out = os.path.join(OUTDIR, f'seg{k}.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
           '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-maxrate', '40M', '-bufsize', '80M',
           '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p', '-g', '60',
           '-vf', 'scale=out_color_matrix=bt709:out_range=tv',
           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0 = time.time()
    for i in range(a, b):
        img = scenes.render(i / FPS, i)
        p.stdin.write((img * 255 + 0.5).astype(np.uint8).tobytes())
        if (i - a) % 60 == 0:
            print(f'[w{k}] frame {i} ({i - a}/{b - a}) {time.time() - t0:.0f}s', flush=True)
    p.stdin.close(); p.wait()
    print(f'[w{k}] done {time.time() - t0:.0f}s', flush=True)


if __name__ == '__main__':
    nw = int(sys.argv[1]) if len(sys.argv) > 1 else 4
    bounds = np.linspace(0, TOTAL, nw + 1).astype(int)
    ps = [Process(target=work, args=(k, bounds[k], bounds[k + 1])) for k in range(nw)]
    [p.start() for p in ps]
    [p.join() for p in ps]
    with open(os.path.join(OUTDIR, 'list.txt'), 'w') as f:
        for k in range(nw):
            f.write(f"file 'seg{k}.mp4'\n")
    print('all done')
