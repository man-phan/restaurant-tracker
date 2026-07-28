import React, { useRef, useEffect } from 'react';
import './BottomSheet.css';

const BottomSheet = ({ onClose, title, children }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="bs-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="bs-sheet">
        <div className="bs-handle" />
        {title && (
          <div className="bs-header">
            <h2 className="bs-title">{title}</h2>
            <button className="bs-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        )}
        <div className="bs-body">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
