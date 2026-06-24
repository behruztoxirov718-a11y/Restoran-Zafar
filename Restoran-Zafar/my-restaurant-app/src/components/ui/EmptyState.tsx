import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="ui-empty">
    {icon && <div className="ui-empty-icon">{icon}</div>}
    <div className="ui-empty-title">{title}</div>
    {description && <p className="ui-empty-desc">{description}</p>}
    {action && <div className="ui-empty-action">{action}</div>}
  </div>
);

export default EmptyState;
