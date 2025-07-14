import { useState, useEffect } from 'react';
import './SurpriseEffect.css';

export default function SurpriseEffect({ isActive, onComplete }) {
  const [flashCount, setFlashCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let flashInterval;
    let flashCount = 0;
    const maxFlashes = 20;

    // Flash effect
    flashInterval = setInterval(() => {
      flashCount++;
      setFlashCount(flashCount);
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        setTimeout(() => {
          setFlashCount(0);
          onComplete();
        }, 1000);
      }
    }, 100);

    return () => {
      clearInterval(flashInterval);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className={`surprise-overlay ${flashCount % 2 === 0 ? 'flash-bw-on' : 'flash-bw-off'}`}>
      <div className="surprise-text">
        <h1 style={{fontSize: '3.5rem'}}>💀 You found nothing sybau 💀</h1>
        <div style={{fontSize: '2.5rem', marginTop: '2rem'}}>
          <span role="img" aria-label="skull">💀</span>
          <span role="img" aria-label="skull">💀</span>
          <span role="img" aria-label="skull">💀</span>
          <span role="img" aria-label="skull">💀</span>
          <span role="img" aria-label="skull">💀</span>
        </div>
      </div>
    </div>
  );
} 