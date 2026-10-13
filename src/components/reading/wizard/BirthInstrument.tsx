import { useMemo, useState } from 'react';
import { formatDegree, parseTime, type SunPosition } from '../../../lib/astro/sky';
import { getSign, ZODIAC } from '../../../lib/astro/zodiac';
import { findPlace, formatCoordinates } from '../../../lib/geo/places';
import type { ReadingInput } from '../../../lib/reading/types';
import { Glyph, GlyphShape } from '../../cosmos/Glyph';
import { formatLongDate } from './format';

interface BirthInstrumentProps {
  input: ReadingInput;
  suggestion: SunPosition | null;
}

const C = 200;

/**
 * A live instrument that answers the form as it is filled in: the zodiac wheel
 * turns to the Sun's position, a hand marks the hour, the readout logs the place.
 */
export function BirthInstrument({ input, suggestion }: BirthInstrumentProps) {
  const sign = getSign(input.sign);
  const time = input.birthTimeUnknown ? null : parseTime(input.birthTime);
  const place = useMemo(() => findPlace(input.birthplace), [input.birthplace]);

  // Bring the Sun (or the chosen sign's centre) to the top, turning the short way.
  const longitude = suggestion && suggestion.sign.id === sign.id ? suggestion.longitude : sign.index * 30 + 15;
  const hasDate = !!suggestion;
  const target = hasDate ? longitude - 90 : 0;
  const [rotation, setRotation] = useState(target);
  const [lastTarget, setLastTarget] = useState(target);
  if (lastTarget !== target) {
    // Derived state from the previous render (React's documented pattern).
    const delta = ((((target - lastTarget) % 360) + 540) % 360) - 180;
    setLastTarget(target);
    setRotation(rotation + delta);
  }

  const handAngle = time ? ((time.hour + time.minute / 60 - 12) / 24) * 360 : null;

  return (
    <figure className="instrument" aria-label="Live birth chart preview">
      <svg className="instrument__dial" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="instrument-core">
            <stop offset="0" stopColor="#8870F7" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8870F7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="120" fill="url(#instrument-core)" />

        <g className="instrument__wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          <circle cx={C} cy={C} r="188" className="instrument__line" />
          <circle cx={C} cy={C} r="150" className="instrument__line" />
          {ZODIAC.map((s) => {
            // Ecliptic longitude runs counter-clockwise on a chart.
            const start = -s.index * 30;
            const mid = ((start - 15) * Math.PI) / 180;
            const edge = (start * Math.PI) / 180;
            const active = s.id === sign.id && hasDate;
            return (
              <g key={s.id} className={active ? 'instrument__sector is-active' : 'instrument__sector'}>
                <line
                  x1={C + 150 * Math.cos(edge)}
                  y1={C + 150 * Math.sin(edge)}
                  x2={C + 188 * Math.cos(edge)}
                  y2={C + 188 * Math.sin(edge)}
                  className="instrument__line"
                />
                {active && (
                  <path
                    className="instrument__arc"
                    d={`M${C + 188 * Math.cos(edge)} ${C + 188 * Math.sin(edge)}A188 188 0 0 0 ${C + 188 * Math.cos(edge - Math.PI / 6)} ${C + 188 * Math.sin(edge - Math.PI / 6)}`}
                  />
                )}
                <g
                  transform={`translate(${C + 169 * Math.cos(mid)} ${C + 169 * Math.sin(mid)}) rotate(${start - 15 + 90}) translate(-8 -8) scale(0.667)`}
                  className="instrument__glyph"
                >
                  <GlyphShape id={s.id} strokeWidth={1.6} />
                </g>
              </g>
            );
          })}
          {hasDate && (
            <g transform={`rotate(${-longitude} ${C} ${C})`}>
              <circle cx={C + 150} cy={C} r="4.5" className="instrument__sun" />
            </g>
          )}
        </g>

        {/* 24-hour ring: noon at the top, midnight at the bottom */}
        <circle cx={C} cy={C} r="108" className="instrument__line instrument__line--faint" />
        {Array.from({ length: 24 }, (_, h) => {
          const a = (((h - 12) / 24) * 360 - 90) * (Math.PI / 180);
          const r1 = h % 6 === 0 ? 98 : 103;
          return (
            <line
              key={h}
              x1={C + r1 * Math.cos(a)}
              y1={C + r1 * Math.sin(a)}
              x2={C + 108 * Math.cos(a)}
              y2={C + 108 * Math.sin(a)}
              className="instrument__tick"
            />
          );
        })}
        <text x={C} y={C - 116} className="instrument__hour">
          12
        </text>
        <text x={C} y={C + 124} className="instrument__hour">
          00
        </text>
        {handAngle !== null && (
          <g className="instrument__hand" style={{ transform: `rotate(${handAngle}deg)` }}>
            <line x1={C} y1={C} x2={C} y2={C - 92} />
            <circle cx={C} cy={C - 92} r="3" />
          </g>
        )}
        <path className="instrument__pointer" d={`M${C} 2l-6 10h12z`} />
      </svg>

      <div className="instrument__core" aria-hidden="true">
        {hasDate ? (
          <Glyph id={sign.id} size={44} strokeWidth={1.1} key={sign.id} className="instrument__core-glyph" />
        ) : (
          <span className="instrument__core-star" />
        )}
      </div>

      <figcaption className="instrument__readout">
        <dl>
          <div>
            <dt className="label">Date</dt>
            <dd>{input.birthDate && hasDate ? formatLongDate(input.birthDate) : '—'}</dd>
          </div>
          <div>
            <dt className="label">Hour</dt>
            <dd>{input.birthTimeUnknown ? 'Unknown' : time ? input.birthTime : '—'}</dd>
          </div>
          <div>
            <dt className="label">Place</dt>
            <dd>
              {input.birthplace.trim() ? input.birthplace.trim() : '—'}
              {place && <span className="instrument__coords">{formatCoordinates(place)}</span>}
            </dd>
          </div>
          <div>
            <dt className="label">Sun</dt>
            <dd>{suggestion ? `${formatDegree(suggestion.degree)} ${suggestion.sign.name}` : '—'}</dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
