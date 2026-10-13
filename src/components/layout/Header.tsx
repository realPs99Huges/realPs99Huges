import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NAV_ITEMS, type NavTarget, type View } from '../../app/navigation';
import { AstraLogo } from '../brand/AstraLogo';
import { Icon } from '../ui/Icon';
import './Header.css';

interface HeaderProps {
  view: View;
  onNavigate: (target: NavTarget) => void;
  onBegin: () => void;
  onOpenDemoNotice: () => void;
}

export function Header({ view, onNavigate, onBegin, onOpenDemoNotice }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add('is-locked');
    const first = menuRef.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === 'Tab' && menuRef.current) {
        const focusables = [...menuRef.current.querySelectorAll<HTMLElement>('a, button')];
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 960) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const go = (target: NavTarget) => {
    setMenuOpen(false);
    onNavigate(target);
  };

  const begin = () => {
    setMenuOpen(false);
    onBegin();
  };

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu-open' : ''}`}>
      <div className="header__inner container">
        <div className="header__brand">
          <AstraLogo onClick={() => go('top')} />
          <button type="button" className="chip header__demo" onClick={onOpenDemoNotice}>
            <span className="chip__dot" aria-hidden="true" />
            Demo
            <span className="sr-only"> prototype — read the demo notice</span>
          </button>
        </div>

        <nav className="header__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.target}
              href={item.href}
              className="header__link"
              aria-current={item.target === 'reading' && view === 'reading' ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(item.target);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <button type="button" className="btn btn--ghost btn--sm header__cta" onClick={begin}>
            Begin Your Reading
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="header__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="mobile-menu"
        hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <nav className="mobile-menu__nav" aria-label="Mobile">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.target}
              href={item.href}
              className="mobile-menu__link"
              style={{ '--i': index } as CSSProperties}
              onClick={(event) => {
                event.preventDefault();
                go(item.target);
              }}
            >
              <span className="label">0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <button type="button" className="btn btn--primary" onClick={begin}>
            Begin Your Reading
            <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
          </button>
          <p className="label">Demo prototype · symbolic readings · no payments</p>
        </div>
      </div>
    </header>
  );
}
