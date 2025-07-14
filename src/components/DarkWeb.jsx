import { useState } from 'react';
import BaseWindow from './BaseWindow';
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

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    setInput('');
    setResults(null);
    setError('');
    setLoading(false);
  };

  const searchDarkWeb = async (query) => {
    // DarkSearch API (free tier) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://darksearch.io/api/search?query=${encodeURIComponent(query)}&page=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Dark web search failed');
    }

    const data = await response.json();
    return {
      type: 'dark_web',
      data: {
        query: query,
        results: data.data || [],
        totalResults: data.total || 0,
        searchEngine: 'DarkSearch'
      }
    };
  };

  const lookupOnion = async (onionUrl) => {
    // AIL Project Onion Lookup API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://onion.ail-project.org/api/lookup?url=${encodeURIComponent(onionUrl)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
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
        status: data.status || 'Unknown',
        title: data.title || 'No title',
        description: data.description || 'No description',
        lastSeen: data.last_seen || 'Unknown',
        searchEngine: 'AIL Project'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'dark_web') {
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

  return (
    <BaseWindow
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      title="Dark Web"
      icon="🌑"
    >
      <div className="window-content">
          <div className="window-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabSwitch(tab.id)}
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
          </div>
        </div>
      </BaseWindow>
    );
  } 