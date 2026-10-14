import { useEffect } from 'react';

/**
 * App-wide ambient behaviour:
 *  - a soft light that follows the pointer (CSS vars --px / --py on <html>)
 *  - a local glow inside buttons (--gx / --gy)
 *  - scroll reveals for every element marked with [data-reveal]
 */
export function useAmbientEffects() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let pending: PointerEvent | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const event = pending;
      pending = null;
      root.style.setProperty('--px', `${event.clientX}px`);
      root.style.setProperty('--py', `${event.clientY}px`);
      root.style.setProperty('--pnx', ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty('--pny', ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.btn') : null;
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--gx', `${event.clientX - rect.left}px`);
        target.style.setProperty('--gy', `${event.clientY - rect.top}px`);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const observeAll = () => {
      document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => io.observe(el));
    };
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
