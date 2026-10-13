import type { CSSProperties } from 'react';
import type { GlyphId } from '../../lib/reading/types';
import { AstraMark } from '../brand/AstraLogo';
import { Glyph } from '../cosmos/Glyph';
import { Icon } from '../ui/Icon';
import { Hero } from './Hero';
import { ZodiacAtlas } from './ZodiacAtlas';
import './HomeView.css';

interface HomeViewProps {
  onBegin: () => void;
  onExplore: () => void;
}

const CHAPTERS: Array<{ title: string; text: string; glyph: GlyphId; access: string }> = [
  {
    title: 'Your Cosmic Identity',
    text: 'The symbolism of your Sun sign, element, modality and ruling planet — with your Sun’s exact degree.',
    glyph: 'sun',
    access: 'Free',
  },
  {
    title: 'Your Inner Universe',
    text: 'Strengths, tensions and growth themes, written as reflection prompts — never as a diagnosis.',
    glyph: 'moon',
    access: 'Free',
  },
  {
    title: 'Origins & Cultural Connections',
    text: 'Your birthplace on an abstract map, the real sky above it, and clearly labelled symbolic geography.',
    glyph: 'node',
    access: 'Free + Premium',
  },
  {
    title: 'Your Cosmic Timeline',
    text: 'The great astrological cycles of a life, placed at your ages — as chapters and questions, not predictions.',
    glyph: 'saturn',
    access: 'Free + Premium',
  },
  {
    title: 'Your Personal Reflection',
    text: 'Questions shaped by your sign and by what you would like to understand about yourself.',
    glyph: 'venus',
    access: 'Free + Premium',
  },
];

const STEPS = [
  {
    numeral: 'I',
    title: 'Share your birth moment',
    text: 'Date, time and place of birth. If you don’t know the hour, that’s fine — the reading adapts and tells you what it leaves open.',
  },
  {
    numeral: 'II',
    title: 'We map the symbolism',
    text: 'Your Sun’s degree and the Moon’s phase are calculated right in your browser, then translated through a library of astrological symbolism.',
  },
  {
    numeral: 'III',
    title: 'Receive your reading',
    text: 'Your free reading appears instantly. The extended reading can be previewed in this demo — no payment is ever processed.',
  },
];

const IS = [
  'A symbolic, astrology-based interpretation',
  'A tool for reflection and curiosity',
  'Private by design — your entries never leave your browser',
  'A design prototype with a simulated premium preview',
];

const IS_NOT = [
  'A DNA, ancestry or ethnicity analysis',
  'A scientific or psychological diagnosis',
  'A prediction of future events',
  'A real payment or subscription',
];

export function HomeView({ onBegin, onExplore }: HomeViewProps) {
  return (
    <>
      <Hero onBegin={onBegin} onExplore={onExplore} />

      <section id="discover" className="section discover" aria-labelledby="discover-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <p className="label label--gold">01 — Discover</p>
            <h2 id="discover-title" className="h2">
              A reading composed from the sky <em>you were born under.</em>
            </h2>
            <p className="lead section-head__lead">
              ASTRA translates your birth moment — date, hour and place — into a symbolic portrait. Twelve archetypes,
              four elements, the Sun’s exact degree and the Moon’s phase become a language for reflection.
            </p>
          </header>

          <div className="discover__atlas" data-reveal>
            <ZodiacAtlas />
          </div>
        </div>
      </section>

      <section className="section chapters" aria-labelledby="chapters-title">
        <div className="container chapters__grid">
          <header className="section-head chapters__head" data-reveal>
            <p className="label label--gold">02 — Inside your reading</p>
            <h2 id="chapters-title" className="h2">
              Five chapters, <em>one sky.</em>
            </h2>
            <p className="lead section-head__lead">
              Every reading is written for one birth moment. The same details always return the same reading — like a
              chart, not a horoscope of the day.
            </p>
            <button type="button" className="btn btn--ghost chapters__cta" onClick={onBegin}>
              Begin Your Reading
              <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
            </button>
          </header>

          <ol className="chapters__list">
            {CHAPTERS.map((chapter, index) => (
              <li
                key={chapter.title}
                className="chapter"
                data-reveal
                style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              >
                <span className="chapter__num label">{String(index + 1).padStart(2, '0')}</span>
                <span className="chapter__glyph" aria-hidden="true">
                  <Glyph id={chapter.glyph} size={26} strokeWidth={1.1} />
                </span>
                <div className="chapter__body">
                  <h3 className="chapter__title">{chapter.title}</h3>
                  <p className="chapter__text">{chapter.text}</p>
                </div>
                <span className={`chapter__access chip ${chapter.access === 'Free' ? '' : 'chip--gold'}`}>
                  {chapter.access}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how-it-works" className="section how" aria-labelledby="how-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <p className="label label--gold">03 — How It Works</p>
            <h2 id="how-title" className="h2">
              Three quiet steps from birth moment <em>to reading.</em>
            </h2>
          </header>

          <ol className="how__steps">
            {STEPS.map((step, index) => (
              <li
                key={step.numeral}
                className="how__step"
                data-reveal
                style={{ '--reveal-delay': `${index * 110}ms` } as CSSProperties}
              >
                <span className="how__node" aria-hidden="true" />
                <span className="how__numeral" aria-hidden="true">
                  {step.numeral}
                </span>
                <h3 className="how__title">{step.title}</h3>
                <p className="how__text">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="truth" data-reveal>
            <div className="truth__intro">
              <Icon name="shield" size={22} className="truth__icon" />
              <h3 className="h3">
                What ASTRA is — <em>and what it isn’t.</em>
              </h3>
              <p className="muted">
                Astrology is a symbolic language, not a science of ancestry or fate. We built ASTRA to be beautiful and
                honest at the same time.
              </p>
            </div>
            <div className="truth__col">
              <p className="label label--gold">ASTRA is</p>
              <ul>
                {IS.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={16} className="truth__mark truth__mark--yes" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="truth__col">
              <p className="label">ASTRA is not</p>
              <ul>
                {IS_NOT.map((item) => (
                  <li key={item}>
                    <Icon name="minus" size={16} className="truth__mark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section final" aria-labelledby="final-title">
        <div className="container final__inner" data-reveal>
          <div className="final__mark" aria-hidden="true">
            <AstraMark size={420} />
          </div>
          <p className="label label--gold">Your sky, once</p>
          <h2 id="final-title" className="final__title">
            The sky of your birth will never <em>return in quite the same way.</em>
          </h2>
          <button type="button" className="btn btn--primary" onClick={onBegin}>
            Reveal My Cosmic Profile
            <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
          </button>
        </div>
      </section>
    </>
  );
}
