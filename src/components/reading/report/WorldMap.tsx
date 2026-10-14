import { useMemo } from 'react';
import { LAND_MASK } from '../../../lib/geo/landMask';
import type { MapPoint } from '../../../lib/reading/types';

const CELL = 6;
const WIDTH = LAND_MASK.cols * CELL;
const HEIGHT = LAND_MASK.rows.length * CELL;

function project(lat: number, lon: number) {
  return {
    x: (lon + 180) * (CELL / LAND_MASK.step),
    y: ((LAND_MASK.latTop - lat) / LAND_MASK.step) * CELL + CELL / 2,
  };
}

function useLandPath() {
  return useMemo(() => {
    let d = '';
    LAND_MASK.rows.forEach((hex, row) => {
      for (let i = 0; i < hex.length; i++) {
        const nibble = parseInt(hex[i], 16);
        for (let bit = 0; bit < 4; bit++) {
          if (nibble & (8 >> bit)) {
            const col = i * 4 + bit;
            d += `M${col * CELL + CELL / 2} ${row * CELL + CELL / 2}h0`;
          }
        }
      }
    });
    return d;
  }, []);
}

interface WorldMapProps {
  birth: MapPoint | null;
  home: MapPoint | null;
}

export function WorldMap({ birth, home }: WorldMapProps) {
  const land = useLandPath();
  const points = [birth, home].filter((p): p is MapPoint => !!p);
  const projected = points.map((p) => ({ ...p, ...project(p.lat, p.lon) }));
  const [a, b] = projected;
  const showArc = a && b && Math.hypot(a.x - b.x, a.y - b.y) > 8;
  const arc = showArc
    ? (() => {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const lift = Math.min(120, Math.hypot(a.x - b.x, a.y - b.y) * 0.35);
        return `M${a.x} ${a.y}Q${mx} ${my - lift} ${b.x} ${b.y}`;
      })()
    : null;

  const equator = project(0, 0).y;
  const label = points.length
    ? `Weltkarte mit ${points.map((p) => `${p.role === 'birth' ? 'deinem Geburtsort' : 'deinem Wohnort'} ${p.label}`).join(' und ')}`
    : 'Weltkarte. Dein Geburtsort ist nicht im Offline-Atlas, daher ist kein Punkt markiert.';

  return (
    <figure className="worldmap">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
        <defs>
          <radialGradient id="map-pulse">
            <stop offset="0" stopColor="#D8BE8A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#D8BE8A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="worldmap__grid">
          {Array.from({ length: 11 }, (_, i) => (i + 1) * 30).map((lon) => {
            const x = (lon / 360) * WIDTH;
            return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={HEIGHT} />;
          })}
          {[60, 30, -30].map((lat) => {
            const y = project(lat, 0).y;
            return <line key={`lat${lat}`} x1={0} y1={y} x2={WIDTH} y2={y} />;
          })}
        </g>
        <line x1={0} y1={equator} x2={WIDTH} y2={equator} className="worldmap__equator" />
        <text x={WIDTH - 6} y={equator - 6} className="worldmap__caption" textAnchor="end">
          ÄQUATOR
        </text>
        <path d={land} className="worldmap__land" />

        {arc && <path d={arc} className="worldmap__arc" pathLength={1} />}

        {projected.map((p) => {
          const anchorEnd = p.x > WIDTH - 170;
          return (
            <g
              key={p.role}
              transform={`translate(${p.x} ${p.y})`}
              className={`worldmap__point worldmap__point--${p.role}`}
            >
              <circle r="26" fill="url(#map-pulse)" className="worldmap__pulse" />
              <circle r="9" className="worldmap__ring" />
              <circle r="3.6" className="worldmap__dot" />
              <text
                x={anchorEnd ? -16 : 16}
                y={-8}
                textAnchor={anchorEnd ? 'end' : 'start'}
                className="worldmap__label"
              >
                {p.label.length > 28 ? `${p.label.slice(0, 27)}…` : p.label}
              </text>
              <text
                x={anchorEnd ? -16 : 16}
                y={8}
                textAnchor={anchorEnd ? 'end' : 'start'}
                className="worldmap__coords"
              >
                {p.role === 'birth' ? 'GEBURT' : 'HEUTE'} · {p.coordinates}
                {p.precision === 'country' ? ' (ca.)' : ''}
              </text>
            </g>
          );
        })}
      </svg>
      {!birth && (
        <figcaption className="worldmap__empty">
          Dein Geburtsort ist nicht im Offline-Atlas – er erscheint mit Namen statt als Punkt.
        </figcaption>
      )}
    </figure>
  );
}
