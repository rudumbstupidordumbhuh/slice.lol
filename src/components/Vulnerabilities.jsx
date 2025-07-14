import { useState } from 'react';
import BaseWindow from './BaseWindow';
import './WindowStyles.css';

export default function Vulnerabilities({ isOpen, onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('nvd');
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'nvd', name: 'NVD Database', icon: '🛡️' },
    { id: 'opencve', name: 'OpenCVE', icon: '📋' },
    { id: 'kevin', name: 'KEVin', icon: '⚠️' }
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
        case 'nvd':
          result = await searchNVD(input);
          break;
        case 'opencve':
          result = await searchOpenCVE(input);
          break;
        case 'kevin':
          result = await searchGTFOBins(input);
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

  const searchNVD = async (cveId) => {
    // NVD API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('NVD search failed');
    }

    const data = await response.json();
    return {
      type: 'nvd',
      data: {
        cveId: cveId,
        description: data.vulnerabilities?.[0]?.cve?.descriptions?.[0]?.value || 'No description',
        severity: data.vulnerabilities?.[0]?.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'Unknown',
        score: data.vulnerabilities?.[0]?.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 'Unknown',
        publishedDate: data.vulnerabilities?.[0]?.cve?.published || 'Unknown',
        searchEngine: 'NVD'
      }
    };
  };

  const searchOpenCVE = async (cveId) => {
    // OpenCVE API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://www.opencve.io/api/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('OpenCVE search failed');
    }

    const data = await response.json();
    return {
      type: 'opencve',
      data: {
        cveId: cveId,
        summary: data.summary || 'No summary',
        cvss: data.cvss || 'Unknown',
        references: data.references || [],
        vendors: data.vendors || [],
        searchEngine: 'OpenCVE'
      }
    };
  };

  const searchGTFOBins = async (cveId) => {
    // GTFOBins API (free) - using CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(`${corsProxy}https://kevin.gtfkd.com/api/v1/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.bu8f.online'
      }
    });

    if (!response.ok) {
      throw new Error('GTFOBins search failed');
    }

    const data = await response.json();
    return {
      type: 'gtfobins',
      data: {
        cveId: cveId,
        exploits: data.exploits || [],
        description: data.description || 'No description',
        references: data.references || [],
        searchEngine: 'GTFOBins'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'nvd') {
      return (
        <div className="results">
          <h3>NVD Vulnerability Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Description:</strong> {results.data.description}</p>
          <p><strong>Severity:</strong> {results.data.severity}</p>
          <p><strong>Score:</strong> {results.data.score}</p>
          <p><strong>Published Date:</strong> {results.data.publishedDate}</p>
        </div>
      );
    } else if (results.type === 'opencve') {
      return (
        <div className="results">
          <h3>OpenCVE Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Summary:</strong> {results.data.summary}</p>
          <p><strong>CVSS:</strong> {results.data.cvss}</p>
          {results.data.vendors && results.data.vendors.length > 0 && (
            <div className="vendors">
              <h4>Vendors:</h4>
              <ul>
                {results.data.vendors.map((vendor, index) => (
                  <li key={index}>{vendor}</li>
                ))}
              </ul>
            </div>
          )}
          {results.data.references.length > 0 && (
            <div className="references">
              <h4>References:</h4>
              <ul>
                {results.data.references.slice(0, 5).map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else if (results.type === 'gtfobins') {
      return (
        <div className="results">
          <h3>GTFOBins Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.searchEngine}</p>
          <p><strong>Description:</strong> {results.data.description}</p>
          <p><strong>Exploits:</strong> {results.data.exploits.length} found</p>
          {results.data.references.length > 0 && (
            <div className="references">
              <h4>References:</h4>
              <ul>
                {results.data.references.slice(0, 5).map((ref, index) => (
                  <li key={index}>{ref}</li>
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
      case 'nvd':
        return 'Enter CVE ID (e.g., CVE-2023-1234)';
      case 'opencve':
        return 'Enter CVE ID to search OpenCVE...';
      case 'kevin':
        return 'Enter CVE ID to check KEV status...';
      default:
        return 'Enter CVE ID...';
    }
  };

  return (
    <BaseWindow
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      title="Vulnerabilities"
      icon="🛡️"
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
              <li><strong>NVD:</strong> National Vulnerability Database (free)</li>
              <li><strong>OpenCVE:</strong> CVE information and tracking (free)</li>
              <li><strong>KEVin:</strong> Known Exploited Vulnerabilities (free)</li>
            </ul>
          </div>
        </div>
      </BaseWindow>
    );
  } 