import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { momentFromDate, sunPosition } from '../../lib/astro/sky';
import { ELEMENTS, formatSignRange, MODALITIES, PLANETS, ZODIAC, type ZodiacId } from '../../lib/astro/zodiac';
import { Glyph } from '../cosmos/Glyph';
import './ZodiacAtlas.css';

export function ZodiacAtlas() {
  const todaySign = useMemo(() => sunPosition(momentFromDate(new Date())).sign.id, []);
  const [selected, setSelected] = useState<ZodiacId>(todaySign);
  const [needle, setNeedle] = useState(() => (ZODIAC.find((s) => s.id === todaySign)?.index ?? 0) * 30);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sign = ZODIAC.find((s) => s.id === selected) ?? ZODIAC[0];

  const select = (index: number, focus = false) => {
    const next = ZODIAC[(index + 12) % 12];
    setSelected(next.id);
    // Keep the needle travelling the short way round.
    setNeedle((current) => {
      let delta = next.index * 30 - (((current % 360) + 360) % 360);
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      return current + delta;
    });
    if (focus) tabRefs.current[next.index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key in keys) {
      event.preventDefault();
      select(index + keys[event.key], true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(11, true);
    }
  };

  const ruler = PLANETS[sign.ruler];

  return (
    <div className="atlas">
      <div className="atlas__wheel">
        <svg className="atlas__rings" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="196" />
          <circle cx="200" cy="200" r="150" className="atlas__ring-faint" />
          <circle cx="200" cy="200" r="104" className="atlas__ring-dashed" />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * 5 * Math.PI) / 180;
            const long = i % 6 === 3;
            const r1 = long ? 186 : 191;
            return (
              <line
                key={i}
                x1={200 + r1 * Math.cos(a)}
                y1={200 + r1 * Math.sin(a)}
                x2={200 + 196 * Math.cos(a)}
                y2={200 + 196 * Math.sin(a)}
                className={long ? 'atlas__tick atlas__tick--long' : 'atlas__tick'}
              />
            );
          })}
        </svg>
        <div className="atlas__needle" style={{ transform: `rotate(${needle}deg)` }} aria-hidden="true">
          <span />
        </div>

        <div className="atlas__center" aria-hidden="true">
          <Glyph id={sign.id} size={56} strokeWidth={1} key={sign.id} className="atlas__center-glyph" />
          <span className="label">{formatSignRange(sign)}</span>
        </div>

        <div className="atlas__signs" role="tablist" aria-label="Die zwölf Zeichen">
          {ZODIAC.map((s) => (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[s.index] = el;
              }}
              type="button"
              role="tab"
              id={`atlas-tab-${s.id}`}
              aria-selected={s.id === selected}
              aria-controls="atlas-panel"
              tabIndex={s.id === selected ? 0 : -1}
              className="atlas__sign"
              style={{ '--a': `${s.index * 30 - 90}deg` } as CSSProperties}
              onClick={() => select(s.index)}
              onKeyDown={(event) => onKeyDown(event, s.index)}
            >
              <Glyph id={s.id} size={22} strokeWidth={1.3} />
              <span className="sr-only">{s.name}</span>
              {s.id === todaySign && <span className="atlas__today" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <div
        id="atlas-panel"
        className="atlas__panel"
        role="tabpanel"
        aria-labelledby={`atlas-tab-${sign.id}`}
        aria-live="polite"
      >
        <div className="atlas__panel-inner" key={sign.id}>
          <p className="label label--gold">
            {String(sign.index + 1).padStart(2, '0')} / 12 {sign.id === todaySign && '· Hier steht heute die Sonne'}
          </p>
          <h3 className="atlas__name">
            {sign.name}
            <span className="atlas__image">{sign.image}</span>
          </h3>
          <p className="atlas__essence">{sign.essence}</p>
          <dl className="atlas__specs">
            <div>
              <dt className="label">Archetyp</dt>
              <dd>{sign.archetype}</dd>
            </div>
            <div>
              <dt className="label">Element</dt>
              <dd>{ELEMENTS[sign.element].name}</dd>
            </div>
            <div>
              <dt className="label">Qualität</dt>
              <dd>{MODALITIES[sign.modality].name}</dd>
            </div>
            <div>
              <dt className="label">Herrscher</dt>
              <dd>
                <Glyph id={sign.ruler} size={15} strokeWidth={1.4} />
                {ruler.name}
              </dd>
            </div>
          </dl>
          <ul className="atlas__keywords" aria-label="Stichworte">
            {sign.keywords.map((keyword) => (
              <li key={keyword} className="chip">
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
