import { useState } from 'react';
import './SecurityTools.css';
import React from 'react'; // Added missing import for React

export default function SecurityTools({ isOpen, onClose, defaultTab = 'url' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'url', name: 'URL Scanner', icon: '🔗', category: 'security' },
    { id: 'ip', name: 'IP Reputation', icon: '🌐', category: 'security' },
    { id: 'domain', name: 'Domain Check', icon: '🏠', category: 'security' },
    { id: 'file', name: 'File Analysis', icon: '📁', category: 'security' },
    { id: 'search', name: 'Search Engines', icon: '🔍', category: 'search' },
    { id: 'darkweb', name: 'Dark Web', icon: '🌑', category: 'darkweb' },
    { id: 'cve', name: 'Vulnerabilities', icon: '🛡️', category: 'security' },
    { id: 'aviation', name: 'Aviation', icon: '✈️', category: 'aviation' }
  ];

  // Update active tab when defaultTab changes
  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let result;
      switch (activeTab) {
        case 'url':
          result = await scanURL(input);
          break;
        case 'ip':
          result = await checkIPReputation(input);
          break;
        case 'domain':
          result = await checkDomainReputation(input);
          break;
        case 'file':
          result = await analyzeFile(input);
          break;
        case 'search':
          result = await searchWeb(input);
          break;
        case 'darkweb':
          result = await searchDarkWeb(input);
          break;
        case 'cve':
          result = await searchVulnerabilities(input);
          break;
        case 'aviation':
          result = await searchAviation(input);
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

  const scanURL = async (url) => {
    // URLScan.io API (free tier)
    const response = await fetch(`https://urlscan.io/api/v1/scan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': 'your-urlscan-api-key' // Optional for public API
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('URL scan failed');
    }

    const data = await response.json();
    return {
      type: 'url',
      data: {
        scanId: data.uuid,
        status: 'Scanning...',
        message: 'URL submitted for scanning. Check back in a few minutes for results.'
      }
    };
  };

  const checkIPReputation = async (ip) => {
    // AbuseIPDB API (free tier - 1000 requests/day)
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check`, {
      method: 'GET',
      headers: {
        'Key': 'your-abuseipdb-api-key',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('IP reputation check failed');
    }

    const data = await response.json();
    return {
      type: 'ip',
      data: {
        ip: ip,
        abuseConfidenceScore: data.data.abuseConfidenceScore,
        countryCode: data.data.countryCode,
        usageType: data.data.usageType,
        isPublic: data.data.isPublic,
        isWhitelisted: data.data.isWhitelisted
      }
    };
  };

  const checkDomainReputation = async (domain) => {
    // AlienVault OTX API (free tier)
    const response = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Domain reputation check failed');
    }

    const data = await response.json();
    return {
      type: 'domain',
      data: {
        domain: domain,
        reputation: data.reputation,
        threatScore: data.threat_score,
        pulseCount: data.pulse_info.count,
        tags: data.tags || []
      }
    };
  };

  const analyzeFile = async (fileHash) => {
    // VirusTotal API (free tier - 4 requests/minute)
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${fileHash}`, {
      method: 'GET',
      headers: {
        'x-apikey': 'your-virustotal-api-key'
      }
    });

    if (!response.ok) {
      throw new Error('File analysis failed');
    }

    const data = await response.json();
    return {
      type: 'file',
      data: {
        hash: fileHash,
        malicious: data.data.attributes.last_analysis_stats.malicious,
        suspicious: data.data.attributes.last_analysis_stats.suspicious,
        harmless: data.data.attributes.last_analysis_stats.harmless,
        undetected: data.data.attributes.last_analysis_stats.undetected,
        totalScanners: Object.keys(data.data.attributes.last_analysis_results).length
      }
    };
  };

  const searchWeb = async (query) => {
    // Memex Marginalia API (free)
    const response = await fetch(`https://memex.marginalia.nu/search?query=${encodeURIComponent(query)}&count=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Web search failed');
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

  const searchVulnerabilities = async (cveId) => {
    // National Vulnerability Database API (free)
    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Vulnerability search failed');
    }

    const data = await response.json();
    return {
      type: 'cve',
      data: {
        cveId: cveId,
        vulnerability: data.vulnerabilities?.[0]?.cve || {},
        totalResults: data.totalResults || 0,
        source: 'NVD'
      }
    };
  };

  const searchAviation = async (query) => {
    // Aviation Stack API (free tier - 100 requests/month)
    const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=your-aviationstack-key&search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Aviation search failed');
    }

    const data = await response.json();
    return {
      type: 'aviation',
      data: {
        query: query,
        flights: data.data || [],
        totalResults: data.pagination?.total || 0,
        source: 'Aviation Stack'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    switch (results.type) {
      case 'url':
        return (
          <div className="results">
            <h3>URL Scan Results</h3>
            <p><strong>Scan ID:</strong> {results.data.scanId}</p>
            <p><strong>Status:</strong> {results.data.status}</p>
            <p>{results.data.message}</p>
          </div>
        );
      case 'ip':
        return (
          <div className="results">
            <h3>IP Reputation Results</h3>
            <p><strong>IP:</strong> {results.data.ip}</p>
            <p><strong>Abuse Confidence:</strong> {results.data.abuseConfidenceScore}%</p>
            <p><strong>Country:</strong> {results.data.countryCode}</p>
            <p><strong>Usage Type:</strong> {results.data.usageType}</p>
            <p><strong>Public IP:</strong> {results.data.isPublic ? 'Yes' : 'No'}</p>
            <p><strong>Whitelisted:</strong> {results.data.isWhitelisted ? 'Yes' : 'No'}</p>
          </div>
        );
      case 'domain':
        return (
          <div className="results">
            <h3>Domain Reputation Results</h3>
            <p><strong>Domain:</strong> {results.data.domain}</p>
            <p><strong>Reputation:</strong> {results.data.reputation}</p>
            <p><strong>Threat Score:</strong> {results.data.threatScore}</p>
            <p><strong>Pulse Count:</strong> {results.data.pulseCount}</p>
            {results.data.tags.length > 0 && (
              <p><strong>Tags:</strong> {results.data.tags.join(', ')}</p>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="results">
            <h3>File Analysis Results</h3>
            <p><strong>Hash:</strong> {results.data.hash}</p>
            <p><strong>Malicious:</strong> {results.data.malicious}</p>
            <p><strong>Suspicious:</strong> {results.data.suspicious}</p>
            <p><strong>Harmless:</strong> {results.data.harmless}</p>
            <p><strong>Undetected:</strong> {results.data.undetected}</p>
            <p><strong>Total Scanners:</strong> {results.data.totalScanners}</p>
          </div>
        );
      case 'search':
        return (
          <div className="results">
            <h3>Web Search Results</h3>
            <p><strong>Query:</strong> {results.data.query}</p>
            <p><strong>Engine:</strong> {results.data.searchEngine}</p>
            <p><strong>Total Results:</strong> {results.data.totalResults}</p>
            {results.data.results.length > 0 && (
              <div className="search-results">
                {results.data.results.slice(0, 3).map((result, index) => (
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
      case 'darkweb':
        return (
          <div className="results">
            <h3>Dark Web Search Results</h3>
            <p><strong>Query:</strong> {results.data.query}</p>
            <p><strong>Engine:</strong> {results.data.searchEngine}</p>
            <p><strong>Total Results:</strong> {results.data.totalResults}</p>
            {results.data.results.length > 0 && (
              <div className="search-results">
                {results.data.results.slice(0, 3).map((result, index) => (
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
      case 'cve':
        return (
          <div className="results">
            <h3>Vulnerability Results</h3>
            <p><strong>CVE ID:</strong> {results.data.cveId}</p>
            <p><strong>Source:</strong> {results.data.source}</p>
            {results.data.vulnerability && (
              <>
                <p><strong>Description:</strong> {results.data.vulnerability.descriptions?.[0]?.value || 'No description'}</p>
                <p><strong>Severity:</strong> {results.data.vulnerability.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'Unknown'}</p>
                <p><strong>Published:</strong> {results.data.vulnerability.published || 'Unknown'}</p>
              </>
            )}
          </div>
        );
      case 'aviation':
        return (
          <div className="results">
            <h3>Aviation Results</h3>
            <p><strong>Query:</strong> {results.data.query}</p>
            <p><strong>Source:</strong> {results.data.source}</p>
            <p><strong>Total Flights:</strong> {results.data.totalResults}</p>
            {results.data.flights.length > 0 && (
              <div className="aviation-results">
                {results.data.flights.slice(0, 3).map((flight, index) => (
                  <div key={index} className="flight-item">
                    <h4>Flight {flight.flight?.iata || flight.flight?.icao || 'Unknown'}</h4>
                    <p><strong>From:</strong> {flight.departure?.airport || 'Unknown'}</p>
                    <p><strong>To:</strong> {flight.arrival?.airport || 'Unknown'}</p>
                    <p><strong>Status:</strong> {flight.flight_status || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'url':
        return 'Enter URL to scan (e.g., https://example.com)';
      case 'ip':
        return 'Enter IP address (e.g., 8.8.8.8)';
      case 'domain':
        return 'Enter domain (e.g., google.com)';
      case 'file':
        return 'Enter file hash (MD5, SHA1, or SHA256)';
      case 'search':
        return 'Enter search query (e.g., cybersecurity news)';
      case 'darkweb':
        return 'Enter search query for .onion sites';
      case 'cve':
        return 'Enter CVE ID (e.g., CVE-2023-1234)';
      case 'aviation':
        return 'Enter flight number, airport code, or airline name';
      default:
        return 'Enter search term...';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="security-tools-overlay" onClick={onClose}>
      <div className="security-tools-modal" onClick={e => e.stopPropagation()}>
        <div className="security-tools-header">
          <h2>🔧 Multi-Tool API Hub</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="security-tools-tabs">
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

        <form onSubmit={handleSubmit} className="security-tools-form">
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              className="security-input"
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
          <div className="api-categories">
            <div className="api-category">
              <h5>🔒 Security</h5>
              <ul>
                <li><strong>VirusTotal:</strong> File analysis (4 req/min)</li>
                <li><strong>AbuseIPDB:</strong> IP reputation (1000 req/day)</li>
                <li><strong>AlienVault OTX:</strong> Domain/URL reputation (free)</li>
                <li><strong>URLScan.io:</strong> URL scanning (free)</li>
                <li><strong>NVD:</strong> CVE database (free)</li>
              </ul>
            </div>
            <div className="api-category">
              <h5>🔍 Search</h5>
              <ul>
                <li><strong>Memex Marginalia:</strong> Alternative search (free)</li>
                <li><strong>Serpstack:</strong> Google results to JSON (free)</li>
                <li><strong>DuckDuckGo:</strong> Instant answers (free)</li>
              </ul>
            </div>
            <div className="api-category">
              <h5>🌑 Dark Web</h5>
              <ul>
                <li><strong>Darksearch.io:</strong> .onion site search (free)</li>
                <li><strong>Onion Lookup:</strong> Hidden service metadata (free)</li>
              </ul>
            </div>
            <div className="api-category">
              <h5>✈️ Aviation</h5>
              <ul>
                <li><strong>Aviation Stack:</strong> Flight data (100 req/month)</li>
                <li><strong>OpenSky Network:</strong> ADS-B data (free)</li>
                <li><strong>AviationAPI:</strong> FAA data (free)</li>
              </ul>
            </div>
          </div>
          <p className="api-note">
            <strong>Note:</strong> You'll need to add your API keys to make these tools functional.
          </p>
        </div>
      </div>
    </div>
  );
} 