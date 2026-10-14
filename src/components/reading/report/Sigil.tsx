import type { ZodiacId } from '../../../lib/astro/zodiac';
import type { Asterism } from '../../../lib/reading/types';
import { GlyphShape } from '../../cosmos/Glyph';

interface SigilProps {
  sign: ZodiacId;
  asterism: Asterism;
  className?: string;
}

/** The visitor's personal emblem: their sign at the centre of a generated asterism. */
export function Sigil({ sign, asterism, className = '' }: SigilProps) {
  const C = 200;
  const toXY = (x: number, y: number) => [60 + x * 280, 60 + y * 280] as const;
  return (
    <svg
      className={`sigil ${className}`}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Persönliches Sternbild ${asterism.name}`}
    >
      <defs>
        <radialGradient id="sigil-core">
          <stop offset="0" stopColor="#8870F7" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#8870F7" stopOpacity="0.06" />
          <stop offset="1" stopColor="#8870F7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="196" fill="url(#sigil-core)" />
      <g className="sigil__rings">
        <circle cx={C} cy={C} r="194" />
        <circle cx={C} cy={C} r="176" strokeDasharray="1 5" />
        <circle cx={C} cy={C} r="64" />
      </g>
      <g className="sigil__ticks">
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const r1 = i % 9 === 0 ? 180 : 186;
          return (
            <line
              key={i}
              x1={C + r1 * Math.cos(a)}
              y1={C + r1 * Math.sin(a)}
              x2={C + 194 * Math.cos(a)}
              y2={C + 194 * Math.sin(a)}
            />
          );
        })}
      </g>
      <g className="sigil__asterism">
        {asterism.lines.map(([a, b], i) => {
          const [x1, y1] = toXY(asterism.stars[a].x, asterism.stars[a].y);
          const [x2, y2] = toXY(asterism.stars[b].x, asterism.stars[b].y);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              pathLength={1}
              style={{ animationDelay: `${0.3 + i * 0.18}s` }}
            />
          );
        })}
        {asterism.stars.map((star, i) => {
          const [x, y] = toXY(star.x, star.y);
          return (
            <g
              key={i}
              transform={`translate(${x} ${y})`}
              className="sigil__star"
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
            >
              <circle r={2 + star.magnitude * 2.4} />
              {star.magnitude === 1 && <path d="M0-12Q.8-.8 12 0 .8.8 0 12-.8.8-12 0-.8-.8 0-12Z" />}
            </g>
          );
        })}
      </g>
      <g transform={`translate(${C - 24} ${C - 24}) scale(2)`} className="sigil__glyph">
        <GlyphShape id={sign} strokeWidth={0.9} />
      </g>
    </svg>
  );
}
