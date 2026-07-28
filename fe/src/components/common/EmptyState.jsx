import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon = '🍽️', title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    {description && <p className="empty-desc">{description}</p>}
    {action && (
      <button className="empty-action-btn" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
