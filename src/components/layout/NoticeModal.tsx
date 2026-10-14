import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

export type NoticeKind = 'privacy' | 'demo';

const CONTENT: Record<NoticeKind, { kicker: string; title: string; intro: string; points: string[] }> = {
  privacy: {
    kicker: 'Datenschutz',
    title: 'Dein Himmel bleibt bei dir.',
    intro: 'ASTRA ist so gebaut, dass deine persönlichen Angaben diese Seite nie verlassen müssen.',
    points: [
      'Geburtsdatum, Uhrzeit, Orte und deine Frage werden nur in diesem Browser-Tab verarbeitet.',
      'Nichts wird gespeichert – keine Cookies, kein Local Storage, kein Konto. Neu laden löscht alles.',
      'Es werden keine Daten an Server, KI-Anbieter, Karten- oder Ortungsdienste oder Analyse-Tools gesendet.',
      'Die Schriften sind direkt eingebunden – auch dafür gibt es keine Anfragen an Dritte.',
    ],
  },
  demo: {
    kicker: 'Demo & Haftung',
    title: 'Ein Prototyp – ehrlich erklärt.',
    intro: 'ASTRA ist ein Design-Prototyp, der zeigt, wie sich ein hochwertiges Astrologie-Erlebnis anfühlen kann.',
    points: [
      'Deutungen stammen von einer lokalen, regelbasierten Demo-Engine – nicht von einem KI-Modell. Eine KI-Anbindung ist vorbereitet.',
      'Astrologie ist symbolisch. Geburtsdaten können keine genetische Abstammung, Ethnie oder kulturelle Herkunft zeigen – ASTRA behauptet das auch nicht.',
      'Nichts in einer Deutung ist eine wissenschaftliche Diagnose oder eine Vorhersage der Zukunft.',
      'Premium ist simuliert: Es wird keine Zahlung angefordert, verarbeitet oder gespeichert, und es werden nie Kartendaten abgefragt.',
    ],
  },
};

interface NoticeModalProps {
  notice: NoticeKind | null;
  onClose: () => void;
}

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  const content = notice ? CONTENT[notice] : null;
  return (
    <Modal open={!!notice} onClose={onClose} labelledBy="notice-title" describedBy="notice-intro">
      {content && (
        <>
          <p className="label label--gold">{content.kicker}</p>
          <h2 id="notice-title" className="modal__title">
            {content.title}
          </h2>
          <p id="notice-intro" className="modal__text">
            {content.intro}
          </p>
          <ul className="modal__list">
            {content.points.map((point) => (
              <li key={point}>
                <Icon name="check" size={16} />
                {point}
              </li>
            ))}
          </ul>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Schließen
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
