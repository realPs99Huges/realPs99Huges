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
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <dl className="telemetry" aria-label="Der Himmel heute">
      <div className="telemetry__item">
        <dt className="label">Sonne heute</dt>
        <dd>
          <Glyph id={sky.sun.sign.id} size={16} strokeWidth={1.4} />
          {formatDegree(sky.sun.degree)} {sky.sun.sign.name}
        </dd>
      </div>
      <div className="telemetry__item">
        <dt className="label">Mond</dt>
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
        <dt className="label">Ortszeit</dt>
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
            <span className="label">Kosmisches Profil</span>
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Deine Geschichte</span>
            </span>
            <span className="hero__line">
              <span>
                steht <em>geschrieben</em>
              </span>
            </span>
            <span className="hero__line">
              <span>in den Sternen.</span>
            </span>
          </h1>

          <p className="hero__lead lead">
            Entdecke dein kosmisches Profil – aus der Symbolik der Astrologie, deinem Geburtsmoment und dem Himmel über
            dir.
          </p>

          <p className="hero__note">
            <Icon name="sparkle" size={14} className="hero__note-icon" />
            Eine persönliche Reise durch den Kosmos.
          </p>

          <div className="hero__ctas">
            <button type="button" className="btn btn--primary" onClick={onBegin}>
              Mein Profil entdecken
              <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={onExplore}>
              Mehr erfahren
            </button>
          </div>
        </div>
      </div>

      <div className="hero__footer container">
        <SkyTelemetry />
        <button type="button" className="hero__scroll" onClick={onExplore}>
          <span className="label">Scrollen</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
