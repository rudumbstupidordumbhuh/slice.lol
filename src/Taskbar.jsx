import { useState } from 'react';
import SecurityTools from './components/SecurityTools';
import './Taskbar.css';

export default function Taskbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);

  const apps = [
    {
      id: 'security',
      name: 'Security Tools',
      icon: '🔒',
      description: 'Analyze files, URLs, IPs & domains',
      component: SecurityTools
    },
    {
      id: 'search',
      name: 'Search Engines',
      icon: '🔍',
      description: 'Alternative search engines',
      component: SecurityTools
    },
    {
      id: 'darkweb',
      name: 'Dark Web',
      icon: '🌑',
      description: 'Search .onion sites',
      component: SecurityTools
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      icon: '🛡️',
      description: 'CVE database search',
      component: SecurityTools
    },
    {
      id: 'aviation',
      name: 'Aviation',
      icon: '✈️',
      description: 'Flight data & tracking',
      component: SecurityTools
    }
  ];

  const handleAppClick = (app) => {
    setActiveApp(app);
    setMenuOpen(false);
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  return (
    <>
      <div className="taskbar">
        <button
          className="windows-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open Start Menu"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" fill="#fff" fillOpacity="0.8"/>
            <rect x="16" y="2" width="10" height="10" fill="#fff" fillOpacity="0.8"/>
            <rect x="2" y="16" width="10" height="10" fill="#fff" fillOpacity="0.8"/>
            <rect x="16" y="16" width="10" height="10" fill="#fff" fillOpacity="0.8"/>
          </svg>
        </button>
        {/* You can add more taskbar icons here later */}
      </div>
      
      {menuOpen && (
        <div className="start-menu" onClick={() => setMenuOpen(false)}>
          <div className="start-menu-inner" onClick={e => e.stopPropagation()}>
            <div className="start-menu-header">
              <div className="start-menu-title">Start</div>
            </div>
            <div className="start-menu-content">
              <div className="start-menu-apps">
                {apps.map(app => (
                  <button
                    key={app.id}
                    className="start-menu-app"
                    onClick={() => handleAppClick(app)}
                  >
                    <span className="app-icon">{app.icon}</span>
                    <span className="app-name">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeApp && (
        <activeApp.component 
          isOpen={true} 
          onClose={closeApp}
          defaultTab={activeApp.id}
        />
      )}
    </>
  );
} 