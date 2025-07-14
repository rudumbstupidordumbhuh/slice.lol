import { useState, useEffect } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ isVisible, onPowerOn }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPoweringOn, setIsPoweringOn] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handlePowerOn = () => {
    setIsPoweringOn(true);
    setTimeout(() => {
      setIsPoweringOn(false);
      onPowerOn();
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className={`login-screen blue-bg`}>
      {/* Background video intentionally hidden for blue background */}
      {/* Only show overlay if not powering on */}
      {!isPoweringOn && (
        <div className="login-overlay">
          {/* Top left - Time and date */}
          <div className="login-time">
            <div className="time-display">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            <div className="date-display">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Center - Login form */}
          <div className="login-center">
            <div className="login-form-container">
              <div className="user-avatar-large">
                <div className="avatar-circle">
                  <span className="avatar-icon">👤</span>
                </div>
              </div>
              
              <div className="user-name-display">bu8f</div>
              
              <div className="login-form">
                <div className="password-field">
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="password-input"
                    disabled
                  />
                  <div className="password-hint">Press any key to continue</div>
                </div>
              </div>

              {/* Power on button */}
              <button 
                className={`power-on-button ${isPoweringOn ? 'powering-on' : ''}`}
                onClick={handlePowerOn}
                disabled={isPoweringOn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {isPoweringOn ? 'Starting...' : 'Power On'}
              </button>
            </div>
          </div>

          {/* Bottom right - System info */}
          <div className="login-footer">
            <div className="system-info">
              <div className="network-status">
                <span className="network-icon">📶</span>
                <span className="network-text">Connected</span>
              </div>
              <div className="battery-status">
                <span className="battery-icon">🔋</span>
                <span className="battery-text">100%</span>
              </div>
              <div className="accessibility-status">
                <span className="accessibility-icon">♿</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power on animation overlay */}
      {isPoweringOn && (
        <div className="power-on-overlay">
          <div className="power-on-animation">
            <div className="loading-spinner"></div>
            <div className="power-on-text">Starting Windows...</div>
          </div>
        </div>
      )}
    </div>
  );
} 