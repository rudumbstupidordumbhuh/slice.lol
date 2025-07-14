import { useState } from 'react';
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
          result = await searchKEVin(input);
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

  const searchNVD = async (cveId) => {
    // National Vulnerability Database API (free)
    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('NVD search failed');
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

  const searchOpenCVE = async (cveId) => {
    // OpenCVE API (free)
    const response = await fetch(`https://www.opencve.io/api/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
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
        summary: data.summary || 'No summary available',
        cvss: data.cvss || {},
        references: data.references || [],
        source: 'OpenCVE'
      }
    };
  };

  const searchKEVin = async (cveId) => {
    // KEVin API (free)
    const response = await fetch(`https://kevin.gtfkd.com/api/v1/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('KEVin search failed');
    }

    const data = await response.json();
    return {
      type: 'kevin',
      data: {
        cveId: cveId,
        isExploited: data.is_exploited || false,
        dateAdded: data.date_added || 'Unknown',
        vendorProject: data.vendor_project || 'Unknown',
        product: data.product || 'Unknown',
        vulnerabilityName: data.vulnerability_name || 'Unknown',
        dateShortName: data.date_short_name || 'Unknown',
        requiredAction: data.required_action || 'Unknown',
        dueDate: data.due_date || 'Unknown',
        notes: data.notes || 'No notes available',
        source: 'KEVin'
      }
    };
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'cve') {
      return (
        <div className="results">
          <h3>NVD Vulnerability Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.source}</p>
          {results.data.vulnerability && (
            <>
              <p><strong>Description:</strong> {results.data.vulnerability.descriptions?.[0]?.value || 'No description'}</p>
              <p><strong>Severity:</strong> {results.data.vulnerability.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'Unknown'}</p>
              <p><strong>Published:</strong> {results.data.vulnerability.published || 'Unknown'}</p>
              <p><strong>Last Modified:</strong> {results.data.vulnerability.lastModified || 'Unknown'}</p>
            </>
          )}
        </div>
      );
    } else if (results.type === 'opencve') {
      return (
        <div className="results">
          <h3>OpenCVE Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.source}</p>
          <p><strong>Summary:</strong> {results.data.summary}</p>
          {results.data.cvss && Object.keys(results.data.cvss).length > 0 && (
            <div className="cvss-info">
              <h4>CVSS Information:</h4>
              <ul>
                {Object.entries(results.data.cvss).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
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
    } else if (results.type === 'kevin') {
      return (
        <div className="results">
          <h3>KEVin Results</h3>
          <p><strong>CVE ID:</strong> {results.data.cveId}</p>
          <p><strong>Source:</strong> {results.data.source}</p>
          <p><strong>Exploited:</strong> {results.data.isExploited ? 'Yes' : 'No'}</p>
          <p><strong>Vendor/Project:</strong> {results.data.vendorProject}</p>
          <p><strong>Product:</strong> {results.data.product}</p>
          <p><strong>Vulnerability Name:</strong> {results.data.vulnerabilityName}</p>
          <p><strong>Date Added:</strong> {results.data.dateAdded}</p>
          <p><strong>Required Action:</strong> {results.data.requiredAction}</p>
          <p><strong>Due Date:</strong> {results.data.dueDate}</p>
          {results.data.notes && (
            <p><strong>Notes:</strong> {results.data.notes}</p>
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

  if (!isOpen) return null;

  return (
    <div className="window-overlay">
      <div className="window-modal">
        <div className="window-titlebar">
          <div className="window-title">
            <span className="window-icon">🛡️</span>
            Vulnerabilities
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
              <li><strong>NVD:</strong> National Vulnerability Database (free)</li>
              <li><strong>OpenCVE:</strong> CVE information and tracking (free)</li>
              <li><strong>KEVin:</strong> Known Exploited Vulnerabilities (free)</li>
            </ul>
            <p className="api-note">
              <strong>Note:</strong> These tools provide vulnerability information for security research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 