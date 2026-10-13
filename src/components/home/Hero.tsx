import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { formatDegree, moonPhase, momentFromDate, sunPosition } from '../../lib/astro/sky';
import { CosmicSphere } from '../cosmos/CosmicSphere';
import { Glyph } from '../cosmos/Glyph';
import { Icon } from '../ui/Icon';
import './Hero.css';

interface HeroProps {
  onBegin: () => void;
  onExplore: () => void;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function SkyTelemetry() {
  const now = useClock();
  const minuteKey = Math.floor(now.getTime() / 60000);
  const sky = useMemo(() => {
    const moment = momentFromDate(new Date(minuteKey * 60000));
    return { sun: sunPosition(moment), moon: moonPhase(moment) };
  }, [minuteKey]);
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <dl className="telemetry" aria-label="Today's sky">
      <div className="telemetry__item">
        <dt className="label">Sun today</dt>
        <dd>
          <Glyph id={sky.sun.sign.id} size={16} strokeWidth={1.4} />
          {formatDegree(sky.sun.degree)} {sky.sun.sign.name}
        </dd>
      </div>
      <div className="telemetry__item">
        <dt className="label">Moon</dt>
        <dd>
          <span
            className="telemetry__moon"
            style={{ '--lit': sky.moon.illumination } as CSSProperties}
            aria-hidden="true"
          />
          {sky.moon.name} · {Math.round(sky.moon.illumination * 100)}%
        </dd>
      </div>
      <div className="telemetry__item telemetry__item--time">
        <dt className="label">Local time</dt>
        <dd>
          <time dateTime={now.toISOString()} aria-live="off">
            {time}
          </time>
        </dd>
      </div>
    </dl>
  );
}

export function Hero({ onBegin, onExplore }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__sphere">
        <CosmicSphere />
      </div>

      <div className="hero__inner container">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="label">ASTRA</span>
            <span className="hero__eyebrow-line" aria-hidden="true" />
            <span className="label">AI Origin &amp; Cosmic Profile</span>
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Your story</span>
            </span>
            <span className="hero__line">
              <span>
                is <em>written</em>
              </span>
            </span>
            <span className="hero__line">
              <span>in the stars.</span>
            </span>
          </h1>

          <p className="hero__lead lead">
            Discover your cosmic profile through the symbolism of astrology, your birth moment and the universe around
            you.
          </p>

          <p className="hero__note">
            <Icon name="sparkle" size={14} className="hero__note-icon" />A personal journey through the cosmos.
          </p>

          <div className="hero__ctas">
            <button type="button" className="btn btn--primary" onClick={onBegin}>
              Reveal My Cosmic Profile
              <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={onExplore}>
              Explore the Universe
            </button>
          </div>
        </div>
      </div>

      <div className="hero__footer container">
        <SkyTelemetry />
        <button type="button" className="hero__scroll" onClick={onExplore}>
          <span className="label">Scroll</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
