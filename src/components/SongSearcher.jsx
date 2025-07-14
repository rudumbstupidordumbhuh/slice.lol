import { useState, useEffect, useRef } from 'react';
import './SongSearcher.css';

const SongSearcher = ({ onSongSelect, isVisible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Mock YouTube search (for demo purposes)
  // In production, you would use the real YouTube API
  const searchYouTube = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock search results based on query
    const mockResults = [
      {
        id: 'dQw4w9WgXcQ', // Rick Roll
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      },
      {
        id: '9bZkp7q19f0', // PSY - Gangnam Style
        title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
        artist: 'officialpsy',
        thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg'
      },
      {
        id: 'kJQP7kiw5Fk', // Luis Fonsi - Despacito
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        artist: 'Luis Fonsi',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg'
      },
      {
        id: 'y6120QOlsfU', // Sandstorm
        title: 'Darude - Sandstorm',
        artist: 'Darude',
        thumbnail: 'https://img.youtube.com/vi/y6120QOlsfU/mqdefault.jpg'
      },
      {
        id: 'ZZ5LpwO-An4', // All Star
        title: 'Smash Mouth - All Star (Official Music Video)',
        artist: 'Smash Mouth',
        thumbnail: 'https://img.youtube.com/vi/ZZ5LpwO-An4/mqdefault.jpg'
      }
    ];

    // Filter results based on query
    const filteredResults = mockResults.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
    setIsLoading(false);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchYouTube(query);
    }, 500);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    onSongSelect(song);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSong(null);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="song-searcher-overlay">
      <div className="song-searcher-modal">
        <div className="song-searcher-header">
          <h2>Search Songs</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for any song..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
            autoFocus
          />
        </div>

        <div className="search-results">
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <span>Searching...</span>
            </div>
          )}

          {!isLoading && searchResults.length === 0 && searchQuery && (
            <div className="no-results">
              <span>No songs found</span>
            </div>
          )}

          {!isLoading && searchResults.map((song) => (
            <div
              key={song.id}
              className="search-result-item"
              onClick={() => handleSongSelect(song)}
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="song-thumbnail"
              />
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <div className="play-icon">▶</div>
            </div>
          ))}
        </div>

        <div className="song-searcher-footer">
          <p>Demo Mode - Powered by YouTube</p>
        </div>
      </div>
    </div>
  );
};

export default SongSearcher; 