import React from 'react';

type BadgeKind = 'hot' | 'new' | 'veg' | 'gold';

interface BadgeProps {
  kind?: BadgeKind;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ kind = 'gold', children, className = '' }) => (
  <span className={`ui-badge ui-badge--${kind} ${className}`}>{children}</span>
);

export default Badge;
