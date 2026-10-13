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
  { id: 'identity', label: 'Identity' },
  { id: 'inner-universe', label: 'Inner Universe' },
  { id: 'origins', label: 'Origins' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'premium', label: 'Premium' },
];

function Section({ id, num, title, children }: { id: string; num: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="report-section container" aria-labelledby={`${id}-title`}>
      <div className="report-section__head" data-reveal>
        <span className="report-section__num">{num}</span>
        <h2 id={`${id}-title`} className="report-section__title">
          {title}
        </h2>
        <span className="chip report-section__free">Free reading</span>
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
  const words = reading.title.split(' ');
  const [article, adjective, ...rest] = words;

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const copySummary = async () => {
    const ok = await copyText(summaryText(reading));
    notify(
      ok ? 'Summary copied to your clipboard' : 'Copy failed — please select the text manually',
      ok ? 'success' : 'info',
    );
  };

  const download = () => {
    const name = `astra-demo-reading-${sign.id}${premium === 'unlocked' ? '-full' : ''}.txt`;
    downloadTextFile(name, reportText(reading, premium === 'unlocked'));
    notify('Demo report downloaded — created on your device');
  };

  const previewPremium = () => {
    setModalOpen(false);
    onUnlockPremium(reducedMotion ? 300 : 1400);
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
      {/* ——— Cover ——— */}
      <header className="report-cover container">
        <div className="report-cover__top">
          <p className="label label--gold">Your Cosmic Profile</p>
          <button type="button" className="chip report-cover__engine" onClick={() => onOpenNotice('demo')}>
            <span className="chip__dot" aria-hidden="true" />
            Demo reading
            <span className="sr-only"> — {reading.engine.label}. Open the demo notice.</span>
          </button>
        </div>

        <div className="report-cover__grid">
          <div className="report-cover__intro">
            <h1 id="report-title" ref={titleRef} tabIndex={-1} className="report-cover__title">
              <span className="report-cover__article">{article}</span> <em>{adjective}</em> {rest.join(' ')}
            </h1>
            <p className="report-cover__subtitle">{reading.subtitle}</p>

            <dl className="plate">
              <div className="plate__item plate__item--sign">
                <dt className="label">Sign</dt>
                <dd>
                  {sign.name}
                  <span className="plate__note">{sign.image}</span>
                </dd>
              </div>
              <div className="plate__item">
                <dt className="label">Born</dt>
                <dd>
                  {reading.profile.birthDateLabel}
                  <span className="plate__note">
                    {reading.profile.birthTimeLabel === 'Unknown' ? 'Hour unknown' : reading.profile.birthTimeLabel}
                  </span>
                </dd>
              </div>
              <div className="plate__item">
                <dt className="label">Birthplace</dt>
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
              <span className="label">Personal asterism</span>
              <span className="report-cover__asterism">{reading.asterism.name}</span>
            </figcaption>
          </figure>
        </div>

        <div className="summary">
          <p className="label">Summary</p>
          <p className="summary__text">{reading.summary}</p>
          <div className="summary__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={copySummary}>
              <Icon name="copy" className="btn__icon" size={16} />
              Copy summary
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={download}>
              <Icon name="download" className="btn__icon" size={16} />
              Download report · Demo
            </button>
            <button type="button" className="btn btn--text btn--sm" onClick={onNewReading}>
              <Icon name="restart" className="btn__icon" size={16} />
              Start a New Reading
            </button>
          </div>
          <p className="summary__engine">
            <Icon name="info" size={14} />
            {reading.engine.label}. A symbolic interpretation — not an AI model’s output, not a DNA or ancestry
            analysis, not a prediction.
          </p>
        </div>

        <nav className="chapter-nav" aria-label="Reading chapters">
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
              <span className="chapter-nav__num">{chapter.id === 'premium' ? '✦' : `0${index + 1}`}</span>
              {chapter.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="free-divider container" aria-hidden="true">
        <span className="label">Free reading</span>
      </div>

      {/* ——— 01 ——— */}
      <Section
        id="identity"
        num="01"
        title={
          <>
            Your Cosmic <em>Identity</em>
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
        <div className="spec" data-reveal>
          <p className="label label--gold">Sign profile</p>
          <dl className="spec__grid">
            {identity.facets.map((facet) => (
              <div key={facet.label} className="spec__item">
                <dt className="label">{facet.label}</dt>
                <dd>{facet.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ——— 02 ——— */}
      <Section
        id="inner-universe"
        num="02"
        title={
          <>
            Your Inner <em>Universe</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {innerUniverse.intro}
        </p>
        <div className="traits">
          <div className="traits__group">
            <p className="label label--gold">Where your light gathers</p>
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
            <p className="label">Where tension asks a question</p>
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
          <p className="label label--gold">Growth theme</p>
          <p className="growth__title">{innerUniverse.growth.title}</p>
          <p className="growth__body">{innerUniverse.growth.body}</p>
        </div>
      </Section>

      {/* ——— 03 ——— */}
      <Section
        id="origins"
        num="03"
        title={
          <>
            Origins &amp; Cultural <em>Connections</em>
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
            <p className="boundary__title">What this section can — and cannot — tell you</p>
            <p className="boundary__text">{origins.boundary}</p>
          </div>
        </div>
        <div className="insight insight--wide" data-reveal>
          {origins.symbolic.tag && <p className="insight__tag label">{origins.symbolic.tag}</p>}
          <h3 className="insight__title">{origins.symbolic.title}</h3>
          <p className="insight__body">{origins.symbolic.body}</p>
        </div>
      </Section>

      {/* ——— 04 ——— */}
      <Section
        id="timeline"
        num="04"
        title={
          <>
            Your Cosmic <em>Timeline</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {timeline.intro}
        </p>
        <TimelineList nodes={timeline.nodes} />
      </Section>

      {/* ——— 05 ——— */}
      <Section
        id="reflection"
        num="05"
        title={
          <>
            Your Personal <em>Reflection</em>
          </>
        }
      >
        <p className="report-section__intro" data-reveal>
          {reflection.intro}
        </p>
        {reflection.intention && (
          <blockquote className="intention" data-reveal>
            <p className="label">You asked</p>
            <p className="intention__text">“{reflection.intention}”</p>
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
          Take what resonates. Leave the rest to <em>the stars.</em>
        </p>
        <div className="report-end__actions">
          <button type="button" className="btn btn--primary" onClick={onNewReading}>
            <Icon name="restart" className="btn__icon" />
            Start a New Reading
          </button>
          <button type="button" className="btn btn--ghost" onClick={download}>
            <Icon name="download" className="btn__icon" />
            Download report · Demo
          </button>
        </div>
        <p className="report-end__fine">
          The download is a plain-text file created on your device. Nothing is uploaded.
        </p>
      </footer>

      <DemoUnlockModal open={modalOpen} onPreview={previewPremium} onClose={() => setModalOpen(false)} />
    </article>
  );
}
