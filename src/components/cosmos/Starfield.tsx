import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
  tint: 0 | 1 | 2;
  spikes: boolean;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  tint: 0 | 1 | 2;
  alpha: number;
}

const TINTS: Array<[number, number, number]> = [
  [241, 239, 234],
  [145, 184, 255],
  [216, 190, 138],
];

/** Shared control so the generation sequence can send the sky into a gentle "warp". */
const control = { boost: 0, target: 0 };

export function setStarfieldBoost(value: number) {
  control.target = Math.max(0, Math.min(1, value));
}

function makeSprite(tint: [number, number, number], size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${tint.join(',')},1)`);
  g.addColorStop(0.18, `rgba(${tint.join(',')},0.55)`);
  g.addColorStop(0.5, `rgba(${tint.join(',')},0.1)`);
  g.addColorStop(1, `rgba(${tint.join(',')},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sprites = TINTS.map((tint) => makeSprite(tint, 64));
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    let frame = 0;
    let running = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShootingStar = performance.now() + 7000 + Math.random() * 9000;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = width * height;
      const count = Math.round(Math.min(560, 70 + area * 0.00024));
      stars = Array.from({ length: count }, () => {
        const z = Math.random() ** 1.6;
        const roll = Math.random();
        return {
          x: Math.random(),
          y: Math.random(),
          z,
          r: 0.35 + z * 1.05 + (Math.random() < 0.04 ? 0.6 : 0),
          alpha: 0.25 + z * 0.65,
          speed: rand(0.4, 1.6),
          phase: rand(0, Math.PI * 2),
          tint: roll < 0.78 ? 0 : roll < 0.95 ? 1 : 2,
          spikes: false,
        };
      });
      // A few hero stars get delicate diffraction spikes.
      stars
        .filter((s) => s.z > 0.75)
        .slice(0, width < 768 ? 3 : 6)
        .forEach((s) => {
          s.spikes = true;
          s.r += 0.4;
        });

      const moteCount = width < 768 ? 12 : 26;
      motes = Array.from({ length: moteCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.8, 2.4),
        vy: rand(4, 12),
        sway: rand(6, 22),
        phase: rand(0, Math.PI * 2),
        tint: Math.random() < 0.5 ? 1 : Math.random() < 0.5 ? 2 : 0,
        alpha: rand(0.12, 0.38),
      }));
    }

    function draw(time: number, dt: number) {
      const t = time / 1000;
      ctx!.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      control.boost += (control.target - control.boost) * Math.min(1, dt * 1.6);
      const scroll = window.scrollY;
      const cx = width / 2;
      const cy = height / 2;
      const boost = control.boost;

      for (const s of stars) {
        const px = s.x * width + pointer.x * 14 * s.z;
        let py = (s.y * height - scroll * 0.06 * s.z + pointer.y * 10 * s.z) % height;
        if (py < 0) py += height;
        const twinkle = reduced.matches ? 1 : 0.62 + 0.38 * Math.sin(t * s.speed + s.phase);
        const a = s.alpha * twinkle;
        const [r, g, b] = TINTS[s.tint];

        if (boost > 0.01 && s.z > 0.35) {
          const k = 0.12 * boost * s.z;
          ctx!.strokeStyle = `rgba(${r},${g},${b},${a * 0.7 * boost})`;
          ctx!.lineWidth = s.r * 0.9;
          ctx!.beginPath();
          ctx!.moveTo(px, py);
          ctx!.lineTo(px + (px - cx) * k, py + (py - cy) * k);
          ctx!.stroke();
        }

        if (s.r > 1.05) {
          const size = s.r * 7;
          ctx!.globalAlpha = a;
          ctx!.drawImage(sprites[s.tint], px - size / 2, py - size / 2, size, size);
          ctx!.globalAlpha = 1;
        } else {
          ctx!.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx!.fillRect(px - s.r / 2, py - s.r / 2, s.r, s.r);
        }

        if (s.spikes) {
          const len = s.r * (6 + 3 * twinkle);
          ctx!.strokeStyle = `rgba(${r},${g},${b},${a * 0.45})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(px - len, py);
          ctx!.lineTo(px + len, py);
          ctx!.moveTo(px, py - len);
          ctx!.lineTo(px, py + len);
          ctx!.stroke();
        }
      }

      for (const m of motes) {
        if (!reduced.matches) {
          m.y -= m.vy * dt * (1 + boost * 3);
          if (m.y < -20) {
            m.y = height + 20;
            m.x = Math.random() * width;
          }
        }
        const x = m.x + Math.sin(t * 0.3 + m.phase) * m.sway;
        const size = m.r * 10;
        ctx!.globalAlpha = m.alpha * (0.7 + 0.3 * Math.sin(t * 0.8 + m.phase));
        ctx!.drawImage(sprites[m.tint], x - size / 2, m.y - size / 2, size, size);
      }
      ctx!.globalAlpha = 1;

      if (!reduced.matches) {
        if (!shooting && time > nextShootingStar && boost < 0.1) {
          const fromLeft = Math.random() < 0.5;
          shooting = {
            x: fromLeft ? rand(0.05, 0.45) * width : rand(0.55, 0.95) * width,
            y: rand(0.04, 0.32) * height,
            vx: (fromLeft ? 1 : -1) * rand(520, 760),
            vy: rand(160, 260),
            life: 0,
          };
          nextShootingStar = time + 11000 + Math.random() * 14000;
        }
        if (shooting) {
          shooting.life += dt;
          const progress = shooting.life / 0.95;
          const sx = shooting.x + shooting.vx * shooting.life;
          const sy = shooting.y + shooting.vy * shooting.life;
          const tail = 0.16;
          const grad = ctx!.createLinearGradient(sx, sy, sx - shooting.vx * tail, sy - shooting.vy * tail);
          const fade = Math.sin(Math.min(1, progress) * Math.PI);
          grad.addColorStop(0, `rgba(241,239,234,${0.85 * fade})`);
          grad.addColorStop(1, 'rgba(145,184,255,0)');
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.1;
          ctx!.beginPath();
          ctx!.moveTo(sx, sy);
          ctx!.lineTo(sx - shooting.vx * tail, sy - shooting.vy * tail);
          ctx!.stroke();
          if (progress >= 1) shooting = null;
        }
      }
    }

    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now, dt);
      frame = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function renderStatic() {
      draw(performance.now(), 0);
    }

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Mobile browsers fire resize when the URL bar collapses; only rebuild on real changes.
        if (Math.abs(window.innerWidth - width) < 2 && Math.abs(window.innerHeight - height) < 140) return;
        build();
        if (!running) renderStatic();
      }, 160);
    }

    function onPointer(event: PointerEvent) {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onMotionPreference() {
      if (reduced.matches) {
        stop();
        renderStatic();
      } else start();
    }

    function onScrollStatic() {
      if (!running) renderStatic();
    }

    build();
    renderStatic();
    start();

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScrollStatic, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onMotionPreference);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScrollStatic);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
