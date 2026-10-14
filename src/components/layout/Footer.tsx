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
              Eine persönliche Reise durch den Kosmos – symbolische Deutungen aus dem Moment deiner Geburt.
            </p>
          </div>

          <nav className="footer__col" aria-label="Fußzeile">
            <p className="label">Navigation</p>
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
            <p className="label">Hinweise</p>
            <ul>
              <li>
                <button type="button" className="footer__link" onClick={() => onOpenNotice('privacy')}>
                  Datenschutz
                </button>
              </li>
              <li>
                <button type="button" className="footer__link" onClick={() => onOpenNotice('demo')}>
                  Demo &amp; Haftung
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__notice">
          <p>
            <strong>Demo-Prototyp.</strong> Deutungen sind symbolische Interpretationen einer lokalen, regelbasierten
            Demo-Engine – kein KI-Modell, keine DNA- oder Abstammungsanalyse und keine Vorhersage. Es werden keine
            Zahlungen verarbeitet.
          </p>
          <p>
            <strong>Datenschutz.</strong> Alles, was du eingibst, bleibt in diesem Browser-Tab. Nichts wird gespeichert,
            gesendet oder getrackt; beim Neuladen ist alles gelöscht.
          </p>
        </div>

        <div className="footer__bottom">
          <p className="label">© {new Date().getFullYear()} ASTRA · Prototyp</p>
          <button type="button" className="footer__top-link" onClick={() => onNavigate('top')}>
            <span className="label">Nach oben</span>
            <Icon name="arrowUp" size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
