import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type PushToast = (message: string, type?: ToastType) => void;

const ToastContext = createContext<PushToast>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): PushToast => useContext(ToastContext);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} strokeWidth={1.8} />,
  error: <AlertCircle size={18} strokeWidth={1.8} />,
  info: <Info size={18} strokeWidth={1.8} />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<PushToast>(
    (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="ui-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`ui-toast ui-toast--${t.type}`}>
            <span className="ui-toast-icon">{ICONS[t.type]}</span>
            <span className="ui-toast-msg">{t.message}</span>
            <button className="ui-toast-close" onClick={() => remove(t.id)} aria-label="Yopish">
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
