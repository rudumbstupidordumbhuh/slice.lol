import { useState, useRef } from 'react';
import { useWindowDrag } from '../hooks/useWindowDrag';
import './WindowStyles.css';

export default function BaseWindow({ 
  isOpen, 
  onClose, 
  onMinimize, 
  title, 
  icon, 
  children, 
  className = '' 
}) {
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      setIsMinimizing(false);
      onMinimize();
    }, 400);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const windowClasses = `window-modal ${className} ${isMinimizing ? 'minimizing' : ''} ${isClosing ? 'closing' : ''}`;
  const titlebarClasses = `window-titlebar`;
  const overlayClasses = `window-overlay`;

  return (
    <div className={overlayClasses}>
      <div 
        className={windowClasses}
      >
        <div 
          className={titlebarClasses}
        >
          <div className="window-title">
            <span className="window-icon">{icon}</span>
            {title}
          </div>
          <div className="window-controls">
            <button 
              className="window-control minimize" 
              onClick={handleMinimize}
              title="Minimize"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2" y="5" width="8" height="2" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className="window-control close" 
              onClick={handleClose}
              title="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="window-content">
          {children}
        </div>
      </div>
    </div>
  );
} 