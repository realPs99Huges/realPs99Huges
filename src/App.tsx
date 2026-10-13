import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { NavTarget, View } from './app/navigation';
import { useReadingSession } from './app/useReadingSession';
import { CosmicBackground } from './components/cosmos/CosmicBackground';
import { HomeView } from './components/home/HomeView';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { NoticeModal, type NoticeKind } from './components/layout/NoticeModal';
import { ReadingView } from './components/reading/ReadingView';
import { ToastProvider } from './components/ui/Toast';
import { useAmbientEffects } from './hooks/useAmbientEffects';
import { useReducedMotion } from './hooks/useReducedMotion';
import './App.css';

type Curtain = 'idle' | 'cover' | 'reveal';

/** Jump without the global smooth-scroll, e.g. while the curtain hides the page. */
function jumpTo(top: number) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = previous;
}

function sectionTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
  return el.getBoundingClientRect().top + window.scrollY - header - 8;
}

function viewFromHash(): View {
  return window.location.hash === '#reading' ? 'reading' : 'home';
}

function AstraApp() {
  useAmbientEffects();
  const reducedMotion = useReducedMotion();
  const session = useReadingSession();
  const [view, setView] = useState<View>(viewFromHash);
  const [curtain, setCurtain] = useState<Curtain>('idle');
  const [notice, setNotice] = useState<NoticeKind | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const initial = window.location.hash.slice(1);
    if (initial === 'discover' || initial === 'how-it-works') {
      requestAnimationFrame(() => jumpTo(sectionTop(initial)));
    }
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  /** Swap views behind a soft curtain of light, then land at `scrollTarget`. */
  const transition = useCallback(
    (change: () => void, scrollTarget: () => number = () => 0) => {
      const apply = () => {
        flushSync(change);
        jumpTo(scrollTarget());
      };
      if (reducedMotion) {
        apply();
        return;
      }
      setCurtain('cover');
      timers.current.push(
        window.setTimeout(() => {
          apply();
          setCurtain('reveal');
          timers.current.push(window.setTimeout(() => setCurtain('idle'), 760));
        }, 440),
      );
    },
    [reducedMotion],
  );

  const navigate = useCallback(
    (target: NavTarget) => {
      if (target === 'reading') {
        if (view === 'reading') {
          window.scrollTo({ top: 0 });
          return;
        }
        history.pushState({ view: 'reading' }, '', '#reading');
        transition(() => setView('reading'));
        return;
      }
      if (view === 'home') {
        if (target === 'top') window.scrollTo({ top: 0 });
        else window.scrollTo({ top: sectionTop(target) });
        return;
      }
      history.pushState({ view: 'home' }, '', window.location.pathname + window.location.search);
      transition(
        () => setView('home'),
        () => (target === 'top' ? 0 : sectionTop(target)),
      );
    },
    [transition, view],
  );

  useEffect(() => {
    const onPopState = () => {
      const next = viewFromHash();
      if (next !== view) transition(() => setView(next));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [transition, view]);

  const beginReading = useCallback(() => navigate('reading'), [navigate]);
  const explore = useCallback(() => navigate('discover'), [navigate]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CosmicBackground />
      <Header view={view} onNavigate={navigate} onBegin={beginReading} onOpenDemoNotice={() => setNotice('demo')} />
      <main id="main" className="view" key={view} tabIndex={-1}>
        {view === 'home' ? (
          <HomeView onBegin={beginReading} onExplore={explore} />
        ) : (
          <ReadingView session={session} reducedMotion={reducedMotion} onOpenNotice={setNotice} />
        )}
      </main>
      <Footer onNavigate={navigate} onOpenNotice={setNotice} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <div className={`curtain curtain--${curtain}`} aria-hidden="true">
        <span className="curtain__glow" />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AstraApp />
    </ToastProvider>
  );
}
