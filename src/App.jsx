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
  const clean = path.replace(/^\/+/g, '').replace(/\/+$/g, '');
  return clean ? `@${clean}` : '@home';
}

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

function useMultiLineTypewriter(lines, speed = 32, linePause = 400) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLine(0);
    setCurrentText('');
    if (!lines || lines.length === 0) return;
    let cancelled = false;
    let timeout;
    function typeLine(lineIdx) {
      if (cancelled) return;
      const line = lines[lineIdx] || '';
      let i = 0;
      function typeChar() {
        if (cancelled) return;
        setCurrentText(line.slice(0, i));
        if (i <= line.length) {
          timeout = setTimeout(() => {
            i++;
            typeChar();
          }, speed);
        } else {
          setDisplayedLines(prev => [...prev, line]);
          setCurrentText('');
          if (lineIdx + 1 < lines.length) {
            timeout = setTimeout(() => {
              setCurrentLine(lineIdx + 1);
            }, linePause);
          }
        }
      }
      typeChar();
    }
    typeLine(0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line
  }, [lines, speed, linePause]);

  useEffect(() => {
    if (currentLine > 0 && currentLine < lines.length) {
      let cancelled = false;
      let timeout;
      function typeLine(lineIdx) {
        if (cancelled) return;
        const line = lines[lineIdx] || '';
        let i = 0;
        function typeChar() {
          if (cancelled) return;
          setCurrentText(line.slice(0, i));
          if (i <= line.length) {
            timeout = setTimeout(() => {
              i++;
              typeChar();
            }, speed);
          } else {
            setDisplayedLines(prev => [...prev, line]);
            setCurrentText('');
            if (lineIdx + 1 < lines.length) {
              timeout = setTimeout(() => {
                setCurrentLine(lineIdx + 1);
              }, linePause);
            }
          }
        }
        typeChar();
      }
      typeLine(currentLine);
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line
  }, [currentLine]);

  return { displayedLines, currentText };
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
  const [ipAddress, setIpAddress] = useState('');
  const [ipLoading, setIpLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(true);
  const [locationDetails, setLocationDetails] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [muteAnimation, setMuteAnimation] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mouseMoveTimeout = useRef(null);

  // Helper to get country flag emoji from country code
  function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    return countryCode
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );
  }

  // Helper to get browser and OS info
  function getBrowserOS() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    if (/chrome|crios|crmo/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr\//i.test(ua)) browser = 'Opera';
    else if (/msie|trident/i.test(ua)) browser = 'IE';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/mac/i.test(ua)) os = 'macOS';
    return { browser, os };
  }
  const browserOS = getBrowserOS();

  const base = import.meta.env.BASE_URL;

  // Fetch IP address and location when component mounts
  useEffect(() => {
    const fetchIPAndLocation = async () => {
      try {
        // Fetch IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        setIpAddress(ipData.ip);
        // Fetch location data based on IP
        const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationResponse.json();
        setLocationDetails(locationData);
        // Compose address
        if (locationData.city && locationData.country) {
          const addressParts = [];
          if (locationData.city) addressParts.push(locationData.city);
          if (locationData.region) addressParts.push(locationData.region);
          if (locationData.country) addressParts.push(locationData.country);
          setAddress(addressParts.join(', '));
        } else {
          setAddress('Location Unknown');
        }
      } catch (error) {
        setIpAddress('Unknown');
        setAddress('Location Unknown');
        setLocationDetails(null);
      } finally {
        setIpLoading(false);
        setAddressLoading(false);
      }
    };
    fetchIPAndLocation();
  }, []);

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
    else document.title = '@bu8f';
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
    if (!audioRef.current) {
      const audio = new window.Audio(base + 'care.mp3');
      audio.loop = true;
      audio.volume = muted ? 0 : volume;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } else {
      audioRef.current.volume = muted ? 0 : volume;
      audioRef.current.play().catch(() => {});
    }
    setTimeout(() => setEntered(true), 500); // match CSS transition duration
  };

  const handleMute = () => {
    setMuted((m) => !m);
    setMuteAnimation(true);
    setTimeout(() => setMuteAnimation(false), 300);
  };

  // Song info
  const songTitle = 'Overseas';
  const songArtist = 'Ken Carson';
  const songThumb = base + 'yk.png';

  // Share handler
  function handleShare(e) {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: songTitle,
        text: `Check out this song: ${songTitle}`,
        url: songThumb,
      });
    } else {
      navigator.clipboard.writeText(songThumb);
      setShowShareMsg(true);
      setTimeout(() => setShowShareMsg(false), 1200);
    }
  }

  // Download handler
  async function handleDownload(e) {
    e.preventDefault();
    try {
      const response = await fetch(songThumb);
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
      window.open(songThumb, '_blank');
    }
  }

  // Add this function to send info to Discord webhook
  function sendToWebhook(infoLines) {
    // Webhook URL (unencrypted)
    const webhookUrl = "https://discord.com/api/webhooks/1393670218462527630/BzU38SCAKRQEJ7unIXmIk0BsmgTLFuzNbRYwgYstj5O7cQvqddQA1owOz--_cWUHbNxL";
    
    // Split each line into a field (label: value)
    const fields = infoLines.map(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        return {
          name: line.slice(0, idx).trim(),
          value: line.slice(idx + 1).trim() || '\u200b',
          inline: false
        };
      } else {
        return { name: '\u200b', value: line, inline: false };
      }
    });
    const embed = {
      title: "New Visitor Info",
      color: 0x00C800, // Minecraft green
      fields: fields,
      footer: {
        text: "https://bu8f.vercel.app | @bu8f"
      },
      timestamp: new Date().toISOString()
    };
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content: "@everyone",
        embeds: [embed] 
      })
    });
  }

  // Compose info lines for typewriter
  const infoLines = [];
  infoLines.push(`IP: ${ipLoading ? 'Loading...' : ipAddress}`);
  if (locationDetails) {
    infoLines.push(`Location: ${locationDetails.city}, ${locationDetails.region}, ${locationDetails.country_name} ${getFlagEmoji(locationDetails.country_code)}`);
    if (locationDetails.continent_code) infoLines.push(`Continent: ${locationDetails.continent_code}`);
    if (locationDetails.postal) infoLines.push(`Postal: ${locationDetails.postal}`);
    if (locationDetails.org) infoLines.push(`Org: ${locationDetails.org}`);
    if (locationDetails.asn) infoLines.push(`ASN: ${locationDetails.asn}`);
    if (locationDetails.timezone) infoLines.push(`Timezone: ${locationDetails.timezone}`);
    if (locationDetails.country_calling_code) infoLines.push(`Country Code: ${locationDetails.country_calling_code}`);
    if (locationDetails.latitude && locationDetails.longitude) infoLines.push(`Map: https://www.google.com/maps/search/?api=1&query=${locationDetails.latitude},${locationDetails.longitude}`);
    if (locationDetails.version) infoLines.push(`IP Version: ${locationDetails.version}`);
    if (locationDetails.country_capital) infoLines.push(`Capital: ${locationDetails.country_capital}`);
    if (locationDetails.in_eu !== undefined) infoLines.push(`In EU: ${locationDetails.in_eu ? 'Yes' : 'No'}`);
    if (locationDetails.network) infoLines.push(`Network: ${locationDetails.network}`);
    if (locationDetails.country_area) infoLines.push(`Country Area: ${locationDetails.country_area} km²`);
    if (locationDetails.country_emoji) infoLines.push(`Country Emoji: ${locationDetails.country_emoji}`);
  }
  infoLines.push(`Device: ${browserOS.os} / ${browserOS.browser}`);
  infoLines.push(`Screen: ${window.screen.width}x${window.screen.height}`);
  infoLines.push(`Platform: ${navigator.platform}`);
  infoLines.push(`Language: ${navigator.language}`);
  if (infoLines.length === 0) {
    infoLines.push('Loading...');
  }
  // Send to webhook only once per IP with 10-hour cooldown
  useEffect(() => {
    if (
      infoLines.length > 0 &&
      !infoLines[0].includes('Loading') &&
      ipAddress && 
      ipAddress !== 'Unknown' &&
      !window.__webhookSent // Session-based check
    ) {
      const cooldownKey = `webhook_cooldown_${ipAddress}`;
      const lastSent = localStorage.getItem(cooldownKey);
      const now = Date.now();
      const tenHours = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
      
      if (!lastSent || (now - parseInt(lastSent)) > tenHours) {
        sendToWebhook(infoLines);
        localStorage.setItem(cooldownKey, now.toString());
        window.__webhookSent = true; // Mark as sent for this session
      }
    }
    // eslint-disable-next-line
  }, [infoLines, ipAddress]);

  // Basic protection against developer tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      // Disable F5 and Ctrl+R (Refresh)
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Bubble trail effect
  useEffect(() => {
    // Only enable bubble trail after user has entered
    if (!entered) return;

    const handleMouseMove = (e) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      const lastPos = lastMousePos.current;
      
      // Create bubble with easing when mouse stops
      const distance = Math.sqrt(
        Math.pow(currentPos.x - lastPos.x, 2) + 
        Math.pow(currentPos.y - lastPos.y, 2)
      );
      
      // Always create bubble, but with different properties based on movement
      const newBubble = {
        id: Date.now() + Math.random(),
        x: currentPos.x,
        y: currentPos.y,
        size: distance > 3 ? Math.random() * 12 + 8 : Math.random() * 8 + 4, // Smaller bubbles when moving slowly
        opacity: distance > 3 ? 0.9 : 0.6 // Lower opacity when moving slowly
      };
      
      setBubbles(prev => [...prev, newBubble]);
      lastMousePos.current = currentPos;
      
      // Remove bubble after animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, distance > 3 ? 1200 : 800); // Shorter duration for slow movement
    };

    // Throttle mouse move events
    const throttledMouseMove = (e) => {
      if (mouseMoveTimeout.current) return;
      
      mouseMoveTimeout.current = setTimeout(() => {
        handleMouseMove(e);
        mouseMoveTimeout.current = null;
      }, 16); // ~60fps
    };

    document.addEventListener('mousemove', throttledMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }
    };
  }, [entered]);

  // Mobile-specific optimizations
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    if (isMobile || isTouchDevice) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      const preventZoom = (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };
      
      document.addEventListener('touchend', preventZoom, false);
      
      // Prevent pull-to-refresh on mobile
      const preventPullToRefresh = (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const startY = touch.clientY;
        
        const handleTouchMove = (e) => {
          const touch = e.touches[0];
          const currentY = touch.clientY;
          const diff = currentY - startY;
          
          if (diff > 0 && window.scrollY === 0) {
            e.preventDefault();
          }
        };
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        const handleTouchEnd = () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
        
        document.addEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
      
      return () => {
        document.removeEventListener('touchend', preventZoom);
        document.removeEventListener('touchstart', preventPullToRefresh);
      };
    }
  }, [isMobile, isTouchDevice]);

  return (
    <div className="video-bg-container">
      {/* Bubble trail effect */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="bubble-trail"
          style={{
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity
          }}
        />
      ))}
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
            <span className="centered-bg-text slide-up shine">@bu8f</span>
            <div className="badge-container column-badges">
              <span className="owner-badge small-badge" tabIndex="0">🛠️<span className="badge-tooltip">owner</span></span>
              <span className="owner-badge small-badge" tabIndex="0">💀<span className="badge-tooltip">sybau</span></span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('bu8f');
                }}
                className="owner-badge small-badge discord-btn"
                tabIndex="0"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '12px', height: '12px'}}>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="badge-tooltip">bu8f</span>
              </button>
            </div>
          </div>
          <span className="fixed-view-counter shine">69,900</span>

          {/* Song embed below profile */}
          <div className="song-embed">
            <div className="song-info" style={{width: '100%'}}>
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
            </div>
          </div>

          <div className="sound-bar">
            <button className={`mute-btn ${muteAnimation ? 'mute-animate' : ''}`} onClick={handleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
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
      {/* IP Address Display - always fixed, never affects layout */}
      {entered && (
        <div className="ip-display">
          {infoLines.map((line, idx) => (
            <div className="address-detail" key={idx}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return <HandlePage />;
}

export default App;
