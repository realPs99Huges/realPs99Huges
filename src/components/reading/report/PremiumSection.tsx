import { useEffect, useRef, type CSSProperties } from 'react';
import type { PremiumState } from '../../../app/useReadingSession';
import type { CosmicReading, GlyphId, Insight } from '../../../lib/reading/types';
import { Glyph } from '../../cosmos/Glyph';
import { Icon } from '../../ui/Icon';
import { Sigil } from './Sigil';
import { TimelineArc, TimelineList } from './Timeline';

const LOCKED_ITEMS = [
  {
    title: 'Extended Cosmic Profile',
    text: 'Your decan, opposite-sign axis, ruling planet, the house of your Sun and your birth Moon.',
  },
  {
    title: 'Detailed Symbolic Origin Reading',
    text: 'The real sky above your birthplace, the cultural story of your constellation and symbolic geography.',
  },
  { title: 'Extended Visual Timeline', text: 'Every great astrological cycle of a life, placed on your personal arc.' },
  { title: 'Extended Personal Reflection', text: 'A seven-night practice, beginning on the weekday you were born.' },
  {
    title: 'Complete Cosmic Report',
    text: 'Your cosmic signature, symbols, personal asterism and mantra — in one report.',
  },
];

const INCLUDED = [
  'Extended Cosmic Profile',
  'Detailed Symbolic Origin Reading',
  'Extended Personal Reflection',
  'Complete Cosmic Report',
  'Extended visual timeline',
];

function InsightCard({ item, index }: { item: Insight; index: number }) {
  return (
    <article className="insight" data-reveal style={{ '--reveal-delay': `${(index % 2) * 90}ms` } as CSSProperties}>
      {item.tag && <p className="insight__tag label">{item.tag}</p>}
      <h4 className="insight__title">{item.title}</h4>
      <p className="insight__body">{item.body}</p>
    </article>
  );
}

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <span className="skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="skeleton__line" style={{ width: `${92 - i * 17}%` }} />
      ))}
    </span>
  );
}

interface PremiumSectionProps {
  reading: CosmicReading;
  premium: PremiumState;
  onRequestUnlock: () => void;
  onDownload: () => void;
}

export function PremiumSection({ reading, premium, onRequestUnlock, onDownload }: PremiumSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previous = useRef(premium);
  const p = reading.premium;

  useEffect(() => {
    if (previous.current !== 'unlocked' && premium === 'unlocked') headingRef.current?.focus({ preventScroll: true });
    previous.current = premium;
  }, [premium]);

  return (
    <section id="premium" className="premium" aria-labelledby="premium-title">
      <header className="premium__head container" data-reveal>
        <p className="label label--gold">Premium · Extended reading</p>
        <h2 id="premium-title" ref={headingRef} tabIndex={-1} className="premium__title">
          {premium === 'unlocked' ? (
            <>
              Your deeper reading, <em>revealed.</em>
            </>
          ) : (
            <>
              Your deeper reading <em>awaits.</em>
            </>
          )}
        </h2>
      </header>

      {premium !== 'unlocked' ? (
        <div className="container premium__locked">
          <ul className="locked-list" aria-label="Included in the extended reading">
            {LOCKED_ITEMS.map((item, index) => (
              <li
                key={item.title}
                className="locked-item"
                data-reveal
                style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              >
                <span className="locked-item__icon" aria-hidden="true">
                  <Icon name="lock" size={16} />
                </span>
                <div className="locked-item__body">
                  <h3 className="locked-item__title">{item.title}</h3>
                  <p className="locked-item__text">{item.text}</p>
                  <SkeletonLines count={index % 2 ? 2 : 3} />
                </div>
              </li>
            ))}
          </ul>

          <div className="paywall" data-reveal>
            <span className="paywall__corner paywall__corner--tl" aria-hidden="true" />
            <span className="paywall__corner paywall__corner--br" aria-hidden="true" />
            {premium === 'preparing' ? (
              <div className="paywall__preparing" role="status">
                <span className="paywall__spinner" aria-hidden="true" />
                <p className="paywall__heading">Preparing your extended reading…</p>
                <SkeletonLines count={4} />
              </div>
            ) : (
              <>
                <div className="paywall__lock" aria-hidden="true">
                  <span className="paywall__lock-ring" />
                  <Icon name="lock" size={26} strokeWidth={1.2} />
                </div>
                <p className="chip chip--gold paywall__demo">
                  <span className="chip__dot" aria-hidden="true" />
                  Demo · no real payment
                </p>
                <p className="paywall__heading">Go beyond the surface.</p>
                <p className="paywall__text">Explore the extended interpretation of your personal cosmic profile.</p>
                <ul className="paywall__list">
                  {INCLUDED.map((item) => (
                    <li key={item}>
                      <Icon name="check" size={15} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="paywall__price">
                  <span className="paywall__amount">€9.99</span>
                  <span className="paywall__per">— Full Reading</span>
                </div>
                <p className="paywall__fine">Example price for this prototype. Nothing is charged.</p>
                <button type="button" className="btn btn--gold paywall__cta" onClick={onRequestUnlock}>
                  <Icon name="unlock" className="btn__icon" />
                  Unlock Full Reading
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="premium__content">
          <div className="container">
            <p className="premium__banner" role="status">
              <Icon name="sparkle" size={16} />
              Premium preview unlocked in demo mode — no payment was processed.
            </p>
          </div>

          <div className="report-section container" id="extended-profile">
            <div className="report-section__head">
              <span className="report-section__num">P1</span>
              <h3 className="report-section__title">
                Extended Cosmic <em>Profile</em>
              </h3>
            </div>
            <div className="report-section__body">
              <p className="report-section__intro">{p.extendedProfile.intro}</p>
              <div className="insight-grid">
                {p.extendedProfile.sections.map((item, index) => (
                  <InsightCard key={item.title} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>

          <div className="report-section container" id="origin-reading">
            <div className="report-section__head">
              <span className="report-section__num">P2</span>
              <h3 className="report-section__title">
                Detailed Symbolic <em>Origin Reading</em>
              </h3>
            </div>
            <div className="report-section__body">
              <p className="report-section__intro">{p.originReading.intro}</p>
              <div className="insight-grid">
                {p.originReading.sky.map((item, index) => (
                  <InsightCard key={item.title} item={item} index={index} />
                ))}
                <InsightCard item={p.originReading.lore} index={1} />
                <InsightCard item={p.originReading.landscapes} index={0} />
                {p.originReading.journey && <InsightCard item={p.originReading.journey} index={1} />}
              </div>
              <div className="family-prompts" data-reveal>
                <p className="label label--gold">If you want to know where your family comes from</p>
                <ul>
                  {p.originReading.familyPrompts.map((prompt) => (
                    <li key={prompt}>{prompt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="report-section container" id="full-timeline">
            <div className="report-section__head">
              <span className="report-section__num">P3</span>
              <h3 className="report-section__title">
                Extended Cosmic <em>Timeline</em>
              </h3>
            </div>
            <div className="report-section__body">
              <p className="report-section__intro">{p.fullTimeline.intro}</p>
              <TimelineArc nodes={p.fullTimeline.nodes} />
              <TimelineList nodes={p.fullTimeline.nodes} />
            </div>
          </div>

          <div className="report-section container" id="extended-reflection">
            <div className="report-section__head">
              <span className="report-section__num">P4</span>
              <h3 className="report-section__title">
                Extended Personal <em>Reflection</em>
              </h3>
            </div>
            <div className="report-section__body">
              <p className="report-section__intro">{p.extendedReflection.intro}</p>
              <ol className="nights">
                {p.extendedReflection.nights.map((night, index) => (
                  <li
                    key={night.day}
                    className="night"
                    data-reveal
                    style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
                  >
                    <span className="night__index label">Night {index + 1}</span>
                    <span className="night__day">
                      <Glyph id={night.planet.toLowerCase() as GlyphId} size={18} strokeWidth={1.3} />
                      {night.day}
                      <span className="muted"> · {night.planet}</span>
                    </span>
                    <p className="night__prompt">{night.prompt}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="report-section container" id="complete-report">
            <div className="report-section__head">
              <span className="report-section__num">P5</span>
              <h3 className="report-section__title">
                Complete Cosmic <em>Report</em>
              </h3>
            </div>
            <div className="report-section__body">
              <div className="signature" data-reveal>
                <div className="signature__art">
                  <Sigil sign={reading.sign} asterism={reading.asterism} />
                  <p className="label">{reading.asterism.name}</p>
                  <p className="signature__translation">{reading.asterism.translation}</p>
                </div>
                <div className="signature__text">
                  {p.signature.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <dl className="symbols">
                {p.signature.symbols.map((symbol) => (
                  <div key={symbol.label} className="symbols__item" data-reveal>
                    <dt className="label">{symbol.label}</dt>
                    <dd>
                      {symbol.value}
                      {symbol.note && <span className="symbols__note">{symbol.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <blockquote className="mantra" data-reveal>
                <p className="label label--gold">Your mantra</p>
                <p className="mantra__text">“{p.signature.mantra}”</p>
              </blockquote>
              <button type="button" className="btn btn--ghost" onClick={onDownload}>
                <Icon name="download" className="btn__icon" />
                Download complete report · Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
