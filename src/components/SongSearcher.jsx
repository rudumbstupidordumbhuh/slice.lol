import { useState, useEffect, useRef } from 'react';
import './SongSearcher.css';

const SongSearcher = ({ onSongSelect, isVisible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const searchTimeoutRef = useRef(null);

  // YouTube API Key
  const YOUTUBE_API_KEY = 'AIzaSyB9iTr3fqnAfqFPSV7_-Q7Nj2HBR9jbZRo';

  const searchYouTube = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }

      const data = await response.json();
      const results = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      // Fallback to mock results if API fails
      const mockResults = [
        {
          id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          artist: 'Rick Astley',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
        }
      ];
      setSearchResults(mockResults);
    } finally {
      setIsLoading(false);
    }
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
          <p>Powered by @bu8f</p>
        </div>
      </div>
    </div>
  );
};

export default SongSearcher; 