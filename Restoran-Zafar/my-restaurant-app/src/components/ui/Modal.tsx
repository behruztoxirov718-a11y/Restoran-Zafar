import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 520,
}) => {
  // ESC bilan yopish + body scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ui-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ui-modal" style={{ maxWidth }} role="dialog" aria-modal="true">
        <button className="ui-modal-close" onClick={onClose} aria-label="Yopish">
          <X size={18} strokeWidth={1.8} />
        </button>
        {(title || subtitle) && (
          <div className="ui-modal-head">
            {title && <h3 className="ui-modal-title">{title}</h3>}
            {subtitle && <p className="ui-modal-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
