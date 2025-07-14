import { useState, useEffect } from 'react';
import './SurpriseEffect.css';

export default function SurpriseEffect({ isActive, onComplete }) {
  const [confetti, setConfetti] = useState([]);
  const [flashCount, setFlashCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let flashInterval;
    let confettiInterval;
    let flashCount = 0;
    const maxFlashes = 20;

    // Create confetti particles
    const createConfetti = () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
      const newConfetti = [];
      
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }
      
      setConfetti(prev => [...prev, ...newConfetti]);
    };

    // Flash effect
    flashInterval = setInterval(() => {
      flashCount++;
      setFlashCount(flashCount);
      
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        clearInterval(confettiInterval);
        setTimeout(() => {
          setConfetti([]);
          setFlashCount(0);
          onComplete();
        }, 1000);
      }
    }, 100);

    // Confetti effect
    confettiInterval = setInterval(createConfetti, 200);

    // Animate confetti
    const animateConfetti = () => {
      setConfetti(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vy: particle.vy + 0.1 // gravity
        })).filter(particle => particle.y < window.innerHeight + 100)
      );
    };

    const animationInterval = setInterval(animateConfetti, 16);

    return () => {
      clearInterval(flashInterval);
      clearInterval(confettiInterval);
      clearInterval(animationInterval);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className={`surprise-overlay ${flashCount % 2 === 0 ? 'flash-on' : 'flash-off'}`}>
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="confetti-piece"
          style={{
            left: particle.x + 'px',
            top: particle.y + 'px',
            backgroundColor: particle.color,
            width: particle.size + 'px',
            height: particle.size + 'px',
            transform: `rotate(${particle.rotation}deg)`
          }}
        />
      ))}
      <div className="surprise-text">
        <h1>🎉 SURPRISE! 🎉</h1>
        <p>You found the secret file!</p>
        <div className="rainbow-text">
          <span>🌈</span>
          <span>✨</span>
          <span>🎊</span>
          <span>🎈</span>
          <span>🎁</span>
        </div>
      </div>
    </div>
  );
} 