import type { SVGProps } from 'react';
import type { GlyphId } from '../../lib/reading/types';

interface GlyphShapeData {
  d?: string;
  rings?: Array<[number, number, number]>;
  dots?: Array<[number, number, number]>;
  fill?: string;
}

/** Hand-drawn astrological glyphs on a 24×24 grid, rendered as thin strokes. */
const GLYPHS: Record<GlyphId, GlyphShapeData> = {
  aries: {
    d: 'M12 20.5V10M12 10c0-3.9-2.3-6.5-5.2-6.5-2.2 0-3.5 1.6-3.5 3.5 0 1.7 1.1 2.9 2.7 2.9M12 10c0-3.9 2.3-6.5 5.2-6.5 2.2 0 3.5 1.6 3.5 3.5 0 1.7-1.1 2.9-2.7 2.9',
  },
  taurus: { d: 'M4 3.5c1.4 3.6 4.4 6 8 6s6.6-2.4 8-6', rings: [[12, 15, 5]] },
  gemini: { d: 'M5 4c4.6 1.6 9.4 1.6 14 0M5 20c4.6-1.6 9.4-1.6 14 0M9 5.1v13.8M15 5.1v13.8' },
  cancer: {
    d: 'M7.5 6.4C11 4.3 16.6 4.6 20.3 8M16.5 17.6C13 19.7 7.4 19.4 3.7 16',
    rings: [
      [7.5, 9, 2.6],
      [16.5, 15, 2.6],
    ],
  },
  leo: {
    d: 'M9.8 15.5C10 12 8 10.3 8 7.4 8 5 9.8 3.5 12 3.5s4 1.6 4 4c0 3.2-2.6 5.4-2.6 9 0 2.4 1.4 4 3.4 4 1.5 0 2.6-.8 3.2-2',
    rings: [[7, 15.5, 2.8]],
  },
  virgo: {
    d: 'M3.5 6.5c.8-1 2-1.2 2.8-.3V18M6.3 8.4c0-2 1-3.2 2.6-3.2s2.6 1.2 2.6 3.2V18M11.5 8.4c0-2 1-3.2 2.6-3.2s2.6 1.2 2.6 3.2v7.1c0 3 1.5 5 4 5M16.7 12.5c1.6-1.8 4.3-1.4 4.3 1.2 0 2.9-2.3 4.5-4.3 4.2',
  },
  libra: {
    d: 'M3.5 19.5h17M3.5 15.5h5c-1.3-1.2-2-2.8-2-4.6 0-3.2 2.5-5.8 5.5-5.8s5.5 2.6 5.5 5.8c0 1.8-.7 3.4-2 4.6h5',
  },
  scorpio: {
    d: 'M3.5 6.5c.8-1 2-1.2 2.8-.3V18M6.3 8.4c0-2 1-3.2 2.6-3.2s2.6 1.2 2.6 3.2V18M11.5 8.4c0-2 1-3.2 2.6-3.2s2.6 1.2 2.6 3.2v8.3c0 1.7 1 2.8 2.6 2.8h2.2M19.4 17.3l2.1 2.2-2.1 2.2',
  },
  sagittarius: { d: 'M4.5 19.5l15-15M12 4.5h7.5V12M7.5 11.5l5 5' },
  capricorn: {
    d: 'M3.5 5.5c1.5-.6 2.8.4 3.4 2l2.6 10 3.2-11c.4-1.2 1.2-1.8 2.1-1.8 1 0 1.7.8 1.7 2.1V14c0-1.9 1.3-3 2.7-3 1.4 0 2.3 1.1 2.3 2.6 0 1.9-1.5 3.3-3.5 3.3-1.4 0-2.4.9-2.7 2.6',
  },
  aquarius: { d: 'M3 10l3-2.5 3 2.5 3-2.5 3 2.5 3-2.5 3 2.5M3 16.5l3-2.5 3 2.5 3-2.5 3 2.5 3-2.5 3 2.5' },
  pisces: { d: 'M6 3.5c3 3.2 3 13.8 0 17M18 3.5c-3 3.2-3 13.8 0 17M7.8 12h8.4' },
  sun: { rings: [[12, 12, 8]], dots: [[12, 12, 1.5]] },
  moon: { d: 'M14.5 4.2A8.2 8.2 0 1 0 14.5 19.8 9 9 0 0 1 14.5 4.2Z' },
  mercury: { d: 'M12 15.2v6M9 18.2h6M8.2 3.2c.8 1.9 2.2 2.9 3.8 2.9s3-1 3.8-2.9', rings: [[12, 11, 4.2]] },
  venus: { d: 'M12 14.2v7.3M8.6 18.2h6.8', rings: [[12, 9, 5.2]] },
  mars: { d: 'M14 10l6-6M15 4h5v5', rings: [[10, 14, 5.5]] },
  jupiter: {
    d: 'M4.5 15.5h13M15 4v17M5 8.5c.4-2.6 2.2-4.4 4.6-4.4 2.6 0 4.3 2 4.3 4.6 0 3.6-3.6 5.2-8.8 6.8',
  },
  saturn: {
    d: 'M7 3.5h6M10 2v13.5c0-2.8 1.8-4.7 4.4-4.7 2.4 0 3.9 1.7 3.9 3.9 0 2.6-2.3 3.8-2.3 6 0 1.1.6 1.8 1.6 1.8',
  },
  uranus: { d: 'M12 12.5V3.5M8.8 6.7 12 3.5l3.2 3.2', rings: [[12, 16.5, 4]], dots: [[12, 16.5, 1.2]] },
  neptune: { d: 'M12 3.5v18M8.5 18h7M5.5 4.5v2.5c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5V4.5' },
  pluto: { d: 'M6.5 6.5a5.5 5.5 0 0 0 11 0M12 12v9M8.5 17.5h7', rings: [[12, 6.5, 2.6]] },
  node: {
    d: 'M7.5 18V11a4.5 4.5 0 1 1 9 0v7',
    rings: [
      [7.5, 19.6, 1.6],
      [16.5, 19.6, 1.6],
    ],
  },
  chiron: { d: 'M10.5 14V3M10.5 8.5l5-5M10.5 8.5l5 4.5', rings: [[12, 17.5, 3.5]] },
  star: { d: 'M12 1Q12.8 11.2 23 12 12.8 12.8 12 23 11.2 12.8 1 12 11.2 11.2 12 1Z', fill: 'currentColor' },
};

/** The raw shape, for embedding inside another SVG. */
export function GlyphShape({ id, strokeWidth = 1.25 }: { id: GlyphId; strokeWidth?: number }) {
  const glyph = GLYPHS[id];
  return (
    <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {glyph.d && <path d={glyph.d} fill={glyph.fill ?? 'none'} stroke={glyph.fill ? 'none' : undefined} />}
      {glyph.rings?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
      {glyph.dots?.map(([cx, cy, r]) => (
        <circle key={`d-${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
      ))}
    </g>
  );
}

interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, 'id'> {
  id: GlyphId;
  size?: number | string;
  strokeWidth?: number;
  /** Accessible name; omit for decorative glyphs. */
  title?: string;
}

export function Glyph({ id, size = 24, strokeWidth = 1.25, title, ...rest }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      <GlyphShape id={id} strokeWidth={strokeWidth} />
    </svg>
  );
}
