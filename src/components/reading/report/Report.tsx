import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { PremiumState } from '../../../app/useReadingSession';
import { getSign } from '../../../lib/astro/zodiac';
import type { CosmicReading } from '../../../lib/reading/types';
import type { NoticeKind } from '../../layout/NoticeModal';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import { DemoUnlockModal } from './DemoUnlockModal';
import { PremiumSection } from './PremiumSection';
import { copyText, downloadTextFile, reportText, summaryText } from './reportText';
import { Sigil } from './Sigil';
import { TimelineList } from './Timeline';
import { WorldMap } from './WorldMap';
import './Report.css';

interface ReportProps {
  reading: CosmicReading;
  premium: PremiumState;
  reducedMotion: boolean;
  onUnlockPremium: (delay: number) => void;
  onNewReading: () => void;
  onOpenNotice: (notice: NoticeKind) => void;
}

const CHAPTERS = [
  { id: 'about', label: 'Über dich' },
  { id: 'facts', label: 'Fakten' },
  { id: 'identity', label: 'Identität' },
  { id: 'inner-universe', label: 'Inneres' },
  { id: 'origins', label: 'Herkunft' },
  { id: 'timeline', label: 'Zeitstrahl' },
  { id: 'reflection', label: 'Reflexion' },
  { id: 'premium', label: 'Premium' },
];

interface TileSectionProps {
  id: string;
  kicker: string;
  title: ReactNode;
  intro: string;
  tiles: CosmicReading['facts'];
  variant: 'about' | 'facts';
}

/** One consistent tile grid: category, short answer, one explaining sentence. */
function TileSection({ id, kicker, title, intro, tiles, variant }: TileSectionProps) {
  return (
    <section id={id} className={`facts facts--${variant} container`} aria-labelledby={`${id}-title`}>
      <div className="facts__head" data-reveal>
        <p className="label label--gold">{kicker}</p>
        <h2 id={`${id}-title`} className="facts__title">
          {title}
        </h2>
        <p className="facts__intro">{intro}</p>
      </div>
      <ul className="facts__grid">
        {tiles.map((tile, index) => (
          <li
            key={tile.label}
            className="fact"
            data-reveal
            style={{ '--reveal-delay': `${(index % 4) * 60}ms` } as CSSProperties}
          >
            <span className="fact__label">{tile.label}</span>
            <span className="fact__value">{tile.value}</span>
            {tile.note && <span className="fact__note">{tile.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Section({ id, num, title, children }: { id: string; num: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="report-section container" aria-labelledby={`${id}-title`}>
      <div className="report-section__head" data-reveal>
        <span className="report-section__num">{num}</span>
        <h2 id={`${id}-title`} className="report-section__title">
          {title}
        </h2>
        <span className="chip report-section__free">Kostenlos</span>
      </div>
      <div className="report-section__body">{children}</div>
    </section>
  );
}

export function Report({ reading, premium, reducedMotion, onUnlockPremium, onNewReading, onOpenNotice }: ReportProps) {
  const notify = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sign = getSign(reading.sign);
  const [article, noun, ...rest] = reading.title.split(' ');

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const copySummary = async () => {
    const ok = await copyText(summaryText(reading));
    notify(ok ? 'Zusammenfassung kopiert' : 'Kopieren nicht möglich – bitte Text markieren', ok ? 'success' : 'info');
  };

  const download = () => {
    const name = `astra-demo-deutung-${sign.id}${premium === 'unlocked' ? '-komplett' : ''}.txt`;
    downloadTextFile(name, reportText(reading, premium === 'unlocked'));
    notify('Demo-Bericht auf deinem Gerät erstellt');
  };

  const previewPremium = () => {
    setModalOpen(false);
    onUnlockPremium(reducedMotion ? 300 : 1100);
    requestAnimationFrame(() => {
      document
        .getElementById('premium')
        ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const { identity, innerUniverse, origins, timeline, reflection } = reading;

  return (
    <article className="report" aria-labelledby="report-title">
      <header className="report-cover container">
        <div className="report-cover__top">
          <p className="label label--gold">Dein kosmisches Profil</p>
          <button type="button" className="chip report-cover__engine" onClick={() => onOpenNotice('demo')}>
            <span className="chip__dot" aria-hidden="true" />
            Demo-Deutung
            <span className="sr-only"> – {reading.engine.label}. Hinweis öffnen.</span>
          </button>
        </div>

        <div className="report-cover__grid">
          <div className="report-cover__intro">
            <h1 id="report-title" ref={titleRef} tabIndex={-1} className="report-cover__title">
              <span className="report-cover__article">{article}</span> <em>{noun}</em> {rest.join(' ')}
            </h1>
            <p className="report-cover__subtitle">{reading.subtitle}</p>

            <dl className="plate">
              <div className="plate__item plate__item--sign">
                <dt className="label">Sternzeichen</dt>
                <dd>
                  {sign.name}
                  <span className="plate__note">{sign.image}</span>
                </dd>
              </div>
              <div className="plate__item">
                <dt className="label">Geboren</dt>
                <dd>
                  {reading.profile.birthDateLabel}
                  <span className="plate__note">{reading.profile.birthTimeLabel}</span>
                </dd>
              </div>
              <div className="plate__item">
                <dt className="label">Geburtsort</dt>
                <dd>{reading.profile.birthplace}</dd>
              </div>
              {reading.profile.facets.map((facet) => (
                <div className="plate__item" key={facet.label}>
                  <dt className="label">{facet.label}</dt>
                  <dd>
                    {facet.value}
                    {facet.note && <span className="plate__note">{facet.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="report-cover__sigil">
            <Sigil sign={reading.sign} asterism={reading.asterism} />
            <figcaption>
              <span className="label">Persönliches Sternbild</span>
              <span className="report-cover__asterism">{reading.asterism.name}</span>
            </figcaption>
          </figure>
        </div>

        <div className="summary">
          <p className="label">Kurz gesagt</p>
          <p className="summary__text">{reading.summary}</p>
          <div className="summary__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={copySummary}>
              <Icon name="copy" className="btn__icon" size={16} />
              Zusammenfassung kopieren
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={download}>
              <Icon name="download" className="btn__icon" size={16} />
              Bericht laden · Demo
            </button>
            <button type="button" className="btn btn--text btn--sm" onClick={onNewReading}>
              <Icon name="restart" className="btn__icon" size={16} />
              Neue Deutung starten
            </button>
          </div>
          <p className="summary__engine">
            <Icon name="info" size={14} />
            {reading.engine.label}. Eine symbolische Interpretation – keine KI-Ausgabe, keine DNA- oder
            Abstammungsanalyse, keine Vorhersage.
          </p>
        </div>

        <nav className="chapter-nav" aria-label="Kapitel der Deutung">
          {CHAPTERS.map((chapter, index) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className={`chapter-nav__link ${chapter.id === 'premium' ? 'is-premium' : ''}`}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(chapter.id);
              }}
            >
              <span className="chapter-nav__num">
                {chapter.id === 'premium' ? '✦' : index < 2 ? '✧' : `0${index - 1}`}
              </span>
              {chapter.label}
            </a>
          ))}
        </nav>
      </header>

      <TileSection
        id="about"
        kicker="Dein Persönlichkeitsprofil"
        title={
          <>
            Das bist <em>du</em> – auf einen Blick
          </>
        }
        intro="Zwölf Antworten über dich – kurz, klar und aus deinem Geburtsmoment abgeleitet. Sieh sie als Spiegel, nicht als Urteil."
        tiles={reading.selfProfile}
        variant="about"
      />

      <TileSection
        id="facts"
        kicker="Berechnet aus deinem Geburtsmoment"
        title={
          <>
            Fakten zu deiner <em>Geburt</em>
          </>
        }
        intro="Echte Zahlen und Daten – astronomisch berechnet, nicht gedeutet."
        tiles={reading.facts}
        variant="facts"
      />

      <Section
        id="identity"
        num="01"
        title={
          <>
            Deine kosmische <em>Identität</em>
          </>
        }
      >
        <blockquote className="lead-quote" data-reveal>
          {identity.lead}
        </blockquote>
        <div className="prose" data-reveal>
          {identity.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {identity.note && (
          <p className="callout" data-reveal>
            <Icon name="info" size={16} />
            {identity.note}
          </p>
        )}
        <dl className="spec__grid" data-reveal>
          {identity.facets.map((facet) => (
            <div key={facet.label} className="spec__item">
              <dt className="label">{facet.label}</dt>
              <dd>{facet.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="inner-universe"
        num="02"
        title={
          <>
            Dein inneres <em>Universum</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {innerUniverse.intro}
        </p>
        <div className="traits">
          <div className="traits__group">
            <p className="label label--gold">Deine Stärken</p>
            <ol className="traits__list">
              {innerUniverse.strengths.map((item, index) => (
                <li
                  key={item.title}
                  className="trait"
                  data-reveal
                  style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}
                >
                  <span className="trait__num">{['i', 'ii', 'iii'][index]}</span>
                  <div>
                    <h3 className="trait__title">{item.title}</h3>
                    <p className="trait__body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="traits__group">
            <p className="label">Deine Spannungsfelder</p>
            <ol className="traits__list traits__list--tension">
              {innerUniverse.tensions.map((item, index) => (
                <li
                  key={item.title}
                  className="trait"
                  data-reveal
                  style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}
                >
                  <span className="trait__num trait__num--moon" aria-hidden="true" />
                  <div>
                    <h3 className="trait__title">{item.title}</h3>
                    <p className="trait__body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="growth" data-reveal>
          <p className="label label--gold">Dein Wachstumsthema</p>
          <p className="growth__title">{innerUniverse.growth.title}</p>
          <p className="growth__body">{innerUniverse.growth.body}</p>
        </div>
      </Section>

      <Section
        id="origins"
        num="03"
        title={
          <>
            Herkunft &amp; <em>Kultur</em>
          </>
        }
      >
        <div data-reveal>
          <WorldMap birth={origins.birth} home={origins.home} />
        </div>
        <p className="origins__statement" data-reveal>
          {origins.statement}
        </p>
        <div className="boundary" data-reveal>
          <Icon name="shield" size={20} />
          <div>
            <p className="boundary__title">Was dieser Abschnitt zeigen kann – und was nicht</p>
            <p className="boundary__text">{origins.boundary}</p>
          </div>
        </div>
        <div className="insight insight--wide" data-reveal>
          {origins.symbolic.tag && <p className="insight__tag label">{origins.symbolic.tag}</p>}
          <h3 className="insight__title">{origins.symbolic.title}</h3>
          <p className="insight__body">{origins.symbolic.body}</p>
        </div>
      </Section>

      <Section
        id="timeline"
        num="04"
        title={
          <>
            Dein <em>Zeitstrahl</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {timeline.intro}
        </p>
        <TimelineList nodes={timeline.nodes} />
      </Section>

      <Section
        id="reflection"
        num="05"
        title={
          <>
            Deine <em>Reflexion</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {reflection.intro}
        </p>
        {reflection.intention && (
          <blockquote className="intention" data-reveal>
            <p className="label">Deine Frage</p>
            <p className="intention__text">„{reflection.intention}“</p>
          </blockquote>
        )}
        <ol className="questions">
          {reflection.questions.map((question, index) => (
            <li
              key={question}
              className="question"
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` } as CSSProperties}
            >
              <span className="question__num">{['I', 'II', 'III'][index]}</span>
              <p className="question__text">{question}</p>
            </li>
          ))}
        </ol>
      </Section>

      <PremiumSection
        reading={reading}
        premium={premium}
        onRequestUnlock={() => setModalOpen(true)}
        onDownload={download}
      />

      <footer className="report-end container" data-reveal>
        <p className="report-end__line">
          Nimm mit, was passt. Den Rest überlass <em>den Sternen.</em>
        </p>
        <div className="report-end__actions">
          <button type="button" className="btn btn--primary" onClick={onNewReading}>
            <Icon name="restart" className="btn__icon" />
            Neue Deutung starten
          </button>
          <button type="button" className="btn btn--ghost" onClick={download}>
            <Icon name="download" className="btn__icon" />
            Bericht laden · Demo
          </button>
        </div>
        <p className="report-end__fine">
          Der Bericht ist eine Textdatei, die auf deinem Gerät erstellt wird. Nichts wird hochgeladen.
        </p>
      </footer>

      <DemoUnlockModal open={modalOpen} onPreview={previewPremium} onClose={() => setModalOpen(false)} />
    </article>
  );
}
