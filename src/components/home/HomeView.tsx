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
    title: 'Deine kosmischen Fakten',
    text: 'Exakter Sonnenstand, Mondphase bei Geburt, Tage auf der Erde, erlebte Vollmonde, chinesisches Tierzeichen und mehr.',
    glyph: 'sun',
    access: 'Kostenlos',
  },
  {
    title: 'Dein inneres Universum',
    text: 'Stärken, Spannungen und Wachstumsthemen – als Impulse zum Nachdenken, nie als Diagnose.',
    glyph: 'moon',
    access: 'Kostenlos',
  },
  {
    title: 'Herkunft & Kultur',
    text: 'Dein Geburtsort auf einer Weltkarte, der echte Himmel darüber und klar gekennzeichnete Symbolik.',
    glyph: 'node',
    access: 'Kostenlos + Premium',
  },
  {
    title: 'Dein Zeitstrahl',
    text: 'Die großen astrologischen Zyklen eines Lebens, passend zu deinem Alter – als Kapitel, nicht als Vorhersage.',
    glyph: 'saturn',
    access: 'Kostenlos + Premium',
  },
  {
    title: 'Deine Reflexion',
    text: 'Fragen, die zu deinem Zeichen und zu dem passen, was du über dich verstehen möchtest.',
    glyph: 'venus',
    access: 'Kostenlos + Premium',
  },
];

const STEPS = [
  {
    numeral: 'I',
    title: 'Geburtsmoment eingeben',
    text: 'Datum, Uhrzeit und Ort – einfach eintippen. Uhrzeit unbekannt? Kein Problem, die Deutung passt sich an.',
  },
  {
    numeral: 'II',
    title: 'Wir berechnen deinen Himmel',
    text: 'Sonnenstand und Mondphase werden direkt in deinem Browser berechnet und mit astrologischer Symbolik gedeutet.',
  },
  {
    numeral: 'III',
    title: 'Deutung erhalten',
    text: 'Deine kostenlose Deutung erscheint sofort. Die erweiterte Deutung kannst du in dieser Demo ansehen – ohne Zahlung.',
  },
];

const IS = [
  'Eine symbolische, astrologische Deutung',
  'Ein Werkzeug für Neugier und Selbstreflexion',
  'Privat: Deine Angaben verlassen nie deinen Browser',
  'Ein Prototyp mit simulierter Premium-Vorschau',
];

const IS_NOT = [
  'Eine DNA-, Abstammungs- oder Herkunftsanalyse',
  'Eine wissenschaftliche oder psychologische Diagnose',
  'Eine Vorhersage der Zukunft',
  'Eine echte Zahlung oder ein Abo',
];

export function HomeView({ onBegin, onExplore }: HomeViewProps) {
  return (
    <>
      <Hero onBegin={onBegin} onExplore={onExplore} />

      <section id="discover" className="section discover" aria-labelledby="discover-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <p className="label label--gold">01 — Entdecken</p>
            <h2 id="discover-title" className="h2">
              Eine Deutung aus dem Himmel <em>deiner Geburt.</em>
            </h2>
            <p className="lead section-head__lead">
              ASTRA übersetzt deinen Geburtsmoment – Datum, Uhrzeit und Ort – in ein persönliches Profil: mit echten,
              berechneten Fakten und der Symbolik von zwölf Zeichen und vier Elementen.
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
            <p className="label label--gold">02 — Deine Deutung</p>
            <h2 id="chapters-title" className="h2">
              Fünf Kapitel, <em>ein Himmel.</em>
            </h2>
            <p className="lead section-head__lead">
              Jede Deutung gehört zu genau einem Geburtsmoment. Gleiche Angaben ergeben immer dieselbe Deutung – wie ein
              Geburtshoroskop, nicht wie ein Tageshoroskop.
            </p>
            <button type="button" className="btn btn--ghost chapters__cta" onClick={onBegin}>
              Deutung starten
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
                <span className={`chapter__access chip ${chapter.access === 'Kostenlos' ? '' : 'chip--gold'}`}>
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
            <p className="label label--gold">03 — So funktioniert’s</p>
            <h2 id="how-title" className="h2">
              In drei Schritten <em>zur Deutung.</em>
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
                Was ASTRA ist – <em>und was nicht.</em>
              </h3>
              <p className="muted">
                Astrologie ist eine symbolische Sprache, keine Wissenschaft über Herkunft oder Schicksal. ASTRA soll
                schön und ehrlich zugleich sein.
              </p>
            </div>
            <div className="truth__col">
              <p className="label label--gold">ASTRA ist</p>
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
              <p className="label">ASTRA ist nicht</p>
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
          <p className="label label--gold">Einmalig</p>
          <h2 id="final-title" className="final__title">
            Der Himmel deiner Geburt <em>kehrt so nie wieder.</em>
          </h2>
          <button type="button" className="btn btn--primary" onClick={onBegin}>
            Mein Profil entdecken
            <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
          </button>
        </div>
      </section>
    </>
  );
}
