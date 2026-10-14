import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
}

/** Accessible modal on top of the native <dialog> (focus trap, Escape, top layer). */
export function Modal({ open, onClose, labelledBy, describedBy, children, className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.classList.add('is-locked');
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.body.classList.remove('is-locked');
  }, [open]);

  useEffect(() => () => document.body.classList.remove('is-locked'), []);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel">
        <button type="button" className="modal__close" onClick={onClose}>
          <Icon name="close" size={18} />
          <span className="sr-only">Schließen</span>
        </button>
        {children}
      </div>
    </dialog>
  );
}
