import { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, onVideoReady, onTimeUpdate, onDurationChange, isPlaying, volume, muted }) => {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const createPlayer = () => {
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        mute: muted ? 1 : 0,
        loop: 1,
        playlist: videoId,
        playsinline: 1,
        origin: window.location.origin,
        widget_referrer: window.location.origin,
        color: 'white',
        hl: 'en',
        cc_load_policy: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: 0,
        end: 0,
        vq: 'medium'
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  const onPlayerReady = (event) => {
    setIsReady(true);
    setDuration(event.target.getDuration());
    onVideoReady && onVideoReady(event.target);
    
    // Set initial volume
    event.target.setVolume(volume * 100);
    if (muted) {
      event.target.mute();
    }
  };

  const onPlayerStateChange = (event) => {
    // Update current time periodically
    if (event.data === window.YT.PlayerState.PLAYING) {
      const updateTime = () => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          onTimeUpdate && onTimeUpdate(time);
        }
      };
      
      const interval = setInterval(updateTime, 100);
      return () => clearInterval(interval);
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data);
  };

  // Handle play/pause
  useEffect(() => {
    if (playerRef.current && isReady) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current && isReady) {
      if (muted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    }
  }, [volume, muted, isReady]);

  // Handle video ID changes
  useEffect(() => {
    if (playerRef.current && isReady && videoId) {
      playerRef.current.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'medium'
      });
    }
  }, [videoId, isReady]);

  return (
    <div 
      id="youtube-player" 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default YouTubePlayer; 