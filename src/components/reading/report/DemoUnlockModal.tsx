import { Icon } from '../../ui/Icon';
import { Modal } from '../../ui/Modal';

interface DemoUnlockModalProps {
  open: boolean;
  onPreview: () => void;
  onClose: () => void;
}

export function DemoUnlockModal({ open, onPreview, onClose }: DemoUnlockModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="demo-title" describedBy="demo-text" className="demo-modal">
      <div className="demo-modal__emblem" aria-hidden="true">
        <Icon name="sparkle" size={22} />
      </div>
      <p className="label label--gold">Prototyp</p>
      <h2 id="demo-title" className="modal__title">
        Demo-Erlebnis
      </h2>
      <p id="demo-text" className="modal__text">
        Dies ist ein Prototyp. Es wird keine Zahlung verarbeitet.
      </p>
      <p className="demo-modal__fine">
        „Premium ansehen“ schaltet die erweiterte Deutung nur für diese Sitzung frei. Es werden keine Karten- oder
        Bankdaten abgefragt, nichts wird berechnet oder gespeichert.
      </p>
      <div className="modal__actions">
        <button type="button" className="btn btn--gold" onClick={onPreview} autoFocus>
          Premium ansehen
          <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Zurück
        </button>
      </div>
    </Modal>
  );
}
