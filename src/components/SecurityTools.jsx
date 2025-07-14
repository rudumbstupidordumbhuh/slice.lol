import { useState } from 'react';
import './WindowStyles.css';

export default function SecurityTools({ isOpen, onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('url');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'url', name: 'URL Scanner', icon: '🔗' },
    { id: 'ip', name: 'IP Reputation', icon: '🌐' },
    { id: 'domain', name: 'Domain Check', icon: '🏠' },
    { id: 'file', name: 'File Analysis', icon: '📁' }
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
        'API-Key': '0198068b-e9d0-7743-91b8-92554e0a774b' // Optional for public API
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
        'Key': '35cd736e3b5475dd41f4b98be65dbd2e7b07eaeebca45d487198f40a4097327f8c7e21ad2e601754',
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
        'x-apikey': 'd4feac2af1b31e26cf43b4368ef99cb7ab18dc049b9fc4c2062366e996a7df65'
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
      default:
        return 'Enter search term...';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="window-overlay">
      <div className="window-modal">
        <div className="window-titlebar">
          <div className="window-title">
            <span className="window-icon">🔒</span>
            Security Tools
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
                {loading ? 'Scanning...' : 'Scan'}
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
              <li><strong>VirusTotal:</strong> File analysis (4 req/min)</li>
              <li><strong>AbuseIPDB:</strong> IP reputation (1000 req/day)</li>
              <li><strong>AlienVault OTX:</strong> Domain/URL reputation (free)</li>
              <li><strong>URLScan.io:</strong> URL scanning (free)</li>
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