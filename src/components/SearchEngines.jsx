import { useState } from 'react';
import './WindowStyles.css';

export default function SearchEngines({ isOpen, onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('memex');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'memex', name: 'Memex Marginalia', icon: '🔍' },
    { id: 'serpstack', name: 'Serpstack', icon: '🌐' },
    { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆' }
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
        case 'memex':
          result = await searchMemex(input);
          break;
        case 'serpstack':
          result = await searchSerpstack(input);
          break;
        case 'duckduckgo':
          result = await searchDuckDuckGo(input);
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

  const searchMemex = async (query) => {
    // Memex Marginalia API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://memex.marginalia.nu/search?query=${encodeURIComponent(query)}&count=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Memex search failed');
    }

    const data = await response.json();
    return {
      type: 'search',
      data: {
        query: query,
        results: data.results || [],
        totalResults: data.totalResults || 0,
        searchEngine: 'Memex Marginalia'
      }
    };
  };

  const searchSerpstack = async (query) => {
    // Serpstack API (free tier) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}http://api.serpstack.com/search?access_key=472744b4b488e0d6dc0f688fad9bd777&query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Serpstack search failed');
    }

    const data = await response.json();
    return {
      type: 'search',
      data: {
        query: query,
        results: data.organic_results || [],
        totalResults: data.search_information?.total_results || 0,
        searchEngine: 'Serpstack'
      }
    };
  };

  const searchDuckDuckGo = async (query) => {
    // DuckDuckGo Instant Answers API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('DuckDuckGo search failed');
    }

    const data = await response.json();
    return {
      type: 'instant_answer',
      data: {
        query: query,
        answer: data.Abstract || data.Answer || 'No instant answer available',
        relatedTopics: data.RelatedTopics || [],
        searchEngine: 'DuckDuckGo'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'search') {
      return (
        <div className="results">
          <h3>Search Results</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Engine:</strong> {results.data.searchEngine}</p>
          <p><strong>Total Results:</strong> {results.data.totalResults}</p>
          {results.data.results.length > 0 && (
            <div className="search-results">
              {results.data.results.slice(0, 5).map((result, index) => (
                <div key={index} className="search-result-item">
                  <h4>{result.title || 'No title'}</h4>
                  <p className="result-url">{result.url || result.link}</p>
                  <p className="result-snippet">{result.snippet || result.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (results.type === 'instant_answer') {
      return (
        <div className="results">
          <h3>Instant Answer</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Engine:</strong> {results.data.searchEngine}</p>
          <div className="instant-answer">
            <p><strong>Answer:</strong> {results.data.answer}</p>
          </div>
          {results.data.relatedTopics.length > 0 && (
            <div className="related-topics">
              <h4>Related Topics:</h4>
              <ul>
                {results.data.relatedTopics.slice(0, 3).map((topic, index) => (
                  <li key={index}>{topic.Text || topic}</li>
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
      case 'memex':
        return 'Search the small, old and weird web...';
      case 'serpstack':
        return 'Search with Google results...';
      case 'duckduckgo':
        return 'Get instant answers...';
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
            <span className="window-icon">🔍</span>
            Search Engines
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
              <li><strong>Memex Marginalia:</strong> Alternative search (free)</li>
              <li><strong>Serpstack:</strong> Google results to JSON (free)</li>
              <li><strong>DuckDuckGo:</strong> Instant answers (free)</li>
            </ul>
            <p className="api-note">
              <strong>✅ Ready:</strong> All API keys configured and ready to use!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 