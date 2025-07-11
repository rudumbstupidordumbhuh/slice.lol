import { useEffect, useRef, useState } from 'react';
import './App.css';

function useTypewriter(text, speed = 50, loop = false, onStep) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    let timeout;
    let cancelled = false;
    function type() {
      if (cancelled) return;
      setDisplayed(text.slice(0, i));
      if (onStep) onStep(text.slice(0, i));
      if (i <= text.length) {
        timeout = setTimeout(() => {
          i++;
          type();
        }, speed);
      } else if (loop) {
        timeout = setTimeout(() => {
          i = 0;
          type();
        }, 900);
      }
    }
    setDisplayed('');
    type();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [text, speed, loop, onStep]);
  return displayed;
}

function getHandleFromPath(path) {
  if (!path || path === '/') return '@home';
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `@${clean}` : '@home';
}

function HandlePage() {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef(null);

  // Compute the pretty URL for the tab (simulate production URL)
  let prettyUrl;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    prettyUrl = `https://guns.lol${window.location.pathname}`;
  } else {
    prettyUrl = window.location.origin + window.location.pathname;
  }

  const url = window.location.href;
  const handle = getHandleFromPath(window.location.pathname);
  const typewriterText = url;
  const typed = useTypewriter(entered ? typewriterText : '', 32);

  // Tab title typewriter effect (pretty URL only)
  useTypewriter(prettyUrl, 120, true, (step) => {
    if (entered) document.title = step;
    else document.title = 'slice.lol';
  });

  useEffect(() => {
    if (entered) {
      if (!audioRef.current) {
        const audio = new window.Audio('/care.mp3');
        audio.loop = true;
        audio.volume = muted ? 0 : volume;
        audioRef.current = audio;
        audio.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.volume = muted ? 0 : volume;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [entered, volume, muted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Add audio loop fallback
  useEffect(() => {
    if (entered && audioRef.current) {
      const audio = audioRef.current;
      const onEnded = () => {
        audio.currentTime = 0;
        audio.play();
      };
      audio.addEventListener('ended', onEnded);
      return () => {
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [entered]);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => setEntered(true), 500); // match CSS transition duration
  };

  const handleMute = () => {
    setMuted((m) => !m);
  };

  return (
    <div className="video-bg-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        className={entered ? 'background-video' : 'background-video blurred'}
        src="/video.mp4"
        onEnded={e => { e.target.currentTime = 0; e.target.play(); }}
      />
      {!entered && (
        <div className={`entry-overlay${fadeOut ? ' fade-out' : ''}`} onClick={handleEnter}>
          <div className="entry-message">click to enter...</div>
        </div>
      )}
      {entered && (
        <>
          {/* Typewriter URL+handle at top */}
          <div className="typewriter-bar">
            <span className="typewriter-text">{typed}</span>
          </div>
          <div className="overlay-content">
            <span className="centered-bg-text slide-up shine">{handle}</span>
            <div className="badge-container column-badges">
              <span className="owner-badge small-badge" tabIndex="0">🛠️<span className="badge-tooltip">owner</span></span>
              <span className="owner-badge small-badge" tabIndex="0">🦋<span className="badge-tooltip">fierce</span></span>
            </div>
          </div>
          <span className="fixed-view-counter shine">69,900</span>
          <div className="sound-bar">
            <button className="mute-btn" onClick={handleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff"/>
                  <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff"/>
                </svg>
              )}
            </button>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              disabled={muted}
            />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return <HandlePage />;
}

export default App;
