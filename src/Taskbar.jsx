import { useState } from 'react';
import './Taskbar.css';
import SecurityTools from './components/SecurityTools';
import SearchEngines from './components/SearchEngines';
import DarkWeb from './components/DarkWeb';
import Vulnerabilities from './components/Vulnerabilities';
import Aviation from './components/Aviation';
import LoginScreen from './components/LoginScreen';
import ShutdownAnimation from './components/ShutdownAnimation';

export default function Taskbar({ isVisible, onPowerOff, onPowerOn }) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showShutdownAnimation, setShowShutdownAnimation] = useState(false);
  const [openWindows, setOpenWindows] = useState({
    securityTools: false,
    searchEngines: false,
    darkWeb: false,
    vulnerabilities: false,
    aviation: false
  });

  const tools = [
    {
      id: 'securityTools',
      name: 'Security Tools',
      icon: '🔒',
      description: 'URL, IP, Domain & File Analysis'
    },
    {
      id: 'searchEngines',
      name: 'Search Engines',
      icon: '🔍',
      description: 'Alternative Search & Instant Answers'
    },
    {
      id: 'darkWeb',
      name: 'Dark Web',
      icon: '🌑',
      description: 'Onion Site Search & Lookup'
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      icon: '🛡️',
      description: 'CVE Database & Exploit Tracking'
    },
    {
      id: 'aviation',
      name: 'Aviation',
      icon: '✈️',
      description: 'Flight Data & Aircraft Tracking'
    }
  ];

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const openWindow = (windowId) => {
    setOpenWindows(prev => ({
      ...prev,
      [windowId]: true
    }));
    setIsStartMenuOpen(false);
  };

  const closeWindow = (windowId) => {
    setOpenWindows(prev => ({
      ...prev,
      [windowId]: false
    }));
  };

  const minimizeWindow = (windowId) => {
    setOpenWindows(prev => ({
      ...prev,
      [windowId]: false
    }));
  };

  const handlePowerButton = () => {
    setShowShutdownAnimation(true);
    setIsStartMenuOpen(false);
    // Close all open windows
    setOpenWindows({
      securityTools: false,
      searchEngines: false,
      darkWeb: false,
      vulnerabilities: false,
      aviation: false
    });
    
    // Show shutdown animation for 3 seconds, then show login screen
    setTimeout(() => {
      setShowShutdownAnimation(false);
      setShowLoginScreen(true);
    }, 3000);
  };

  const handlePowerOn = () => {
    setShowLoginScreen(false);
    if (onPowerOn) {
      onPowerOn(); // This will restart the main app
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-left">
          <button 
            className={`start-button ${isStartMenuOpen ? 'active' : ''}`}
            onClick={toggleStartMenu}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z"/>
            </svg>
          </button>
        </div>

        <div className="taskbar-center">
          <div className="taskbar-time">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </div>

        <div className="taskbar-right">
          <div className="system-tray">
            <div className="tray-icon">📶</div>
            <div className="tray-icon">🔋</div>
            <div className="tray-icon">🔊</div>
          </div>
        </div>
      </div>

      {isStartMenuOpen && (
        <div className="start-menu-overlay" onClick={toggleStartMenu}>
          <div className="start-menu" onClick={e => e.stopPropagation()}>
            <div className="start-menu-header">
              <div className="user-info">
                <div className="user-avatar">👤</div>
                <div className="user-details">
                  <div className="user-name">bu8f</div>
                  <div className="user-email">https://www.bu8f.online/</div>
                </div>
              </div>
            </div>

            <div className="start-menu-content">
              <div className="apps-section">
                <h3>Applications</h3>
                <div className="apps-grid">
                  {tools.map(tool => (
                    <button
                      key={tool.id}
                      className="app-item"
                      onClick={() => openWindow(tool.id)}
                    >
                      <div className="app-icon">{tool.icon}</div>
                      <div className="app-info">
                        <div className="app-name">{tool.name}</div>
                        <div className="app-description">{tool.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="start-menu-footer">
              <button className="power-button" onClick={handlePowerButton}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 0 0-7 7v3h2V8a5 5 0 1 1 10 0v3h2V8a7 7 0 0 0-7-7z"/>
                  <path d="M7 12h2v3H7z"/>
                </svg>
                Power
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Tool Windows */}
      <SecurityTools 
        isOpen={openWindows.securityTools}
        onClose={() => closeWindow('securityTools')}
        onMinimize={() => minimizeWindow('securityTools')}
      />

      <SearchEngines 
        isOpen={openWindows.searchEngines}
        onClose={() => closeWindow('searchEngines')}
        onMinimize={() => minimizeWindow('searchEngines')}
      />

      <DarkWeb 
        isOpen={openWindows.darkWeb}
        onClose={() => closeWindow('darkWeb')}
        onMinimize={() => minimizeWindow('darkWeb')}
      />

      <Vulnerabilities 
        isOpen={openWindows.vulnerabilities}
        onClose={() => closeWindow('vulnerabilities')}
        onMinimize={() => minimizeWindow('vulnerabilities')}
      />

      <Aviation 
        isOpen={openWindows.aviation}
        onClose={() => closeWindow('aviation')}
        onMinimize={() => minimizeWindow('aviation')}
      />

      {/* Shutdown Animation */}
      <ShutdownAnimation 
        isVisible={showShutdownAnimation}
      />

      {/* Login Screen */}
      <LoginScreen 
        isVisible={showLoginScreen}
        onPowerOn={handlePowerOn}
      />
    </>
  );
} 