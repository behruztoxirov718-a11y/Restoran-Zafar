import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'ghost' | 'gold' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      className={`ui-btn ui-btn--${variant} ${fullWidth ? 'ui-btn--block' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={16} className="ui-spin" strokeWidth={2} />}
      {children}
    </button>
  );
};

export default Button;
