import { useState } from 'react';
import SecurityTools from './components/SecurityTools';
import './Taskbar.css';

export default function Taskbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [securityToolsOpen, setSecurityToolsOpen] = useState(false);

  const apps = [
    {
      id: 'security',
      name: 'Multi-Tool API Hub',
      icon: '🔧',
      description: 'Security, Search, Dark Web & Aviation APIs',
      onClick: () => {
        setSecurityToolsOpen(true);
        setMenuOpen(false);
      }
    }
    // Add more apps here in the future
  ];

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
            <div className="start-menu-header">APIs (Apps) Menu</div>
            <div className="start-menu-apps">
              {apps.map(app => (
                <button
                  key={app.id}
                  className="app-btn"
                  onClick={app.onClick}
                  title={app.description}
                >
                  <span className="app-icon">{app.icon}</span>
                  <div className="app-info">
                    <div className="app-name">{app.name}</div>
                    <div className="app-description">{app.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <SecurityTools 
        isOpen={securityToolsOpen} 
        onClose={() => setSecurityToolsOpen(false)} 
      />
    </>
  );
} 