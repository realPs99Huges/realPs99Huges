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
      <p className="label label--gold">Prototype</p>
      <h2 id="demo-title" className="modal__title">
        Demo Experience
      </h2>
      <p id="demo-text" className="modal__text">
        This is a prototype. No payment will be processed.
      </p>
      <p className="demo-modal__fine">
        “Preview Premium” unlocks the extended reading for this session only. No card or bank details are requested, and
        nothing is charged or stored.
      </p>
      <div className="modal__actions">
        <button type="button" className="btn btn--gold" onClick={onPreview} autoFocus>
          Preview Premium
          <Icon name="arrowRight" className="btn__icon btn__icon--arrow" />
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Go Back
        </button>
      </div>
    </Modal>
  );
}
