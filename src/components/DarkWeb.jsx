import { useState } from 'react';
import './WindowStyles.css';

export default function DarkWeb({ isOpen, onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('darksearch');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'darksearch', name: 'Darksearch.io', icon: '🌑' },
    { id: 'onionlookup', name: 'Onion Lookup', icon: '🧅' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let result;
      switch (activeTab) {
        case 'darksearch':
          result = await searchDarkWeb(input);
          break;
        case 'onionlookup':
          result = await lookupOnion(input);
          break;
        default:
          throw new Error('Invalid tab');
      }
      setResults(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchDarkWeb = async (query) => {
    // Darksearch.io API (free)
    const response = await fetch(`https://darksearch.io/api/search?query=${encodeURIComponent(query)}&page=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Dark web search failed');
    }

    const data = await response.json();
    return {
      type: 'darkweb',
      data: {
        query: query,
        results: data.data || [],
        totalResults: data.total || 0,
        searchEngine: 'Darksearch.io'
      }
    };
  };

  const lookupOnion = async (onionUrl) => {
    // Onion Lookup API (free)
    const response = await fetch(`https://onion.ail-project.org/api/lookup?url=${encodeURIComponent(onionUrl)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Onion lookup failed');
    }

    const data = await response.json();
    return {
      type: 'onion',
      data: {
        url: onionUrl,
        exists: data.exists || false,
        metadata: data.metadata || {},
        lastSeen: data.last_seen || 'Unknown',
        searchEngine: 'Onion Lookup'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'darkweb') {
      return (
        <div className="results">
          <h3>Dark Web Search Results</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Engine:</strong> {results.data.searchEngine}</p>
          <p><strong>Total Results:</strong> {results.data.totalResults}</p>
          {results.data.results.length > 0 && (
            <div className="search-results">
              {results.data.results.slice(0, 5).map((result, index) => (
                <div key={index} className="search-result-item">
                  <h4>{result.title || 'No title'}</h4>
                  <p className="result-url">{result.link}</p>
                  <p className="result-snippet">{result.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (results.type === 'onion') {
      return (
        <div className="results">
          <h3>Onion Lookup Results</h3>
          <p><strong>URL:</strong> {results.data.url}</p>
          <p><strong>Engine:</strong> {results.data.searchEngine}</p>
          <p><strong>Exists:</strong> {results.data.exists ? 'Yes' : 'No'}</p>
          <p><strong>Last Seen:</strong> {results.data.lastSeen}</p>
          {results.data.metadata && Object.keys(results.data.metadata).length > 0 && (
            <div className="metadata">
              <h4>Metadata:</h4>
              <ul>
                {Object.entries(results.data.metadata).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'darksearch':
        return 'Search .onion sites...';
      case 'onionlookup':
        return 'Enter .onion URL to check...';
      default:
        return 'Enter search query...';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="window-overlay">
      <div className="window-modal">
        <div className="window-titlebar">
          <div className="window-title">
            <span className="window-icon">🌑</span>
            Dark Web
          </div>
          <div className="window-controls">
            <button className="window-control minimize" onClick={onMinimize}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2" y="5" width="8" height="2" fill="currentColor"/>
              </svg>
            </button>
            <button className="window-control close" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="window-content">
          <div className="window-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="window-form">
            <div className="input-group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                className="window-input"
              />
              <button type="submit" className="scan-btn" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {renderResults()}

          <div className="api-info">
            <h4>📋 API Information</h4>
            <ul>
              <li><strong>Darksearch.io:</strong> .onion site search (free)</li>
              <li><strong>Onion Lookup:</strong> Hidden service metadata (free)</li>
            </ul>
            <p className="api-note">
              <strong>Note:</strong> These tools search the dark web. Use responsibly and legally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 