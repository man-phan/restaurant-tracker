import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = false }) => (
  <div className={`spinner-wrapper${fullPage ? ' spinner-fullpage' : ''}`}>
    <div className="spinner" aria-label="Loading..." role="status" />
  </div>
);

export default LoadingSpinner;
