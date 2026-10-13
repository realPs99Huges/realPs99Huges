import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import './Toast.css';

interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info';
}

const ToastContext = createContext<(text: string, tone?: ToastMessage['tone']) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const timer = useRef(0);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'success') => {
    window.clearTimeout(timer.current);
    setMessage({ id: Date.now(), text, tone });
    timer.current = window.setTimeout(() => setMessage(null), 3600);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {message && (
          <div className="toast" key={message.id}>
            <Icon name={message.tone === 'success' ? 'check' : 'info'} size={16} />
            {message.text}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
