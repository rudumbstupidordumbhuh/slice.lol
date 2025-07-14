import { useState, useEffect } from 'react';
import './ShutdownAnimation.css';

export default function ShutdownAnimation({ isVisible }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="shutdown-animation">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="shutdown-background-video"
        src="/video.mp4"
      />
      
      {/* Overlay */}
      <div className="shutdown-overlay">
        <div className="shutdown-content">
          <div className="shutdown-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div className="shutdown-text">
            Shutting down{dots}
          </div>
          
          <div className="shutdown-spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 