import { useMemo } from 'react';
import { ZODIAC } from '../../lib/astro/zodiac';
import { createRng } from '../../lib/reading/random';
import { GlyphShape } from './Glyph';
import './CosmicSphere.css';

const C = 400;
const R = 200;

function ticksPath(inner: number, outer: number, step: number, skipEvery?: number) {
  let d = '';
  for (let deg = 0; deg < 360; deg += step) {
    if (skipEvery && deg % skipEvery === 0) continue;
    const a = (deg * Math.PI) / 180;
    const x1 = C + inner * Math.cos(a);
    const y1 = C + inner * Math.sin(a);
    const x2 = C + outer * Math.cos(a);
    const y2 = C + outer * Math.sin(a);
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

function ellipsePath(rx: number, ry: number) {
  return `M${C - rx} ${C}A${rx} ${ry} 0 1 0 ${C + rx} ${C}A${rx} ${ry} 0 1 0 ${C - rx} ${C}`;
}

function frontArc(rx: number, ry: number) {
  return `M${C - rx} ${C}A${rx} ${ry} 0 0 0 ${C + rx} ${C}`;
}

const ORBITS = [
  { id: 'a', rx: 312, ry: 76, tilt: -17, dur: 32, body: 3.4, tone: 'gold' },
  { id: 'b', rx: 262, ry: 50, tilt: 23, dur: 21, body: 2.4, tone: 'ivory' },
] as const;

const PARALLELS = [-60, -30, 0, 30, 60];
const TILT = (18 * Math.PI) / 180;

function useSkyTexture() {
  return useMemo(() => {
    const rng = createRng(20260101);
    const dots = Array.from({ length: 80 }, () => ({
      x: rng.between(0, 400),
      y: rng.between(20, 380),
      r: rng.between(0.5, 1.7),
      o: rng.between(0.25, 0.9),
    }));
    const figures = Array.from({ length: 5 }, (_, f) => {
      const ox = 30 + f * 78 + rng.between(-10, 10);
      const oy = rng.between(90, 300);
      const points = Array.from({ length: 4 + Math.floor(rng.next() * 3) }, () => ({
        x: ox + rng.between(-40, 40),
        y: oy + rng.between(-55, 55),
      }));
      return points;
    });
    return { dots, figures };
  }, []);
}

function SkyStrip() {
  const { dots, figures } = useSkyTexture();
  const copy = (offset: number) => (
    <g transform={`translate(${offset} 0)`} key={offset}>
      {figures.map((points, i) => (
        <g key={i}>
          <polyline
            points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            className="sphere__constellation"
          />
          {points.map((p, j) => (
            <circle key={j} cx={p.x} cy={p.y} r={1.9} className="sphere__constellation-star" />
          ))}
        </g>
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#F1EFEA" opacity={d.o} />
      ))}
    </g>
  );
  return (
    <div className="sphere__sky">
      <svg className="sphere__sky-strip" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
        {copy(0)}
        {copy(400)}
      </svg>
    </div>
  );
}

export function CosmicSphere({ className = '' }: { className?: string }) {
  const longTicks = useMemo(() => ticksPath(306, 342, 30), []);
  const shortTicks = useMemo(() => ticksPath(318, 326, 5, 30), []);
  const fineTicks = useMemo(() => ticksPath(320, 323, 1, 5), []);
  const innerTicks = useMemo(() => ticksPath(252, 258, 10), []);

  return (
    <div className={`sphere ${className}`} aria-hidden="true">
      {/* A — static field: halo, light lines, reticle, star markers */}
      <svg className="sphere__layer sphere__layer--field" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="sphere-halo">
            <stop offset="0" stopColor="#8870F7" stopOpacity="0.42" />
            <stop offset="0.38" stopColor="#8870F7" stopOpacity="0.14" />
            <stop offset="0.7" stopColor="#91B8FF" stopOpacity="0.04" />
            <stop offset="1" stopColor="#91B8FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sphere-beam-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#91B8FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#91B8FF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#91B8FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sphere-beam-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D8BE8A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#D8BE8A" stopOpacity="0.4" />
            <stop offset="1" stopColor="#D8BE8A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle className="sphere__halo" cx={C} cy={C} r="400" fill="url(#sphere-halo)" />
        <g className="sphere__reticle">
          <path d={`M${C} 8V792M8 ${C}H792`} />
          <circle cx={C} cy={C} r="392" strokeDasharray="1 7" />
        </g>
        <g className="sphere__beams">
          <line x1="40" y1="660" x2="770" y2="170" stroke="url(#sphere-beam-a)" />
          <line x1="90" y1="120" x2="740" y2="720" stroke="url(#sphere-beam-b)" />
        </g>
        <g className="sphere__markers">
          <g transform="translate(176 168)">
            <path d="M-7 0H7M0-7V7" />
            <text x="12" y="-6">
              VEGA
            </text>
            <text x="12" y="7">
              18h36m · +38°47′
            </text>
          </g>
          <g transform="translate(522 676)">
            <path d="M-7 0H7M0-7V7" />
            <text x="12" y="-6">
              RIGEL
            </text>
            <text x="12" y="7">
              05h14m · −08°12′
            </text>
          </g>
        </g>
        <g className="sphere__sparkles">
          {[
            [690, 380, 1],
            [118, 300, 0.7],
            [560, 690, 0.8],
            [300, 92, 0.6],
            [728, 560, 0.5],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              className="sphere__sparkle"
              style={{ animationDelay: `${i * 1.3}s` }}
              transform={`translate(${x} ${y}) scale(${s})`}
              d="M0-9Q.7-.7 9 0 .7.7 0 9-.7.7-9 0-.7-.7 0-9Z"
            />
          ))}
        </g>
      </svg>

      {/* B — slowly rotating zodiac ring */}
      <svg className="sphere__layer sphere__layer--ring" viewBox="0 0 800 800">
        <circle cx={C} cy={C} r="342" className="sphere__ring-line" />
        <circle cx={C} cy={C} r="318" className="sphere__ring-line sphere__ring-line--faint" />
        <path d={fineTicks} className="sphere__ticks sphere__ticks--fine" />
        <path d={shortTicks} className="sphere__ticks" />
        <path d={longTicks} className="sphere__ticks sphere__ticks--gold" />
        {ZODIAC.map((sign, k) => {
          const angle = 180 - 30 * k - 15;
          const a = (angle * Math.PI) / 180;
          const x = C + 368 * Math.cos(a);
          const y = C + 368 * Math.sin(a);
          return (
            <g
              key={sign.id}
              className="sphere__glyph"
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle + 90}) translate(-9 -9) scale(0.75)`}
            >
              <GlyphShape id={sign.id} strokeWidth={1.4} />
            </g>
          );
        })}
      </svg>

      {/* C — counter-rotating inner ring */}
      <svg className="sphere__layer sphere__layer--inner" viewBox="0 0 800 800">
        <circle cx={C} cy={C} r="262" className="sphere__ring-line sphere__ring-line--dashed" />
        <path d={innerTicks} className="sphere__ticks sphere__ticks--fine" />
        {[0, 90, 180, 270].map((deg) => (
          <rect
            key={deg}
            x={C - 3}
            y={C - 262 - 3}
            width="6"
            height="6"
            transform={`rotate(${deg + 45} ${C} ${C}) rotate(45 ${C} ${C - 262})`}
            className="sphere__diamond"
          />
        ))}
      </svg>

      {/* D1 — orbit backs and the body of the sphere */}
      <svg className="sphere__layer sphere__layer--core" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="sphere-fill" cx="0.36" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#2c2c68" />
            <stop offset="0.38" stopColor="#171b3d" />
            <stop offset="0.75" stopColor="#0c0e1d" />
            <stop offset="1" stopColor="#080910" />
          </radialGradient>
        </defs>
        {ORBITS.map((o) => (
          <g key={o.id} transform={`rotate(${o.tilt} ${C} ${C})`}>
            <path d={ellipsePath(o.rx, o.ry)} className="sphere__orbit sphere__orbit--back" />
          </g>
        ))}
        <circle cx={C} cy={C} r={R} fill="url(#sphere-fill)" />
      </svg>

      {/* E — drifting star map on the sphere's surface */}
      <SkyStrip />

      {/* D2 — graticule, shading, rim light, front orbits and bodies */}
      <svg className="sphere__layer sphere__layer--surface" viewBox="0 0 800 800">
        <defs>
          <clipPath id="sphere-clip">
            <circle cx={C} cy={C} r={R} />
          </clipPath>
          <radialGradient id="sphere-shade" cx="0.34" cy="0.28" r="0.9">
            <stop offset="0" stopColor="#080910" stopOpacity="0" />
            <stop offset="0.55" stopColor="#080910" stopOpacity="0.18" />
            <stop offset="1" stopColor="#080910" stopOpacity="0.92" />
          </radialGradient>
          <radialGradient id="sphere-atmo">
            <stop offset="0.9" stopColor="#8870F7" stopOpacity="0" />
            <stop offset="0.955" stopColor="#8870F7" stopOpacity="0.28" />
            <stop offset="1" stopColor="#91B8FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sphere-rim" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
            <stop offset="0" stopColor="#BFD3FF" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#8870F7" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#8870F7" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sphere-body-glow">
            <stop offset="0" stopColor="#D8BE8A" stopOpacity="0.9" />
            <stop offset="1" stopColor="#D8BE8A" stopOpacity="0" />
          </radialGradient>
          {ORBITS.map((o) => (
            <mask
              id={`sphere-behind-${o.id}`}
              key={o.id}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="800"
              height="800"
            >
              <rect width="800" height="800" fill="#fff" />
              <path d={`M${C - R} ${C}A${R} ${R} 0 0 1 ${C + R} ${C}Z`} fill="#000" />
            </mask>
          ))}
        </defs>

        <g clipPath="url(#sphere-clip)">
          {PARALLELS.map((lat) => {
            const phi = (lat * Math.PI) / 180;
            const rx = R * Math.cos(phi);
            return (
              <ellipse
                key={lat}
                cx={C}
                cy={C - R * Math.sin(phi) * Math.cos(TILT)}
                rx={rx}
                ry={rx * Math.sin(TILT)}
                className={lat === 0 ? 'sphere__grid sphere__grid--equator' : 'sphere__grid'}
              />
            );
          })}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse
              key={i}
              cx={C}
              cy={C}
              rx={R}
              ry={R}
              className="sphere__grid sphere__meridian"
              style={{ animationDelay: `${(-i * 20) / 6}s` }}
            />
          ))}
          <circle cx={C} cy={C} r={R} fill="url(#sphere-shade)" />
        </g>
        <circle cx={C} cy={C} r={R * 1.07} fill="url(#sphere-atmo)" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="url(#sphere-rim)" strokeWidth="1.6" />

        {ORBITS.map((o) => (
          <g key={o.id} transform={`rotate(${o.tilt} ${C} ${C})`}>
            <path d={frontArc(o.rx, o.ry)} className={`sphere__orbit sphere__orbit--front sphere__orbit--${o.tone}`} />
            <g mask={`url(#sphere-behind-${o.id})`}>
              <g className="sphere__body">
                <circle r={o.body * 4} fill="url(#sphere-body-glow)" opacity={o.tone === 'gold' ? 0.9 : 0.4} />
                <circle r={o.body} className={`sphere__body-core sphere__body-core--${o.tone}`} />
                <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipsePath(o.rx, o.ry)} />
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
