import React from 'react';
import './ErrorBanner.css';

const ErrorBanner = ({ message = 'Something went wrong. Please try again.' }) => (
  <div className="error-banner" role="alert">
    <span className="error-icon">⚠️</span>
    <span className="error-msg">{message}</span>
  </div>
);

export default ErrorBanner;
