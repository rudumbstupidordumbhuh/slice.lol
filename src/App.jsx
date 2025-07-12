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

// Add a custom typewriter hook for the entry message
function useTypewriterEntry(text, speed = 120, pause = 1200) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    let timeout;
    let cancelled = false;
    function type() {
      if (cancelled) return;
      setDisplayed(text.slice(0, i));
      if (i <= text.length) {
        timeout = setTimeout(() => {
          i++;
          type();
        }, speed);
      } else {
        timeout = setTimeout(() => {
          i = 0;
          type();
        }, pause);
      }
    }
    setDisplayed('');
    type();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [text, speed, pause]);
  return displayed;
}

function HandlePage() {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);
  const [showShareMsg, setShowShareMsg] = useState(false);

  const base = import.meta.env.BASE_URL;

  // Typewriter for entry overlay
  const entryTypewriter = useTypewriterEntry('click to enter...', 120, 1200);

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
        const audio = new window.Audio(base + 'care.mp3');
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

  // Track audio time and duration for embed
  useEffect(() => {
    if (entered && audioRef.current) {
      const updateTime = () => {
        if (audioRef.current) {
          setAudioTime(audioRef.current.currentTime);
        }
      };
      const updateDuration = () => {
        if (audioRef.current) {
          setAudioDuration(audioRef.current.duration || 0);
        }
      };
      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
      updateDuration();
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateTime);
          audioRef.current.removeEventListener('loadedmetadata', updateDuration);
        }
      };
    }
  }, [entered]);

  // Format time mm:ss
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => setEntered(true), 500); // match CSS transition duration
  };

  const handleMute = () => {
    setMuted((m) => !m);
  };

  // Song info
  const songTitle = 'If You Care';
  const songArtist = 'akiaura';
  const songFile = 'https://cdn.discordapp.com/attachments/1393371863542923368/1393372001975930993/video.mp4?ex=6872ee4c&is=68719ccc&hm=fb3f9fbc9913e832999726aa1a57d20f4d412bc4ce50ab5b93c067a940026494&';
  const songThumb = base + 'yk.png';

  // Share handler
  function handleShare(e) {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: songTitle,
        text: `Check out this song: ${songTitle}`,
        url: songFile,
      });
    } else {
      navigator.clipboard.writeText(songFile);
      setShowShareMsg(true);
      setTimeout(() => setShowShareMsg(false), 1200);
    }
  }

  // Download handler
  async function handleDownload(e) {
    e.preventDefault();
    try {
      const response = await fetch(songFile);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songTitle} - ${songArtist}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(songFile, '_blank');
    }
  }

  return (
    <div className="video-bg-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
        src="/video.mp4"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0 }}
      />
      {!entered && (
        <div className={`entry-overlay${fadeOut ? ' fade-out' : ''}`} onClick={handleEnter}>
          <div className="entry-message">
            <span className="typewriter-entry">{entryTypewriter}</span>
          </div>
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
          {/* Song embed below profile */}
          <div className="song-embed">
            <img className={`song-thumb${entered ? ' playing' : ''}`} src={songThumb} alt="song thumbnail" />
            <div className="song-info">
              <div className="song-title">{songTitle}</div>
              <div className="song-artist">{songArtist}</div>
              <div className="song-time">
                {formatTime(audioTime)}
                <span className="song-time-divider"> / </span>
                {audioDuration ? formatTime(audioDuration) : '--:--'}
              </div>
              <div className="song-bar-wrap">
                <div className="song-bar-bg">
                  <div className="song-bar-fg" style={{width: audioDuration ? `${(audioTime/audioDuration)*100}%` : '0%'}}></div>
                </div>
              </div>
              <div className="song-embed-btns">
                <button className="song-btn" onClick={handleDownload} type="button">
                  Download
                </button>
                <button className="song-btn" onClick={handleShare} type="button">
                  Share
                </button>
                {showShareMsg && (
                  <span className="song-share-msg">Link copied!</span>
                )}
              </div>
            </div>
          </div>
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
