import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatLongDate } from '../wizard/format';
import { getSign, ZODIAC } from '../../../lib/astro/zodiac';
import { generateCosmicReading, InvalidReadingInputError } from '../../../lib/reading';
import type { CosmicReading, ReadingInput } from '../../../lib/reading/types';
import { AstraMark } from '../../brand/AstraLogo';
import { Glyph, GlyphShape } from '../../cosmos/Glyph';
import { setStarfieldBoost } from '../../cosmos/Starfield';
import './GenerationSequence.css';

const MESSAGES = [
  'Mapping your celestial coordinates…',
  'Interpreting your astrological profile…',
  'Connecting your cosmic symbols…',
  'Preparing your personal reading…',
];

const DURATION = 5200;
const EXIT = 700;
const C = 250;
const PROGRESS_R = 104;
const PROGRESS_LENGTH = 2 * Math.PI * PROGRESS_R;

const FIGURE = [
  [250, 178],
  [296, 204],
  [312, 258],
  [270, 300],
  [214, 286],
  [196, 232],
  [236, 236],
];

interface GenerationSequenceProps {
  input: ReadingInput;
  reducedMotion: boolean;
  onComplete: (reading: CosmicReading) => void;
  onError: (message: string) => void;
}

function describeError(error: unknown): string {
  if (error instanceof InvalidReadingInputError) return 'Some details were incomplete.';
  if (error instanceof Error && error.message) return error.message;
  return 'Something unexpected happened.';
}

export function GenerationSequence({ input, reducedMotion, onComplete, onError }: GenerationSequenceProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<'running' | 'resolved' | 'leaving'>('running');
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const skipRef = useRef(false);
  const callbacks = useRef({ onComplete, onError });
  useEffect(() => {
    callbacks.current = { onComplete, onError };
  });

  const sign = getSign(input.sign);

  useEffect(() => {
    const controller = new AbortController();
    let result: CosmicReading | null = null;
    let failure: string | null = null;
    let frame = 0;
    let exitTimer = 0;
    let finished = false;
    const started = performance.now();

    // Dim everything else and keep keyboard focus inside the sequence.
    const appRoot = document.getElementById('root');
    document.body.classList.add('is-locked', 'is-generating');
    if (appRoot) appRoot.inert = true;
    rootRef.current?.focus();
    setStarfieldBoost(reducedMotion ? 0 : 0.85);

    generateCosmicReading(input, { signal: controller.signal })
      .then((reading) => {
        result = reading;
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) failure = describeError(error);
      });

    const tick = (now: number) => {
      if (finished) return;
      if (failure) {
        finished = true;
        callbacks.current.onError(failure);
        return;
      }
      const raw = skipRef.current ? 1 : (now - started) / DURATION;
      // Hold just before the end until the reading has actually arrived.
      const progress = Math.min(raw, result ? 1 : 0.96);
      const eased = 1 - Math.pow(1 - progress, 1.6);
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (percentRef.current) percentRef.current.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(PROGRESS_LENGTH * (1 - eased));
      setMessageIndex(Math.min(MESSAGES.length - 1, Math.floor(progress * MESSAGES.length)));
      if (progress > 0.8) setPhase((p) => (p === 'running' ? 'resolved' : p));

      if (progress >= 1 && result) {
        finished = true;
        const reading = result;
        setPhase('leaving');
        setStarfieldBoost(0);
        exitTimer = window.setTimeout(() => callbacks.current.onComplete(reading), reducedMotion ? 0 : EXIT);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      finished = true;
      controller.abort();
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      setStarfieldBoost(0);
      document.body.classList.remove('is-locked', 'is-generating');
      if (appRoot) appRoot.inert = false;
    };
    // The sequence runs once per mount; the inputs are frozen while it plays.
  }, []);

  const coordinates = [
    formatLongDate(input.birthDate),
    input.birthTimeUnknown ? 'Hour unknown' : input.birthTime,
    input.birthplace.trim(),
  ].join(' · ');

  return createPortal(
    <div
      ref={rootRef}
      className={`genesis is-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="genesis-title"
      aria-describedby="genesis-message"
      tabIndex={-1}
    >
      <div className="genesis__veil" aria-hidden="true" />
      <h2 id="genesis-title" className="sr-only">
        Preparing your cosmic reading
      </h2>

      <div className="genesis__stage" aria-hidden="true">
        <svg className="genesis__ring genesis__ring--ticks" viewBox="0 0 500 500">
          <circle cx={C} cy={C} r="238" />
          {Array.from({ length: 120 }, (_, i) => {
            const a = (i * 3 * Math.PI) / 180;
            const long = i % 10 === 0;
            const r1 = long ? 222 : 231;
            return (
              <line
                key={i}
                x1={C + r1 * Math.cos(a)}
                y1={C + r1 * Math.sin(a)}
                x2={C + 238 * Math.cos(a)}
                y2={C + 238 * Math.sin(a)}
                className={long ? 'is-long' : undefined}
              />
            );
          })}
        </svg>

        <svg className="genesis__ring genesis__ring--glyphs" viewBox="0 0 500 500">
          <circle cx={C} cy={C} r="172" className="genesis__faint" />
          {ZODIAC.map((s) => {
            const angle = s.index * 30 - 90;
            const a = (angle * Math.PI) / 180;
            return (
              <g
                key={s.id}
                transform={`translate(${C + 196 * Math.cos(a)} ${C + 196 * Math.sin(a)}) rotate(${angle + 90}) translate(-9 -9) scale(0.75)`}
                className={s.id === sign.id ? 'genesis__glyph is-own' : 'genesis__glyph'}
              >
                <GlyphShape id={s.id} strokeWidth={1.4} />
              </g>
            );
          })}
        </svg>

        <svg className="genesis__ring genesis__ring--orbit" viewBox="0 0 500 500">
          <circle cx={C} cy={C} r="140" className="genesis__dashed" />
          <circle cx={C} cy={C - 140} r="4" className="genesis__satellite" />
        </svg>

        <svg className="genesis__core" viewBox="0 0 500 500">
          <circle cx={C} cy={C} r={PROGRESS_R} className="genesis__track" />
          <circle
            ref={arcRef}
            cx={C}
            cy={C}
            r={PROGRESS_R}
            className="genesis__progress-arc"
            strokeDasharray={PROGRESS_LENGTH}
            strokeDashoffset={PROGRESS_LENGTH}
            transform={`rotate(-90 ${C} ${C})`}
          />
          <polyline className="genesis__figure" points={FIGURE.map(([x, y]) => `${x},${y}`).join(' ')} pathLength={1} />
          {FIGURE.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.6"
              className="genesis__figure-star"
              style={{ animationDelay: `${0.4 + i * 0.45}s` }}
            />
          ))}
        </svg>

        <div className="genesis__center">
          <span className="genesis__mark">
            <AstraMark size={56} />
          </span>
          <span className="genesis__own">
            <Glyph id={sign.id} size={58} strokeWidth={1} />
          </span>
        </div>
      </div>

      <div className="genesis__copy">
        <p className="label genesis__step">
          {String(messageIndex + 1).padStart(2, '0')} <span className="muted">/ 04</span>
        </p>
        <p id="genesis-message" className="genesis__message" aria-live="polite" key={messageIndex}>
          {MESSAGES[messageIndex]}
        </p>
        <div className="genesis__bar">
          <span ref={barRef} className="genesis__bar-fill" />
        </div>
        <p className="genesis__meta label">
          <span ref={percentRef}>000</span>% <span className="genesis__sep">·</span> {coordinates}
        </p>
      </div>

      <div className="genesis__foot">
        <p className="genesis__note">
          Visual sequence · symbolic demo reading · no DNA analysis · computed in your browser
        </p>
        <button
          type="button"
          className="btn btn--text genesis__skip"
          onClick={() => {
            skipRef.current = true;
          }}
        >
          Skip animation
        </button>
      </div>
    </div>,
    document.body,
  );
}
