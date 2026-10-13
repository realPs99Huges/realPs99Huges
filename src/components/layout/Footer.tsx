import { NAV_ITEMS, type NavTarget } from '../../app/navigation';
import { AstraLogo } from '../brand/AstraLogo';
import { Icon } from '../ui/Icon';
import './Footer.css';

interface FooterProps {
  onNavigate: (target: NavTarget) => void;
  onOpenNotice: (notice: 'privacy' | 'demo') => void;
}

export function Footer({ onNavigate, onOpenNotice }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <AstraLogo onClick={() => onNavigate('top')} />
            <p className="footer__tagline">
              A personal journey through the cosmos — symbolic readings shaped by the moment you were born.
            </p>
          </div>

          <nav className="footer__col" aria-label="Footer">
            <p className="label">Explore</p>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.target}>
                  <a
                    href={item.href}
                    className="footer__link"
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(item.target);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <p className="label">Notices</p>
            <ul>
              <li>
                <button type="button" className="footer__link" onClick={() => onOpenNotice('privacy')}>
                  Privacy
                </button>
              </li>
              <li>
                <button type="button" className="footer__link" onClick={() => onOpenNotice('demo')}>
                  Demo &amp; disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__notice">
          <p>
            <strong>Demo prototype.</strong> Readings are symbolic interpretations created by a local, rule-based demo
            engine — not by an AI model, not a DNA or ancestry analysis, and not a prediction. No payments are
            processed.
          </p>
          <p>
            <strong>Privacy.</strong> Everything you enter stays in this browser tab. Nothing is stored, sent or
            tracked; reloading the page clears it.
          </p>
        </div>

        <div className="footer__bottom">
          <p className="label">© {new Date().getFullYear()} ASTRA · Prototype</p>
          <button type="button" className="footer__top-link" onClick={() => onNavigate('top')}>
            <span className="label">Back to the stars</span>
            <Icon name="arrowUp" size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
