import { useState } from 'react';
import './Taskbar.css';
import SecurityTools from './components/SecurityTools';
import SearchEngines from './components/SearchEngines';
import DarkWeb from './components/DarkWeb';
import Vulnerabilities from './components/Vulnerabilities';
import Aviation from './components/Aviation';
import FileExplorer from './components/FileExplorer';
import Terminal from './components/Terminal';
import LoginScreen from './components/LoginScreen';
import ShutdownAnimation from './components/ShutdownAnimation';
import SurpriseEffect from './components/SurpriseEffect';
import { useRef } from 'react';

export default function Taskbar({ isVisible, onPowerOff, onPowerOn }) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showShutdownAnimation, setShowShutdownAnimation] = useState(false);
  const [showSurpriseEffect, setShowSurpriseEffect] = useState(false);
  // New state for pinned and minimized
  const [pinnedApps, setPinnedApps] = useState(['fileExplorer']);
  const [openWindows, setOpenWindows] = useState({
    securityTools: false,
    searchEngines: false,
    darkWeb: false,
    vulnerabilities: false,
    aviation: false,
    fileExplorer: false,
    terminal: false
  });
  const [minimizedWindows, setMinimizedWindows] = useState({});
  const [contextMenu, setContextMenu] = useState(null); // { appId, x, y }
  const [ddosFlow, setDdosFlow] = useState(false);
  const [ddosStep, setDdosStep] = useState(0); // 0: not started, 1: ask site, 2: ask threads, 3: running
  const [ddosSite, setDdosSite] = useState('');
  const [ddosThreads, setDdosThreads] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const terminalRef = useRef();

  const tools = [
    {
      id: 'fileExplorer',
      name: 'File Explorer',
      icon: '📁',
      description: 'Browse files and folders'
    },
    {
      id: 'terminal',
      name: 'Command Prompt',
      icon: '💻',
      description: 'Command line interface'
    },
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

  // --- Window logic ---
  const openWindow = (windowId) => {
    setOpenWindows(prev => ({ ...prev, [windowId]: true }));
    setMinimizedWindows(prev => ({ ...prev, [windowId]: false }));
    setIsStartMenuOpen(false);
  };
  const closeWindow = (windowId) => {
    setOpenWindows(prev => ({ ...prev, [windowId]: false }));
    setMinimizedWindows(prev => ({ ...prev, [windowId]: false }));
  };
  const minimizeWindow = (windowId) => {
    setMinimizedWindows(prev => ({ ...prev, [windowId]: true }));
  };
  const restoreWindow = (windowId) => {
    setOpenWindows(prev => ({ ...prev, [windowId]: true }));
    setMinimizedWindows(prev => ({ ...prev, [windowId]: false }));
  };

  // --- Taskbar logic ---
  const taskbarApps = tools.filter(
    tool => openWindows[tool.id] || minimizedWindows[tool.id]
  );

  const isAppOpen = (id) => openWindows[id] && !minimizedWindows[id];
  const isAppMinimized = (id) => openWindows[id] && minimizedWindows[id];
  const isAppPinned = (id) => pinnedApps.includes(id);

  const handleTaskbarClick = (id) => {
    if (isAppOpen(id)) {
      minimizeWindow(id);
    } else if (isAppMinimized(id)) {
      restoreWindow(id);
    } else {
      openWindow(id);
    }
  };

  // --- Context menu logic ---
  const handleTaskbarRightClick = (e, id) => {
    e.preventDefault();
    setContextMenu({ appId: id, x: e.clientX, y: e.clientY });
  };
  const handlePinToggle = (id) => {
    setPinnedApps(prev =>
      prev.includes(id) ? prev.filter(app => app !== id) : [...prev, id]
    );
    setContextMenu(null);
  };
  const handleContextClose = () => setContextMenu(null);
  const handleContextCloseWindow = (id) => {
    closeWindow(id);
    setContextMenu(null);
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
      aviation: false,
      fileExplorer: false,
      terminal: false
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

  const handleSurprise = () => {
    setShowSurpriseEffect(true);
  };

  const handleSurpriseComplete = () => {
    setShowSurpriseEffect(false);
  };

  // DDoS handler
  const handleDDoS = () => {
    setTerminalOpen(true);
    setDdosFlow(true);
    setDdosStep(1);
    setDdosSite('');
    setDdosThreads('');
    // Open terminal if not already open
    openWindow('terminal');
    setMinimizedWindows(prev => ({ ...prev, terminal: false }));
  };

  // --- Render ---
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
        <div className="taskbar-apps">
          {taskbarApps.map(app => (
            <button
              key={app.id}
              className={`taskbar-app-btn${isAppOpen(app.id) ? ' open' : ''}${isAppMinimized(app.id) ? ' minimized' : ''}${isAppPinned(app.id) ? ' pinned' : ''}`}
              onClick={() => handleTaskbarClick(app.id)}
              onContextMenu={e => handleTaskbarRightClick(e, app.id)}
              title={app.name}
            >
              <span className="taskbar-app-icon">{app.icon}</span>
              <span className="taskbar-app-label">{app.name}</span>
            </button>
          ))}
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
      {/* Start Menu */}
      {isStartMenuOpen && (
        <div className="start-menu">
          <div className="start-menu-apps">
            {tools.map(app => (
              <button
                key={app.id}
                className="start-menu-app-btn"
                onClick={() => openWindow(app.id)}
              >
                <span className="start-menu-app-icon">{app.icon}</span>
                <span className="start-menu-app-label">{app.name}</span>
              </button>
            ))}
          </div>
          <div className="start-menu-power">
            <button className="power-btn" onClick={handlePowerButton}>⏻ Power</button>
          </div>
        </div>
      )}
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="taskbar-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={handleContextClose}
        >
          <button onClick={() => handlePinToggle(contextMenu.appId)}>
            {isAppPinned(contextMenu.appId) ? 'Unpin from taskbar' : 'Pin to taskbar'}
          </button>
          {isAppOpen(contextMenu.appId) || isAppMinimized(contextMenu.appId) ? (
            <button onClick={() => handleContextCloseWindow(contextMenu.appId)}>Close window</button>
          ) : null}
        </div>
      )}
      {/* Windows */}
      <FileExplorer 
        isOpen={openWindows.fileExplorer && !minimizedWindows.fileExplorer}
        onClose={() => closeWindow('fileExplorer')}
        onMinimize={() => minimizeWindow('fileExplorer')}
        onSurprise={handleSurprise}
        onDDoS={handleDDoS}
      />
      <Terminal
        ref={terminalRef}
        isOpen={openWindows.terminal && !minimizedWindows.terminal}
        onClose={() => closeWindow('terminal')}
        onMinimize={() => minimizeWindow('terminal')}
        onSurprise={handleSurprise}
        ddosFlow={ddosFlow}
        ddosStep={ddosStep}
        setDdosStep={setDdosStep}
        ddosSite={ddosSite}
        setDdosSite={setDdosSite}
        ddosThreads={ddosThreads}
        setDdosThreads={setDdosThreads}
        setDdosFlow={setDdosFlow}
      />
      <SecurityTools 
        isOpen={openWindows.securityTools && !minimizedWindows.securityTools}
        onClose={() => closeWindow('securityTools')}
        onMinimize={() => minimizeWindow('securityTools')}
      />
      <SearchEngines 
        isOpen={openWindows.searchEngines && !minimizedWindows.searchEngines}
        onClose={() => closeWindow('searchEngines')}
        onMinimize={() => minimizeWindow('searchEngines')}
      />
      <DarkWeb 
        isOpen={openWindows.darkWeb && !minimizedWindows.darkWeb}
        onClose={() => closeWindow('darkWeb')}
        onMinimize={() => minimizeWindow('darkWeb')}
      />
      <Vulnerabilities 
        isOpen={openWindows.vulnerabilities && !minimizedWindows.vulnerabilities}
        onClose={() => closeWindow('vulnerabilities')}
        onMinimize={() => minimizeWindow('vulnerabilities')}
      />
      <Aviation 
        isOpen={openWindows.aviation && !minimizedWindows.aviation}
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
      {/* Surprise Effect */}
      <SurpriseEffect 
        isActive={showSurpriseEffect}
        onComplete={handleSurpriseComplete}
      />
    </>
  );
} 