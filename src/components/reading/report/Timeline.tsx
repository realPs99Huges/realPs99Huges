import type { CSSProperties } from 'react';
import type { TimelineNode } from '../../../lib/reading/types';
import { Glyph, GlyphShape } from '../../cosmos/Glyph';

function ageLabel(node: TimelineNode) {
  if (node.status === 'now') return `Jetzt · ${Math.floor(node.age)} Jahre`;
  if (node.age === 0) return `Geburt · ${node.year}`;
  return `Mit ≈ ${Math.round(node.age)} · ${node.year}`;
}

export function TimelineList({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="timeline">
      {nodes.map((node, index) => (
        <li
          key={node.id}
          className={`timeline__node is-${node.status}`}
          data-reveal
          style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}
        >
          <span className="timeline__marker" aria-hidden="true">
            <Glyph id={node.glyph} size={20} strokeWidth={1.3} />
          </span>
          <p className="timeline__meta label">{ageLabel(node)}</p>
          <h4 className="timeline__title">{node.title}</h4>
          <p className="timeline__cycle">{node.cycle}</p>
          <p className="timeline__theme">{node.theme}</p>
          <p className="timeline__question">{node.question}</p>
        </li>
      ))}
    </ol>
  );
}

type Point = { x: number; y: number };

const P0: Point = { x: 40, y: 220 };
const P1: Point = { x: 500, y: -50 };
const P2: Point = { x: 960, y: 220 };
const MAX_AGE = 88;

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function bezier(t: number): Point {
  return lerp(lerp(P0, P1, t), lerp(P1, P2, t), t);
}

/** The whole life arc as one orbit, split into lived (gold) and still-open (dashed). */
export function TimelineArc({ nodes }: { nodes: TimelineNode[] }) {
  const now = nodes.find((n) => n.status === 'now');
  const tNow = Math.min(1, (now?.age ?? 0) / MAX_AGE);
  const q0 = lerp(P0, P1, tNow);
  const split = bezier(tNow);

  return (
    <div className="timeline-arc">
      <svg
        viewBox="0 0 1000 320"
        role="img"
        aria-label="Dein Lebensbogen der astrologischen Zyklen, von der Geburt bis zur Uranus-Wiederkehr"
      >
        <path d={`M${P0.x} ${P0.y}Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} className="timeline-arc__future" />
        <path
          d={`M${P0.x} ${P0.y}Q${q0.x} ${q0.y} ${split.x} ${split.y}`}
          className="timeline-arc__past"
          pathLength={1}
        />
        {nodes.map((node, index) => {
          const point = bezier(Math.min(1, node.age / MAX_AGE));
          const above = index % 2 === 0;
          // A cycle sitting right on today's marker is listed below instead of crowding the arc.
          if (node.status !== 'now' && now && Math.abs(node.age - now.age) < 1.6 && node.age !== 0) return null;
          if (node.status === 'now') {
            return (
              <g key={node.id} transform={`translate(${point.x} ${point.y})`} className="timeline-arc__now">
                <line y1={-16} y2={98} />
                <circle r="7" />
                <circle r="14" className="timeline-arc__halo" />
                <text y={118} textAnchor="middle" className="timeline-arc__now-label">
                  DU BIST HIER · {now?.year}
                </text>
              </g>
            );
          }
          return (
            <g
              key={node.id}
              transform={`translate(${point.x} ${point.y})`}
              className={`timeline-arc__node is-${node.status}`}
            >
              <circle r="4" />
              <g transform={`translate(-9 ${above ? -46 : 22}) scale(0.75)`} className="timeline-arc__glyph">
                <GlyphShape id={node.glyph} strokeWidth={1.5} />
              </g>
              <text y={above ? -54 : 62} textAnchor="middle" className="timeline-arc__age">
                {node.age === 0 ? 'GEBURT' : `≈${Math.round(node.age)}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
