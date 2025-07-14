import { useState } from 'react';
import BaseWindow from './BaseWindow';
import './WindowStyles.css';

export default function Aviation({ isOpen, onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('aviationstack');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'aviationstack', name: 'Aviation Stack', icon: '✈️' },
    { id: 'opensky', name: 'OpenSky Network', icon: '🛩️' },
    { id: 'aviationapi', name: 'AviationAPI', icon: '📊' }
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
        case 'aviationstack':
          result = await searchFlights(input);
          break;
        case 'opensky':
          result = await searchAircraft(input);
          break;
        case 'aviationapi':
          result = await searchAirports(input);
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

  const searchFlights = async (query) => {
    // Aviation Stack API (free tier) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}http://api.aviationstack.com/v1/flights?access_key=6dad36e1f40208970abb639991f6c37c&search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Flight search failed');
    }

    const data = await response.json();
    return {
      type: 'flights',
      data: {
        query: query,
        flights: data.data || [],
        totalResults: data.pagination?.total || 0,
        searchEngine: 'Aviation Stack'
      }
    };
  };

  const searchAircraft = async (query) => {
    // OpenSky Network API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://opensky-network.org/api/states/all?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Aircraft search failed');
    }

    const data = await response.json();
    return {
      type: 'aircraft',
      data: {
        query: query,
        states: data.states || [],
        totalResults: data.states?.length || 0,
        searchEngine: 'OpenSky Network'
      }
    };
  };

  const searchAirports = async (query) => {
    // Aviation API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://api.aviationapi.com/v1/airports?apt=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('Airport search failed');
    }

    const data = await response.json();
    return {
      type: 'airports',
      data: {
        query: query,
        airports: data || [],
        totalResults: data?.length || 0,
        searchEngine: 'Aviation API'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'flights') {
      return (
        <div className="results">
          <h3>Flight Results</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Total Flights:</strong> {results.data.totalResults}</p>
          {results.data.flights.length > 0 && (
            <div className="aviation-results">
              {results.data.flights.slice(0, 5).map((flight, index) => (
                <div key={index} className="flight-item">
                  <h4>Flight {flight.flight?.iata || flight.flight?.icao || 'Unknown'}</h4>
                  <p><strong>From:</strong> {flight.departure?.airport || 'Unknown'}</p>
                  <p><strong>To:</strong> {flight.arrival?.airport || 'Unknown'}</p>
                  <p><strong>Status:</strong> {flight.flight_status || 'Unknown'}</p>
                  <p><strong>Airline:</strong> {flight.airline?.name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (results.type === 'aircraft') {
      return (
        <div className="results">
          <h3>Aircraft States</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Total Aircraft:</strong> {results.data.totalResults}</p>
          {results.data.states.length > 0 && (
            <div className="states-results">
              {results.data.states.slice(0, 5).map((state, index) => (
                <div key={index} className="state-item">
                  <h4>Aircraft {state[0] || 'Unknown'}</h4>
                  <p><strong>Country:</strong> {state[2] || 'Unknown'}</p>
                  <p><strong>Altitude:</strong> {state[7] ? `${state[7]}m` : 'Unknown'}</p>
                  <p><strong>Speed:</strong> {state[9] ? `${state[9]}m/s` : 'Unknown'}</p>
                  <p><strong>Heading:</strong> {state[10] ? `${state[10]}°` : 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (results.type === 'airports') {
      return (
        <div className="results">
          <h3>Airport Results</h3>
          <p><strong>Query:</strong> {results.data.query}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Total Airports:</strong> {results.data.totalResults}</p>
          {results.data.airports.length > 0 && (
            <div className="airport-results">
              {results.data.airports.slice(0, 5).map((airport, index) => (
                <div key={index} className="airport-item">
                  <h4>{airport.name || 'Unknown Airport'}</h4>
                  <p><strong>Code:</strong> {airport.icao || airport.iata || 'Unknown'}</p>
                  <p><strong>City:</strong> {airport.city || 'Unknown'}</p>
                  <p><strong>Country:</strong> {airport.country || 'Unknown'}</p>
                  <p><strong>Elevation:</strong> {airport.elevation ? `${airport.elevation}ft` : 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'aviationstack':
        return 'Enter flight number, airport code, or airline...';
      case 'opensky':
        return 'Search for aircraft states...';
      case 'aviationapi':
        return 'Enter airport code or name...';
      default:
        return 'Enter aviation query...';
    }
  };

  return (
    <BaseWindow
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      title="Aviation"
      icon="✈️"
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
              <li><strong>Aviation Stack:</strong> Flight data (100 req/month)</li>
              <li><strong>OpenSky Network:</strong> ADS-B data (free)</li>
              <li><strong>AviationAPI:</strong> FAA data (free)</li>
            </ul>
          </div>
        </div>
      </BaseWindow>
    );
  } 